/*
  # Earnings Table for Revenue Sharing

  This migration adds a new table to track earnings and revenue sharing between
  the platform and content creators.

  1. New Table
    - `earnings`: Records revenue details for each transaction
      - Tracks amounts for platform fees and author earnings
      - Links to users, projects, and payment records
      - Adds tracking for payment status and currency

  2. Security
    - Enables Row Level Security (RLS)
    - Implements policies for users to view their own earnings
    - Secures financial information
*/

-- Create earnings table
CREATE TABLE IF NOT EXISTS earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_id text NOT NULL,
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  platform_fee decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  payment_intent_id text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  currency text NOT NULL DEFAULT 'usd',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(payment_intent_id, user_id)
);

-- Create index for better query performance
CREATE INDEX idx_earnings_user_id ON earnings(user_id);
CREATE INDEX idx_earnings_project_id ON earnings(project_id);
CREATE INDEX idx_earnings_created_at ON earnings(created_at);
CREATE INDEX idx_earnings_status ON earnings(status);

-- Enable Row Level Security
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own earnings
CREATE POLICY "Users can view their own earnings"
  ON earnings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for admins to view all earnings
CREATE POLICY "Admins can view all earnings"
  ON earnings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create trigger to update the updated_at column
CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add fields to downloads table if they don't exist yet
DO $$ 
BEGIN
  -- Check if the amount_paid column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'downloads' AND column_name = 'amount_paid'
  ) THEN
    ALTER TABLE downloads ADD COLUMN amount_paid decimal(10,2);
  END IF;

  -- Check if the stripe_payment_id column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'downloads' AND column_name = 'stripe_payment_id'
  ) THEN
    ALTER TABLE downloads ADD COLUMN stripe_payment_id text;
  END IF;
END $$; 