import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getInvoicesForUser, subscribeToInvoices, createInvoice } from "../lib/api";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  FileText,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  Plus,
  X,
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  project_title: string;
  client_name?: string;
  freelancer_name?: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
  description: string;
}

interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
}

export function Invoices() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    project_id: '',
    amount: '',
    due_date: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadInvoices();

    // realtime subscription
    const channel = subscribeToInvoices(profile.id, (_payload: any) => {
      // when invoices change, reload list
      loadInvoices();
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Invoices page safety timeout reached, setting loading to false');
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

  const loadInvoices = async () => {
    if (!profile) return;

    try {
      const data = await getInvoicesForUser(profile.id);
      // Map API response to local interface
      const mapped = data.map((i: any) => ({
        id: i.id,
        invoice_number: i.invoice_number,
        project_title: i.projects?.title || 'Unknown Project',
        client_name: profile.role === 'freelancer' ? i.profiles?.full_name : undefined,
        freelancer_name: profile.role === 'client' ? i.profiles?.full_name : undefined,
        amount: i.amount,
        status: i.status,
        due_date: i.due_date,
        created_at: i.created_at,
        description: i.description || '',
      }));

      setInvoices(mapped);

      // Calculate stats
      const total = mapped.length;
      const paid = mapped.filter((i) => i.status === 'paid').length;
      const pending = mapped.filter((i) => i.status === 'pending').length;
      const overdue = mapped.filter((i) => i.status === 'overdue').length;
      const totalAmount = mapped.reduce((sum, i) => sum + i.amount, 0);

      setStats({ total, paid, pending, overdue, totalAmount });
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.client_name &&
        invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.freelancer_name &&
        invoice.freelancer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "success" | "warning" | "error" | "default"
    > = {
      paid: "success",
      pending: "warning",
      overdue: "error",
      cancelled: "default",
      draft: "default",
    };
    return variants[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateInvoice = async () => {
    if (!profile) return;

    setCreating(true);
    try {
      await createInvoice({
        project_id: createForm.project_id,
        freelancer_id: profile.id,
        client_id: null, // Will be set based on project
        amount: parseFloat(createForm.amount),
        tax: 0,
        service_charge: 0,
        total_amount: parseFloat(createForm.amount),
        status: 'draft',
        due_date: createForm.due_date,
        notes: createForm.description,
      });

      setCreateForm({
        project_id: '',
        amount: '',
        due_date: '',
        description: '',
      });
      setShowCreateModal(false);
      // Invoices will reload via realtime subscription
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setCreating(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">
            {profile?.role === "client"
              ? "Manage your project payments"
              : "Track your earnings and payments"}
          </p>
        </div>
        {profile?.role === "freelancer" && (
          <Button size="lg" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Invoice
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
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
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overdue}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
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
                  placeholder="Search invoices..."
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
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No invoices found</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : profile?.role === "freelancer"
                  ? "Create your first invoice to get started"
                  : "Invoices will appear here once projects are completed"}
              </p>
              {profile?.role === "freelancer" &&
                !searchTerm &&
                statusFilter === "all" && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                )}
            </CardBody>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} hover className="group">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {invoice.invoice_number}
                      </h3>
                      <Badge
                        variant={getStatusBadge(invoice.status)}
                        className="flex items-center space-x-1"
                      >
                        {getStatusIcon(invoice.status)}
                        <span className="capitalize">{invoice.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {invoice.project_title}
                      </div>
                      {invoice.client_name && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {invoice.client_name}
                        </div>
                      )}
                      {invoice.freelancer_name && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {invoice.freelancer_name}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Created:{" "}
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </span>
                        {invoice.due_date && (
                          <span
                            className={`flex items-center ${
                              getDaysUntilDue(invoice.due_date) < 0
                                ? "text-red-600"
                                : getDaysUntilDue(invoice.due_date) <= 7
                                ? "text-orange-600"
                                : ""
                            }`}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Due:{" "}
                            {new Date(invoice.due_date).toLocaleDateString()}
                            {getDaysUntilDue(invoice.due_date) >= 0 && (
                              <span className="ml-1">
                                ({getDaysUntilDue(invoice.due_date)} days left)
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${invoice.amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Invoice</h2>
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
                    Project
                  </label>
                  <select
                    value={createForm.project_id}
                    onChange={(e) => setCreateForm({ ...createForm, project_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a project</option>
                    {/* TODO: Load user's active/completed projects */}
                    <option value="project-1">Sample Project 1</option>
                    <option value="project-2">Sample Project 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={createForm.due_date}
                    onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
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
                    placeholder="Describe the work completed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
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
                  onClick={handleCreateInvoice}
                  disabled={creating || !createForm.project_id || !createForm.amount || !createForm.due_date}
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Invoice
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
