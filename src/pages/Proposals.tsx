import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProposalsForFreelancer, subscribeToProposalsForFreelancer, createProposal, getProposalsForClient, acceptProposal, rejectProposal } from "../lib/api";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  FileText,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Send,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";

interface Proposal {
  id: string;
  project_id: string;
  project_title: string;
  project_budget: number;
  project_deadline: string;
  client_name?: string; // For freelancer view
  freelancer_name?: string; // For client view
  freelancer_skills?: string[];
  freelancer_rating?: number;
  freelancer_reviews?: number;
  status: string;
  proposed_budget: number;
  proposed_deadline: string;
  cover_letter: string;
  created_at: string;
  updated_at: string;
}

interface ProposalStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export function Proposals() {
  const { profile } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadProposals();

    // realtime subscription
    const channel = subscribeToProposalsForFreelancer(profile.id, (_payload: any) => {
      // when proposals change, reload list
      loadProposals();
    });

    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        // ignore
      }
    };
  }, [profile]);

  const loadProposals = async () => {
    if (!profile) return;

    try {
      let data;
      if (profile.role === 'freelancer') {
        data = await getProposalsForFreelancer(profile.id);
        // Map API response to local interface for freelancers
        const mapped = data.map((p: any) => ({
          id: p.id,
          project_id: p.project_id,
          project_title: p.projects?.title || 'Unknown Project',
          project_budget: p.projects?.budget || 0,
          project_deadline: p.projects?.deadline || '',
          client_name: p.projects?.profiles?.full_name || 'Unknown Client',
          status: p.status,
          proposed_budget: p.budget,
          proposed_deadline: p.timeline,
          cover_letter: p.cover_letter,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
        setProposals(mapped);
      } else {
        data = await getProposalsForClient(profile.id);
        // Map API response to local interface for clients
        const mapped = data.map((p: any) => ({
          id: p.id,
          project_id: p.project_id,
          project_title: p.projects?.title || 'Unknown Project',
          project_budget: p.projects?.budget || 0,
          project_deadline: p.projects?.deadline || '',
          freelancer_name: p.profiles?.full_name || 'Unknown Freelancer',
          freelancer_skills: p.profiles?.skills || [],
          freelancer_rating: p.profiles?.total_rating || 0,
          freelancer_reviews: p.profiles?.total_reviews || 0,
          status: p.status,
          proposed_budget: p.budget,
          proposed_deadline: p.timeline,
          cover_letter: p.cover_letter,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
        setProposals(mapped);
      }

      // Calculate stats
      const total = data.length;
      const pending = data.filter((p: any) => p.status === 'pending').length;
      const accepted = data.filter((p: any) => p.status === 'accepted').length;
      const rejected = data.filter((p: any) => p.status === 'rejected').length;

      setStats({ total, pending, accepted, rejected });
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    const searchFields = [
      proposal.project_title,
      proposal.client_name,
      proposal.freelancer_name,
    ].filter(Boolean); // Remove undefined values

    const matchesSearch = searchTerm === "" ||
      searchFields.some(field =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "success" | "warning" | "error" | "default"
    > = {
      pending: "warning",
      accepted: "success",
      rejected: "error",
      expired: "default",
    };
    return variants[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await acceptProposal(proposalId);
      // Proposals will reload via realtime subscription
    } catch (error) {
      console.error('Error accepting proposal:', error);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await rejectProposal(proposalId);
      // Proposals will reload via realtime subscription
    } catch (error) {
      console.error('Error rejecting proposal:', error);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">
            {profile?.role === 'freelancer' ? 'My Proposals' : 'Project Proposals'}
          </h1>
          <p className="text-gray-600 mt-1">
            {profile?.role === 'freelancer'
              ? 'Track and manage your project proposals'
              : 'Review and respond to freelancer proposals'
            }
          </p>
        </div>
        {profile?.role === 'freelancer' && (
          <Button size="lg">
            <Send className="w-5 h-5 mr-2" />
            Submit New Proposal
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.accepted}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rejected}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
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
                  placeholder="Search proposals..."
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
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No proposals found</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by submitting proposals to available projects"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Browse Projects
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          filteredProposals.map((proposal) => (
            <Card key={proposal.id} hover className="group">
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {proposal.project_title}
                      </h3>
                      <Badge
                        variant={getStatusBadge(proposal.status)}
                        className="flex items-center space-x-1"
                      >
                        {getStatusIcon(proposal.status)}
                        <span className="capitalize">{proposal.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      {profile?.role === 'freelancer' ? (
                        <>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {proposal.client_name}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Proposed: ${proposal.proposed_budget?.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Submitted{" "}
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {proposal.freelancer_name}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Proposed: ${proposal.proposed_budget?.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Submitted{" "}
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Project Budget: $
                          {proposal.project_budget?.toLocaleString()}
                        </span>
                        {proposal.project_deadline && (
                          <span>
                            Deadline:{" "}
                            {new Date(
                              proposal.project_deadline
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {profile?.role === 'freelancer' ? (
                          <>
                            {proposal.status === "pending" && (
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            )}
                            {proposal.status === "accepted" && (
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Message Client
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            {proposal.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRejectProposal(proposal.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleAcceptProposal(proposal.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
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
