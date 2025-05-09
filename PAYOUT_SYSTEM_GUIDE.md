# Payout System Guide

This guide explains how the payout system works and how to test it.

## Overview

The platform allows creators to sell their projects with the following revenue split:
- **80%** goes to the creator
- **20%** goes to the platform

The system uses Stripe Connect to automatically transfer earnings to creators' bank accounts on a monthly basis.

## Components

1. **Database Tables**:
   - `earnings`: Records each sale and calculates the revenue split
   - `payouts`: Tracks monthly payouts to creators
   - `users`: Extended with Stripe Connect fields to link creator accounts

2. **Edge Functions**:
   - `stripe-connect-onboarding`: Allows creators to connect their Stripe accounts
   - `process-monthly-payouts`: Processes monthly payments to creators
   - `stripe-webhook`: Handles payment events and distributes earnings

3. **UI Components**:
   - `StripeConnectSetup`: Button to connect Stripe account
   - `PayoutSettings`: Displays payout status and settings
   - `Payouts`: Page to view payout history

## Testing the System

### 1. Test Stripe Connect Onboarding

1. Log in as a creator
2. Navigate to the Dashboard and click "Manage Payouts"
3. Click "Connect Stripe Account"
4. Complete the Stripe Connect onboarding flow
5. After returning to the app, you should see your account is connected

### 2. Test Selling a Project

1. Upload a project with a price (e.g., $10)
2. Log in as a different user
3. Purchase the project
4. After the purchase:
   - The buyer should see the project in their Library
   - The seller should see:
     - The sale in their Dashboard
     - $8 (80%) added to their earnings
     - Platform fee of $2 (20%) recorded

### 3. Testing Payouts

Payouts are processed automatically on the 1st of each month, but you can test it manually:

1. Go to the Supabase dashboard
2. Navigate to the SQL Editor
3. Run this query to simulate a payout:

```sql
SELECT trigger_monthly_payouts();
```

4. Check the `payouts` table to see the created payout record
5. The seller should receive an email from Stripe about the payout

## Troubleshooting

### Webhook Issues

If purchases aren't being recorded:

1. Check the Stripe webhook is properly configured
2. Verify the webhook secret is correctly set in Supabase
3. Check Supabase logs for any errors:

```
supabase functions logs stripe-webhook
```

### Payout Issues

If payouts aren't processing:

1. Check the seller has completed the Stripe Connect onboarding
2. Verify the `payouts` table exists and has the correct permissions
3. Check logs for the process-monthly-payouts function:

```
supabase functions logs process-monthly-payouts
```

## Reports & Analytics

You can generate reports using SQL queries:

### Total Platform Revenue

```sql
SELECT SUM(platform_fee) FROM earnings WHERE status = 'completed';
```

### Creator Earnings

```sql
SELECT user_id, SUM(amount) FROM earnings WHERE status = 'completed' GROUP BY user_id;
```

### Monthly Sales

```sql
SELECT 
  DATE_TRUNC('month', created_at) AS month,
  SUM(total_amount) AS total_sales
FROM earnings 
GROUP BY month 
ORDER BY month;
```

## Security Considerations

- The payout system uses Stripe Connect, so no banking information is stored in the application
- All API calls use service role credentials for security
- RLS policies ensure users can only see their own payout information
- Admin users can view all payouts for monitoring purposes 