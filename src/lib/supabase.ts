import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Diagnostic logging to help debug network/DNS issues (masked key)
try {
  console.debug('[supabase] VITE_SUPABASE_URL =', supabaseUrl);
  if (supabaseAnonKey) {
    const masked = `${String(supabaseAnonKey).slice(0, 8)}...${String(supabaseAnonKey).slice(-8)}`;
    console.debug('[supabase] VITE_SUPABASE_ANON_KEY (masked) =', masked);
  }
} catch (err) {
  // Logging should never block app initialization
  // eslint-disable-next-line no-console
  console.error('[supabase] error logging env vars', err);
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure a single Supabase client instance across HMR / multiple module evaluations
declare global {
  // allow attaching to globalThis in TypeScript
  // eslint-disable-next-line @typescript-eslint/no-namespace
  var __supabase_client__: any | undefined;
}

if (!(globalThis as any).__supabase_client__) {
  (globalThis as any).__supabase_client__ = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  });
}

export const supabase = (globalThis as any).__supabase_client__;

export type Profile = {
  id: string;
  role: 'freelancer' | 'client' | 'admin';
  full_name: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  company_name?: string;
  hourly_rate?: number;
  skills?: string[];
  availability_status?: 'online' | 'busy' | 'offline';
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  total_rating?: number;
  total_reviews?: number;
  total_earnings?: number;
  created_at?: string;
  updated_at?: string;
  // Calculated fields (not in DB)
  member_since?: string;
  completed_projects?: number;
};

export type Project = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget?: number;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  deadline?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
};

export type Milestone = {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  amount?: number;
  deadline?: string;
  is_completed: boolean;
  completed_at?: string;
  order_index: number;
  created_at?: string;
};

export type Proposal = {
  id: string;
  project_id: string;
  freelancer_id: string;
  budget: number;
  timeline: string;
  cover_letter: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type Invoice = {
  id: string;
  project_id: string;
  milestone_id?: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
  tax: number;
  service_charge: number;
  total_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  paid_at?: string;
  notes?: string;
  created_at?: string;
};

export type Message = {
  id: string;
  project_id?: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  is_read: boolean;
  read_at?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  created_at?: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at?: string;
};
