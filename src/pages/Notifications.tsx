import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNotificationsForUser, subscribeToNotifications, markNotificationRead } from '../lib/api';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Bell,
  CheckCircle,
  X,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Calendar,
  Filter,
  Star,
  Settings,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'message' | 'payment' | 'project' | 'review' | 'system';
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

export function Notifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, today: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [showRead, setShowRead] = useState(true);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadNotifications();

    // realtime subscription
    const channel = subscribeToNotifications(profile.id, (_payload: any) => {
      // when notifications change, reload list
      loadNotifications();
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Notifications page safety timeout reached, setting loading to false');
      setLoading(false);
    }, 3000); // 3 seconds

    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        // ignore
      }
      clearTimeout(timeout);
    };
  }, [profile]);

  const loadNotifications = async () => {
    if (!profile) return;

    try {
      const data = await getNotificationsForUser(profile.id);
      // Map API response to local interface
      const mapped = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type as 'info' | 'success' | 'warning' | 'error',
        category: n.category as 'message' | 'payment' | 'project' | 'review' | 'system',
        read: n.read,
        created_at: n.created_at,
        action_url: n.action_url,
      }));

      setNotifications(mapped);

      // Calculate stats
      const total = mapped.length;
      const unread = mapped.filter(n => !n.read).length;
      const today = mapped.filter(n => {
        const today = new Date();
        const notificationDate = new Date(n.created_at);
        return notificationDate.toDateString() === today.toDateString();
      }).length;
      const thisWeek = mapped.filter(n => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(n.created_at) > weekAgo;
      }).length;

      setStats({ total, unread, today, thisWeek });
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      // Update stats
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setStats(prev => ({ ...prev, unread: 0 }));
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setStats(prev => ({ ...prev, total: prev.total - 1 }));
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.category === filterType;
    const matchesRead = showRead || !notification.read;
    return matchesType && matchesRead;
  });

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'message': return <MessageSquare className="w-5 h-5" />;
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'project': return <Calendar className="w-5 h-5" />;
      case 'review': return <Star className="w-5 h-5" />;
      case 'system': return <Settings className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your latest activities</p>
        </div>
        <div className="flex items-center space-x-2">
          {stats.unread > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('message')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'message'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setFilterType('project')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'project'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setFilterType('payment')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'payment'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Payments
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showRead}
                  onChange={(e) => setShowRead(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Show read notifications</span>
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No notifications found</p>
              <p className="text-sm text-gray-500 mt-1">
                {filterType !== 'all' || !showRead
                  ? 'Try adjusting your filters'
                  : 'You\'re all caught up!'
                }
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              hover
              className={`transition-all ${!notification.read ? 'border-l-4 border-l-purple-600 bg-purple-50/50' : ''}`}
            >
              <CardBody>
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                    {getNotificationIcon(notification.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{notification.message}</p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 rounded-full hover:bg-gray-100 text-purple-600"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-600"
                            title="Delete notification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {notification.action_url && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.history.pushState({}, '', notification.action_url);
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}