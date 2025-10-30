import { supabase, Project, Message, Profile, Proposal } from './supabase';

// Simple API wrapper for common DB operations and realtime subscriptions

export async function getProjects(options?: { search?: string; status?: string }) {
  const { search, status } = options || {};
  let query = supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(200);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    // basic ilike search on title and description
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('getProjects error', error);
    return [] as Project[];
  }
  return (data || []) as Project[];
}

export function subscribeToProjects(cb: (payload: any) => void) {
  const channel = supabase
    .channel('public:projects')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload: any) => cb(payload))
    .subscribe();

  return channel;
}

export async function createProject(project: Partial<Project>) {
  const { data, error } = await supabase.from('projects').insert([project]).select();
  if (error) throw error;
  return (data && data[0]) as Project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select();
  if (error) throw error;
  return (data && data[0]) as Project;
}

export async function getProfile(id: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) {
    console.error('getProfile error', error);
    return null;
  }
  return data as Profile;
}

export async function getMessagesForUser(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('getMessagesForUser error', error);
    return [] as Message[];
  }
  return (data || []) as Message[];
}

export async function getMessagesBetween(userId: string, otherId: string) {
  // messages where (sender=userId AND receiver=otherId) OR (sender=otherId AND receiver=userId)
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
    .limit(1000);

  if (error) {
    console.error('getMessagesBetween error', error);
    return [] as Message[];
  }
  return (data || []) as Message[];
}

export function subscribeToMessagesForUser(userId: string, cb: (payload: any) => void) {
  const channel = supabase
    .channel(`public:messages:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload: any) => {
      // only deliver messages relevant to user
      const msg = payload.new as Message | null;
      if (!msg) return cb(payload);
      if (msg.sender_id === userId || msg.receiver_id === userId) cb(payload);
    })
    .subscribe();

  return channel;
}

export async function sendMessage(payload: Partial<Message>) {
  const { data, error } = await supabase.from('messages').insert([payload]).select();
  if (error) throw error;
  return (data && data[0]) as Message;
}

export async function getFreelancers(limit = 50) {
  const { data, error } = await supabase
    .from<Profile>('profiles')
    .select('*')
    .eq('role', 'freelancer')
    .limit(limit);
  if (error) {
    console.error('getFreelancers error', error);
    return [] as Profile[];
  }
  return (data || []) as Profile[];
}

export async function getProposalsForProject(projectId: string) {
  const { data, error } = await supabase
    .from<Proposal>('proposals')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getProposalsForProject error', error);
    return [] as Proposal[];
  }
  return (data || []) as Proposal[];
}

export function subscribeToProposalsForProject(projectId: string, cb: (payload: any) => void) {
  const channel = supabase
    .channel(`public:proposals:${projectId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals', filter: `project_id=eq.${projectId}` }, (payload: any) => cb(payload))
    .subscribe();

  return channel;
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select();
  if (error) throw error;
  return (data && data[0]) as Profile;
}

export async function getProposalsForFreelancer(freelancerId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      projects(id, title, description, budget, status, deadline, category, client_id, profiles(full_name))
    `)
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getProposalsForFreelancer error', error);
    return [] as any[];
  }
  return (data || []) as any[];
}

export async function getProposalsForClient(clientId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      projects!proposals_project_id_fkey(id, title, description, budget, status, deadline, category),
      profiles!proposals_freelancer_id_fkey(full_name, skills, total_rating, total_reviews)
    `)
    .eq('projects.client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getProposalsForClient error', error);
    return [] as any[];
  }
  return (data || []) as any[];
}

export function subscribeToProposalsForFreelancer(freelancerId: string, cb: (payload: any) => void) {
  const channel = supabase
    .channel(`public:proposals:${freelancerId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals', filter: `freelancer_id=eq.${freelancerId}` }, (payload: any) => cb(payload))
    .subscribe();

  return channel;
}

export async function createProposal(proposal: Partial<any>) {
  const { data, error } = await supabase.from('proposals').insert([proposal]).select();
  if (error) throw error;
  return (data && data[0]) as any;
}

export async function acceptProposal(proposalId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .update({ status: 'accepted' })
    .eq('id', proposalId)
    .select();
  if (error) throw error;
  return (data && data[0]) as any;
}

export async function rejectProposal(proposalId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .update({ status: 'rejected' })
    .eq('id', proposalId)
    .select();
  if (error) throw error;
  return (data && data[0]) as any;
}

export async function createInvoice(invoice: Partial<any>) {
  const { data, error } = await supabase.from('invoices').insert([invoice]).select();
  if (error) throw error;
  return (data && data[0]) as any;
}

export async function getReviewsForUser(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      projects(title),
      profiles!reviews_reviewer_id_fkey(full_name),
      profiles!reviews_reviewee_id_fkey(full_name)
    `)
    .or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getReviewsForUser error', error);
    return [] as any[];
  }
  return (data || []) as any[];
}

export function subscribeToReviews(userId: string, cb: (payload: any) => void) {
  const channel = supabase
    .channel(`public:reviews:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, (payload: any) => {
      const review = payload.new as any;
      if (review && (review.reviewer_id === userId || review.reviewee_id === userId)) cb(payload);
    })
    .subscribe();

  return channel;
}

export async function getInvoicesForUser(userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      projects(title),
      profiles!invoices_client_id_fkey(full_name),
      profiles!invoices_freelancer_id_fkey(full_name)
    `)
    .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getInvoicesForUser error', error);
    return [] as any[];
  }
  return (data || []) as any[];
}

export function subscribeToInvoices(userId: string, cb: (payload: any) => void) {
  const channel = supabase
    .channel(`public:invoices:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, (payload: any) => {
      const invoice = payload.new as any;
      if (invoice && (invoice.client_id === userId || invoice.freelancer_id === userId)) cb(payload);
    })
    .subscribe();

  return channel;
}

export async function getNotificationsForUser(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error('getNotificationsForUser error', error);
    return [] as any[];
  }
  return (data || []) as any[];
}

export function subscribeToNotifications(userId: string, cb: (payload: any) => void) {
  const channel = supabase
    .channel(`public:notifications:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload: any) => cb(payload))
    .subscribe();

  return channel;
}

export async function markNotificationRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select();
  if (error) throw error;
  return (data && data[0]) as any;
}

export async function getProjectsForClient(clientId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members(count)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getProjectsForClient error', error);
    return [] as any[];
  }
  return (data || []) as any[];
}

export async function getProjectsForFreelancer(freelancerId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      project_id,
      projects(*)
    `)
    .eq('freelancer_id', freelancerId);
  if (error) {
    console.error('getProjectsForFreelancer error', error);
    return [] as any[];
  }
  return (data || []).map((item: any) => item.projects);
}

export async function getDashboardStats(userId: string, role: 'freelancer' | 'client') {
  if (role === 'client') {
    const [projects, invoices] = await Promise.all([
      getProjectsForClient(userId),
      getInvoicesForUser(userId),
    ]);

    const activeProjects = projects.filter((p: any) => p.status === 'in_progress').length;
    const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
    const totalSpent = invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
    const pendingInvoices = invoices.filter((i: any) => i.status === 'pending' || i.status === 'overdue').length;
    const totalFreelancers = new Set(projects.flatMap((p: any) => p.project_members || [])).size;

    return {
      totalSpent,
      activeProjects,
      completedProjects,
      totalFreelancers,
      pendingInvoices,
    };
  } else {
    const [projects, proposals, profile] = await Promise.all([
      getProjectsForFreelancer(userId),
      getProposalsForFreelancer(userId),
      getProfile(userId),
    ]);

    const activeProjects = projects.filter((p: any) => p.status === 'in_progress').length;
    const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
    const pendingProposals = proposals.filter((p: any) => p.status === 'pending').length;
    const totalEarnings = profile?.total_earnings || 0;
    const averageRating = profile?.total_reviews && profile.total_rating ? profile.total_rating / profile.total_reviews : 0;
    const totalReviews = profile?.total_reviews || 0;
    const successRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;

    return {
      totalEarnings,
      activeProjects,
      completedProjects,
      pendingProposals,
      averageRating,
      totalReviews,
      successRate,
    };
  }
}
