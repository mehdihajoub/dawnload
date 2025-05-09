#!/bin/bash

# Script to deploy all edge functions and ensure variables are set

echo "=== Deploying Edge Functions ==="

# First deploy the stripe functions
echo "Deploying stripe-connect-onboarding..."
supabase functions deploy stripe-connect-onboarding

echo "Deploying process-monthly-payouts..."
supabase functions deploy process-monthly-payouts

echo "Deploying stripe-webhook..."
supabase functions deploy stripe-webhook

echo "Deploying webhook-retries..."
supabase functions deploy webhook-retries

echo "Deploying project-checkout..."
supabase functions deploy project-checkout

# Ensure environment variables are set
echo ""
echo "=== Setting Environment Variables ==="
supabase secrets set STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
supabase secrets set PAYOUT_PROCESSING_SECRET=payouts_secure_78x92c5vbnm435

echo ""
echo "=== Deployment Complete ==="
echo "Visit your project at: https://supabase.com/dashboard/project/pejsexfngypfhgdmfgeq/functions" 