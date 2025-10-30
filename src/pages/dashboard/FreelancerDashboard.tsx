import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats, getProjectsForFreelancer } from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DollarSign,
  FolderKanban,
  FileText,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Award,
  Bell,
  Calendar,
  BarChart3,
  Activity,
  MessageCircle,
} from 'lucide-react';
// recharts imports commented out for now - uncomment after npm install recharts
/*
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
*/

interface Stats {
  totalEarnings: number;
  activeProjects: number;
  completedProjects: number;
  pendingProposals: number;
  averageRating: number;
  totalReviews: number;
  successRate: number;
}

interface RecentProject {
  id: string;
  title: string;
  status: string;
  deadline: string;
  client_name: string;
  budget: number;
  progress: number;
}

interface EarningsData {
  month: string;
  earnings: number;
}

export function FreelancerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProposals: 0,
    averageRating: 0,
    totalReviews: 0,
    successRate: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadDashboardData();
  }, [profile, selectedPeriod]);

  const loadDashboardData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      
      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('FreelancerDashboard: Safety timeout triggered after 3 seconds');
        setLoading(false);
      }, 3000);

      const [statsData, projectsData] = await Promise.all([
        getDashboardStats(profile.id, 'freelancer'),
        getProjectsForFreelancer(profile.id),
      ]);

      clearTimeout(timeoutId);
      setStats({
        totalEarnings: statsData.totalEarnings || 0,
        activeProjects: statsData.activeProjects || 0,
        completedProjects: statsData.completedProjects || 0,
        pendingProposals: statsData.pendingProposals || 0,
        averageRating: statsData.averageRating || 0,
        totalReviews: statsData.totalReviews || 0,
        successRate: statsData.successRate || 0,
      });

      // Map projects data
      const mappedProjects = projectsData.slice(0, 5).map((p: any) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        deadline: p.deadline,
        client_name: p.profiles?.full_name || 'Unknown Client',
        budget: p.budget || 0,
        progress: p.progress || 0,
      }));

      setRecentProjects(mappedProjects);

      // Mock earnings data - replace with real query
      const mockEarnings = selectedPeriod === 'month' 
        ? Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, earnings: Math.floor(Math.random() * 5000) + 1000 }))
        : Array.from({ length: 12 }, (_, i) => ({ month: `Y${i + 1}`, earnings: Math.floor(Math.random() * 10000) + 2000 }));
      setEarningsData(mockEarnings);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-green-400 to-green-600',
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      change: '+2',
      icon: FolderKanban,
      color: 'from-blue-400 to-blue-600',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    },
    {
      title: 'Completed Projects',
      value: stats.completedProjects,
      change: '+5',
      icon: CheckCircle,
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    },
    {
      title: 'Pending Proposals',
      value: stats.pendingProposals,
      change: '-1',
      icon: FileText,
      color: 'from-orange-400 to-orange-600',
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
      in_progress: 'info',
      completed: 'success',
      open: 'warning',
      draft: 'default',
    };
    return variants[status] || 'default';
  };

  // Simple static earnings bar (replace with recharts once installed)
  const EarningsChart = () => (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
      <div className="space-y-2">
  {earningsData.slice(0, 6).map((data) => (
          <div key={data.month} className="flex items-center space-x-2">
            <span className="w-8 text-xs text-gray-600 font-medium">{data.month}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(data.earnings / Math.max(...earningsData.map(d => d.earnings))) * 100}%` }}
              ></div>
            </div>
            <span className="w-16 text-xs font-medium text-gray-900">${data.earnings.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-500">
        Switch to yearly view for full trends
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600 mt-2">Here's a quick overview of your freelance journey</p>
        </div>
        <div className="flex items-center space-x-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl">
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.floor(stats.averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
          <span className="text-sm text-gray-600">({stats.totalReviews} reviews)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-0 bg-white">
              <CardBody className="p-6 relative">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${stat.bg}`}></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800">{stat.title}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-indigo-600 transition-colors">{stat.value}</p>
                    <p className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last {selectedPeriod}
                    </p>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white drop-shadow-sm" />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Projects & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Chart */}
          <Card className="bg-white shadow-sm border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>Earnings Overview</span>
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod('month')}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={selectedPeriod === 'year' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod('year')}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    Yearly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {/* Use static bar instead of recharts */}
              <EarningsChart />
              {/* Uncomment below after installing recharts */}
              {/* 
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="url(#colorGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, stroke: '#c084fc', strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
              */}
            </CardBody>
          </Card>

          {/* Recent Projects */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>Recent Projects</span>
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {recentProjects.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                  <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600 text-lg font-medium">No projects yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Dive into opportunities by submitting proposals to open projects
                  </p>
                  <Button className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700">
                    Browse Projects
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-6 hover:bg-gray-50 transition-colors group flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"></div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 truncate">{project.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Client: {project.client_name}</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{project.progress}% Complete</p>
                      </div>
                      <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                        {project.deadline && (
                          <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                            <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                            {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${project.budget.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Budget</p>
                        </div>
                        <Badge variant={getStatusBadge(project.status)} className="ml-2">
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Quick Stats & Notifications & Boost */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="bg-white shadow-sm border-0 sticky top-6">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 p-6 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Performance Metrics</span>
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-bold text-lg text-green-600">{stats.successRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Total Clients</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-bold text-lg text-blue-600">{stats.totalReviews}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Avg. Response Time</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-bold text-lg text-purple-600">2.3h</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Notifications */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-6 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>Notifications</span>
              </h2>
            </CardHeader>
            <CardBody className="p-0 max-h-80 overflow-y-auto">
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">All caught up!</p>
              </div>
            </CardBody>
          </Card>

          {/* Boost Profile */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden border-0">
            <CardBody className="p-6 text-center relative">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
              <div className="relative z-10 space-y-3">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl">Elevate Your Profile</h3>
                <p className="opacity-90">Unlock premium opportunities by completing your profile and showcasing your skills</p>
                <div className="flex justify-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                </div>
                <Button className="bg-black text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 w-full shadow-lg transition-all group-hover:scale-105">
                  <MessageCircle className="w-4 h-4 mr-2 inline" />
                  Get Started
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}