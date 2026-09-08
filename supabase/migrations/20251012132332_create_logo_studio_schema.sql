/*
  # javari Logo Studio Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User identifier
      - `email` (text, unique) - User email
      - `name` (text, nullable) - User display name
      - `image` (text, nullable) - Avatar URL
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `wallets`
      - `id` (uuid, primary key) - Wallet identifier
      - `user_id` (uuid, unique, foreign key) - Owner user
      - `balance` (integer) - Current credit balance
      - `created_at` (timestamptz) - Wallet creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `ledger_entries`
      - `id` (uuid, primary key) - Entry identifier
      - `wallet_id` (uuid, foreign key) - Associated wallet
      - `delta` (integer) - Credit change amount (positive or negative)
      - `description` (text) - Reason for transaction
      - `meta` (jsonb, nullable) - Additional metadata
      - `created_at` (timestamptz) - Transaction timestamp

    - `projects`
      - `id` (uuid, primary key) - Project identifier
      - `owner_id` (uuid, foreign key) - Creator user
      - `title` (text) - Project name
      - `visibility` (text) - Access level (PRIVATE, LINK, PUBLIC)
      - `status` (text) - Project status (DRAFT, ACTIVE, ARCHIVED)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `revisions`
      - `id` (uuid, primary key) - Revision identifier
      - `project_id` (uuid, foreign key) - Associated project
      - `svg` (text) - SVG source code
      - `editor_state` (jsonb) - Editor configuration
      - `preview_url` (text, nullable) - Preview image URL
      - `notes` (text, nullable) - Revision notes
      - `created_at` (timestamptz) - Revision timestamp

    - `assets`
      - `id` (uuid, primary key) - Asset identifier
      - `project_id` (uuid, foreign key) - Associated project
      - `kind` (text) - Asset type (UPLOAD, MOCKUP, EXPORT, FONT)
      - `url` (text) - Asset storage URL
      - `meta` (jsonb, nullable) - Asset metadata
      - `created_at` (timestamptz) - Upload timestamp

    - `orders`
      - `id` (uuid, primary key) - Order identifier
      - `user_id` (uuid, foreign key) - Buyer user
      - `provider` (text) - Payment provider (STRIPE, PAYPAL)
      - `amount` (integer) - Amount in cents
      - `currency` (text) - Currency code (USD, EUR, etc.)
      - `status` (text) - Order status (PENDING, COMPLETED, FAILED, REFUNDED)
      - `external_id` (text, nullable) - Provider transaction ID
      - `meta` (jsonb, nullable) - Order metadata
      - `created_at` (timestamptz) - Order timestamp

    - `subscriptions`
      - `id` (uuid, primary key) - Subscription identifier
      - `user_id` (uuid, foreign key) - Subscriber user
      - `provider` (text) - Payment provider (STRIPE, PAYPAL)
      - `external_id` (text) - Provider subscription ID
      - `status` (text) - Subscription status (ACTIVE, PAST_DUE, CANCELED)
      - `plan` (text) - Plan tier (FREE, STARTER, PRO, STUDIO)
      - `current_period_start` (timestamptz, nullable) - Billing period start
      - `current_period_end` (timestamptz, nullable) - Billing period end
      - `meta` (jsonb, nullable) - Subscription metadata
      - `created_at` (timestamptz) - Subscription creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `templates`
      - `id` (uuid, primary key) - Template identifier
      - `name` (text) - Template name
      - `category` (text) - Template category
      - `tags` (text array) - Searchable tags
      - `svg` (text) - Template SVG source
      - `thumb` (text) - Thumbnail URL
      - `is_featured` (boolean) - Featured flag
      - `created_at` (timestamptz) - Creation timestamp

    - `shares`
      - `id` (uuid, primary key) - Share identifier
      - `project_id` (uuid, foreign key) - Shared project
      - `email` (text, nullable) - Invitee email
      - `role` (text) - Access role (VIEW, COMMENT, EDIT, ADMIN)
      - `token` (text, unique) - Access token
      - `expires_at` (timestamptz, nullable) - Expiration timestamp
      - `created_at` (timestamptz) - Share creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for shared project access
    - Add admin policies for management operations

  3. Indexes
    - Index foreign keys for performance
    - Index commonly queried fields (email, status, timestamps)
*/

-- Create users table
-- 2026-09-07: the CREATE TABLE for public.users was removed.
-- auth.users is the single user table. public.users came from a starter
-- scaffold, held 29 rows that never logged in, and was retired. Recreating
-- it here would restore the second user population.


-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance integer DEFAULT 50 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ledger_entries table
CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  description text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Project',
  visibility text DEFAULT 'PRIVATE' NOT NULL,
  status text DEFAULT 'DRAFT' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create revisions table
CREATE TABLE IF NOT EXISTS revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  svg text NOT NULL,
  editor_state jsonb DEFAULT '{}' NOT NULL,
  preview_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind text NOT NULL,
  url text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  status text DEFAULT 'PENDING' NOT NULL,
  external_id text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_id text NOT NULL,
  status text DEFAULT 'ACTIVE' NOT NULL,
  plan text DEFAULT 'FREE' NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}' NOT NULL,
  svg text NOT NULL,
  thumb text NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email text,
  role text DEFAULT 'VIEW' NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_wallet_id ON ledger_entries(wallet_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_revisions_project_id ON revisions(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_project_id ON shares(project_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(token);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Wallets policies
CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own wallet balance"
  ON wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ledger entries policies
CREATE POLICY "Users can view own ledger entries"
  ON ledger_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = ledger_entries.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own ledger entries"
  ON ledger_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view shared projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shares
      WHERE shares.project_id = projects.id
      AND shares.email = (SELECT email FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Revisions policies
CREATE POLICY "Users can view revisions of own projects"
  ON revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = revisions.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert revisions to own projects"
  ON revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Assets policies
CREATE POLICY "Users can view assets of own projects"
  ON assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = assets.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert assets to own projects"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Templates policies (public read)
CREATE POLICY "Anyone can view templates"
  ON templates FOR SELECT
  TO authenticated
  USING (true);

-- Shares policies
CREATE POLICY "Users can view shares of own projects"
  ON shares FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shares.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert shares to own projects"
  ON shares FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shares of own projects"
  ON shares FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shares.project_id
      AND projects.owner_id = auth.uid()
    )
  );
