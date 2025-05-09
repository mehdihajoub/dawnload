#!/bin/bash

# Script to deploy the payout system to Supabase
echo "===== Deploying payout system ====="

echo "1. Applying database migrations..."
supabase db push

echo "2. Deploying stripe-connect-onboarding function..."
supabase functions deploy stripe-connect-onboarding

echo "3. Deploying process-monthly-payouts function..."
supabase functions deploy process-monthly-payouts

echo "4. Setting up environment variables..."
echo "NOTE: Your STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are already set."
echo "Setting PAYOUT_PROCESSING_SECRET..."
supabase secrets set PAYOUT_PROCESSING_SECRET=payouts_secure_78x92c5vbnm435

echo "===== Deployment complete! ====="
echo ""
echo "IMPORTANT NEXT STEPS:"
echo "1. Setup Stripe Connect in your Stripe Dashboard:"
echo "   - Go to: https://dashboard.stripe.com/settings/connect"
echo "   - Enable Connect accounts"
echo "   - Configure payout settings"
echo ""
echo "2. Add a webhook in your Stripe Dashboard:"
echo "   - Go to: https://dashboard.stripe.com/webhooks"
echo "   - Add endpoint: [YOUR_SUPABASE_URL]/functions/v1/stripe-webhook"
echo "   - Use the webhook secret already set in your environment"
echo "   - Subscribe to these events:"
echo "     * checkout.session.completed"
echo "     * customer.subscription.updated"
echo "     * customer.subscription.deleted"
echo "     * invoice.payment_succeeded"
echo "     * invoice.payment_failed"
echo "     * account.updated (for Connect accounts)"
echo ""
echo "3. Update your project to use the new components:"
echo "   - Add PayoutSettings to user profile"
echo "   - Link to the Payouts page from Dashboard"
echo "" 