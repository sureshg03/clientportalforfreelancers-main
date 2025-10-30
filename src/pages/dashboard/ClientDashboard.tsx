import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats, getProjectsForClient } from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DollarSign,
  FolderKanban,
  Users,
  FileText,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Stats {
  totalSpent: number;
  activeProjects: number;
  completedProjects: number;
  totalFreelancers: number;
  pendingInvoices: number;
}

interface RecentProject {
  id: string;
  title: string;
  status: string;
  budget: number;
  deadline: string;
  freelancer_count: number;
}

export function ClientDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalSpent: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalFreelancers: 0,
    pendingInvoices: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    try {
      const [statsData, projectsData] = await Promise.all([
        getDashboardStats(profile.id, 'client'),
        getProjectsForClient(profile.id),
      ]);

      setStats({
        totalSpent: statsData.totalSpent || 0,
        activeProjects: statsData.activeProjects || 0,
        completedProjects: statsData.completedProjects || 0,
        totalFreelancers: statsData.totalFreelancers || 0,
        pendingInvoices: statsData.pendingInvoices || 0,
      });

      // Map projects data
      const mappedProjects = projectsData.map((p: any) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        budget: p.budget,
        deadline: p.deadline,
        freelancer_count: p.project_members?.length || 0,
      }));

      setRecentProjects(mappedProjects);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Spent',
      value: `$${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderKanban,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Total Freelancers',
      value: stats.totalFreelancers,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">Manage your projects and team</p>
        </div>
        <Button size="lg">
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} hover>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardBody>
              {recentProjects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No projects yet</p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Create your first project to get started
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">
                            Budget: ${project.budget?.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {project.freelancer_count} freelancer{project.freelancer_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {project.deadline && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        )}
                        <Badge variant={getStatusBadge(project.status)}>
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900">Overview</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <FolderKanban className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm text-gray-700">In Progress</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.activeProjects}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.completedProjects}</span>
              </div>
              {stats.pendingInvoices > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="text-sm text-gray-700">Pending Invoices</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.pendingInvoices}</span>
                </div>
              )}
            </CardBody>
          </Card>

          <Card glass className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <CardBody>
              <Users className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Find Talent</h3>
              <p className="text-sm opacity-90 mb-4">
                Browse our network of skilled freelancers to complete your projects
              </p>
              <button
                className="bg-white text-purple-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors w-full"
                onClick={() => {
                  window.history.pushState({}, "", "/freelancers");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                Browse Freelancers
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
