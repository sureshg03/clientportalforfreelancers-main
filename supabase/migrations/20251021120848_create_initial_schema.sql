/*
  # Client Portal Initial Schema
  
  ## Overview
  Complete database schema for a freelancer-client collaboration portal with project management,
  billing, communication, and analytics capabilities.
  
  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, FK to auth.users)
  - `role` (text: 'freelancer' or 'client')
  - `full_name` (text)
  - `avatar_url` (text)
  - `banner_url` (text)
  - `bio` (text)
  - `company_name` (text, for clients)
  - `hourly_rate` (numeric, for freelancers)
  - `skills` (text array, for freelancers)
  - `availability_status` (text: 'online', 'busy', 'offline')
  - `linkedin_url`, `github_url`, `portfolio_url` (text)
  - `created_at`, `updated_at` (timestamptz)
  
  ### 2. projects
  - `id` (uuid, primary key)
  - `client_id` (uuid, FK to profiles)
  - `title`, `description` (text)
  - `budget` (numeric)
  - `status` (text: 'draft', 'open', 'in_progress', 'completed', 'cancelled')
  - `deadline` (timestamptz)
  - `category` (text)
  - `created_at`, `updated_at` (timestamptz)
  
  ### 3. project_members
  - Links freelancers to projects with their role
  
  ### 4. milestones
  - Project milestones with completion tracking
  
  ### 5. proposals
  - Freelancer proposals for projects
  
  ### 6. contracts
  - Generated contracts from accepted proposals
  
  ### 7. invoices
  - Invoice tracking with payment status
  
  ### 8. messages
  - Real-time chat messages
  
  ### 9. notifications
  - User notification system
  
  ### 10. reviews
  - Ratings and feedback system
  
  ### 11. tasks
  - Task tracking with time logs
  
  ### 12. documents
  - Centralized file management
  
  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users based on role and ownership
*/

-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('freelancer', 'client', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM ('online', 'busy', 'offline');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'freelancer',
  full_name text NOT NULL,
  avatar_url text,
  banner_url text,
  bio text,
  company_name text,
  hourly_rate numeric(10, 2),
  skills text[],
  availability_status availability_status DEFAULT 'offline',
  linkedin_url text,
  github_url text,
  portfolio_url text,
  total_rating numeric(3, 2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_earnings numeric(12, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  budget numeric(12, 2),
  status project_status DEFAULT 'draft',
  deadline timestamptz,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project members (freelancers assigned to projects)
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(project_id, freelancer_id)
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  amount numeric(12, 2),
  deadline timestamptz,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  budget numeric(12, 2) NOT NULL,
  timeline text NOT NULL,
  cover_letter text NOT NULL,
  status proposal_status DEFAULT 'pending',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  terms text NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_signed boolean DEFAULT false,
  signed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  tax numeric(12, 2) DEFAULT 0,
  service_charge numeric(12, 2) DEFAULT 0,
  total_amount numeric(12, 2) NOT NULL,
  status invoice_status DEFAULT 'draft',
  due_date timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, reviewer_id, reviewee_id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo',
  priority text DEFAULT 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Time logs
CREATE TABLE IF NOT EXISTS time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_minutes integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  version integer DEFAULT 1,
  parent_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Badges (Gamification)
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Users can view projects they're involved in"
  ON projects FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    status = 'open' OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.freelancer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Clients can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- RLS Policies for project_members
CREATE POLICY "Users can view project members of their projects"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND (projects.client_id = auth.uid() OR projects.status = 'open')
    ) OR
    freelancer_id = auth.uid()
  );

CREATE POLICY "Clients can add project members"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can remove project members"
  ON project_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- RLS Policies for milestones
CREATE POLICY "Users can view milestones of their projects"
  ON milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = milestones.project_id
      AND (
        projects.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.freelancer_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Clients can manage milestones"
  ON milestones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = milestones.project_id
      AND projects.client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = milestones.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- RLS Policies for proposals
CREATE POLICY "Users can view proposals they're involved in"
  ON proposals FOR SELECT
  TO authenticated
  USING (
    freelancer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = proposals.project_id
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can create proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    freelancer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'freelancer')
  );

CREATE POLICY "Freelancers can update own proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (freelancer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid());

-- RLS Policies for contracts
CREATE POLICY "Users can view contracts they're involved in"
  ON contracts FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR freelancer_id = auth.uid());

CREATE POLICY "System can create contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid() OR freelancer_id = auth.uid());

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices they're involved in"
  ON invoices FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR freelancer_id = auth.uid());

CREATE POLICY "Freelancers can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Users can update invoices they're involved in"
  ON invoices FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() OR freelancer_id = auth.uid())
  WITH CHECK (client_id = auth.uid() OR freelancer_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages they're involved in"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = messages.project_id
      AND project_members.freelancer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR receiver_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Users can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks of their projects"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.freelancer_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage tasks of their projects"
  ON tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.freelancer_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.freelancer_id = auth.uid()
        )
      )
    )
  );

-- RLS Policies for time_logs
CREATE POLICY "Users can view time logs of their projects"
  ON time_logs FOR SELECT
  TO authenticated
  USING (
    freelancer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      WHERE tasks.id = time_logs.task_id
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can create time logs"
  ON time_logs FOR INSERT
  TO authenticated
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Freelancers can update own time logs"
  ON time_logs FOR UPDATE
  TO authenticated
  USING (freelancer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid());

-- RLS Policies for documents
CREATE POLICY "Users can view documents of their projects"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND (
        projects.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_members.project_id = projects.id
          AND project_members.freelancer_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can upload documents to their projects"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for badges
CREATE POLICY "Users can view all badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create badges"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_freelancer_id ON project_members(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_freelancer_id ON invoices(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_freelancer_id ON time_logs(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);