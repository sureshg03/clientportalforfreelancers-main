import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProjects, getProjectsForClient, getProjectsForFreelancer, subscribeToProjects, createProject, updateProject } from "../lib/api";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  DollarSign,
  MoreVertical,
  Edit,
  Eye,
  Calendar,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  X,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  deadline: string;
  category: string;
  created_at: string;
  freelancer_count: number;
  progress: number;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
}

export function Projects() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    status: '',
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadProjects();

    // realtime subscription
    const channel = subscribeToProjects((_payload: any) => {
      // when projects change, reload list
      loadProjects();
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Projects page safety timeout reached, setting loading to false');
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

  const loadProjects = async () => {
    if (!profile) return;

    try {
      let data: any[] = [];
      
      // Use role-specific functions to get only relevant projects
      if (profile.role === 'client') {
        data = await getProjectsForClient(profile.id);
      } else if (profile.role === 'freelancer') {
        data = await getProjectsForFreelancer(profile.id);
      } else {
        // Fallback to generic function if role is unknown
        data = await getProjects({ search: searchTerm, status: statusFilter });
      }
      
      // Map DB rows into local shape (adding simple derived fields)
      const mapped = data.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        budget: p.budget || 0,
        deadline: p.deadline || '',
        category: p.category || '',
        created_at: p.created_at || '',
        freelancer_count: 0,
        progress: 0,
      }));

      setProjects(mapped);

      // Calculate stats
      const total = mapped.length;
      const active = mapped.filter((p) => p.status === 'in_progress').length;
      const completed = mapped.filter((p) => p.status === 'completed').length;
      const draft = mapped.filter((p) => p.status === 'draft').length;

      setStats({ total, active, completed, draft });
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "info" | "default"> =
      {
        in_progress: "info",
        completed: "success",
        open: "warning",
        draft: "default",
        cancelled: "default",
      };
    return variants[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <PlayCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "open":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FolderKanban className="w-4 h-4" />;
    }
  };

  const handleCreateProject = async () => {
    if (!profile) return;

    setCreating(true);
    try {
      await createProject({
        title: createForm.title,
        description: createForm.description,
        budget: parseFloat(createForm.budget) || 0,
        deadline: createForm.deadline || undefined,
        category: createForm.category,
        client_id: profile.id,
        status: 'draft',
      });

      setCreateForm({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: '',
      });
      setShowCreateModal(false);
      // Projects will reload via realtime subscription
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditForm({
      title: project.title,
      description: project.description,
      budget: project.budget?.toString() || '',
      deadline: project.deadline || '',
      category: project.category || '',
      status: project.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    setEditing(true);
    try {
      await updateProject(selectedProject.id, {
        title: editForm.title,
        description: editForm.description,
        budget: parseFloat(editForm.budget) || 0,
        deadline: editForm.deadline || undefined,
        category: editForm.category,
        status: editForm.status as 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled',
      });

      setShowEditModal(false);
      setSelectedProject(null);
      // Projects will reload via realtime subscription
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setEditing(false);
    }
  };

  const handleViewProject = (project: Project) => {
    // TODO: Navigate to project detail page
    console.log('View project:', project.id);
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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your projects and track progress
          </p>
        </div>
        <Button size="lg" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.draft}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Edit className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardBody className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No projects found</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first project to get started"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} hover className="group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge
                      variant={getStatusBadge(project.status)}
                      className="flex items-center space-x-1"
                    >
                      {getStatusIcon(project.status)}
                      <span>{project.status.replace("_", " ")}</span>
                    </Badge>
                    <div className="relative">
                      <button className="p-1 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  {project.status === "in_progress" && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />$
                      {project.budget?.toLocaleString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {project.freelancer_count} freelancer
                      {project.freelancer_count !== 1 ? "s" : ""}
                    </div>
                    {project.deadline && (
                      <>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(project.deadline).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.ceil(
                            (new Date(project.deadline).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days left
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewProject(project)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProject(project)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title
                  </label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Describe your project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget ($)
                    </label>
                    <Input
                      type="number"
                      value={createForm.budget}
                      onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="web-development">Web Development</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="design">Design</option>
                      <option value="writing">Writing</option>
                      <option value="marketing">Marketing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <Input
                    type="date"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={creating || !createForm.title.trim() || !createForm.description.trim()}
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Describe your project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget ($)
                    </label>
                    <Input
                      type="number"
                      value={editForm.budget}
                      onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="web-development">Web Development</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="design">Design</option>
                      <option value="writing">Writing</option>
                      <option value="marketing">Marketing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <Input
                      type="date"
                      value={editForm.deadline}
                      onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={editing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProject}
                  disabled={editing || !editForm.title.trim() || !editForm.description.trim()}
                >
                  {editing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
