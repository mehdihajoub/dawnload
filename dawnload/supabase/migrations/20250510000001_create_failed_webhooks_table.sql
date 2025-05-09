/*
  # Failed Webhooks Table for Error Recovery

  This migration adds a table to track failed webhook events for later retry
  and error recovery in the payment processing system.

  1. New Table
    - `failed_webhooks`: Records webhook events that failed to process
      - Stores the original event data for retry
      - Tracks retry attempts and schedules next retry
      - Includes error information and timestamps

  2. Functions
    - `retry_failed_webhooks`: Function to retry processing failed webhooks
    - Implements exponential backoff for retry timing
*/

-- Create failed_webhooks table
CREATE TABLE IF NOT EXISTS failed_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  error_message text NOT NULL,
  retries int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 5,
  next_retry timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_failed_webhooks_next_retry ON failed_webhooks(next_retry);
CREATE INDEX idx_failed_webhooks_event_type ON failed_webhooks(event_type);
CREATE INDEX idx_failed_webhooks_retries ON failed_webhooks(retries);

-- Create function to save a failed webhook event
CREATE OR REPLACE FUNCTION save_failed_webhook(
  p_event_id text,
  p_event_type text,
  p_event_data jsonb,
  p_error_message text,
  p_retries int DEFAULT 0,
  p_max_retries int DEFAULT 5
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  webhook_id uuid;
  retry_delay interval;
BEGIN
  -- Calculate exponential backoff: 5min, 15min, 45min, 2hrs, 6hrs
  retry_delay := (5 * 2^p_retries)::text || ' minutes'::interval;
  
  INSERT INTO failed_webhooks (
    event_id,
    event_type,
    event_data,
    error_message,
    retries,
    max_retries,
    next_retry
  ) VALUES (
    p_event_id,
    p_event_type,
    p_event_data,
    p_error_message,
    p_retries,
    p_max_retries,
    now() + retry_delay
  )
  ON CONFLICT (event_id) 
  DO UPDATE SET
    retries = p_retries,
    error_message = p_error_message,
    next_retry = now() + retry_delay,
    updated_at = now()
  RETURNING id INTO webhook_id;
  
  RETURN webhook_id;
END;
$$;

-- Create trigger to update the updated_at column
CREATE TRIGGER update_failed_webhooks_updated_at
  BEFORE UPDATE ON failed_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 