import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle, Shield, Calendar } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { useStripe } from '../hooks/useStripe';

export function PaymentMethods() {
  const { subscription, loading: loadingSubscription } = useSubscription();
  const { 
    goToCustomerPortal, 
    loading: loadingStripe, 
    error: stripeError,
    clearError 
  } = useStripe();

  const handleUpdatePaymentMethod = async () => {
    await goToCustomerPortal();
  };

  if (loadingSubscription) {
    return (
      <div className="container py-12">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payment Methods</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {subscription?.payment_method_brand ? (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Current Payment Method</h2>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">
                    {subscription.payment_method_brand.charAt(0).toUpperCase() + 
                     subscription.payment_method_brand.slice(1)} •••• {subscription.payment_method_last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    {subscription.subscription_status === 'active' 
                      ? 'Active' 
                      : subscription.subscription_status === 'past_due'
                        ? 'Payment failed'
                        : subscription.subscription_status}
                  </p>
                </div>
              </div>
              
              {subscription.current_period_end && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {subscription.cancel_at_period_end 
                      ? `Cancels on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`
                      : `Renews on ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <p>No payment method on file</p>
              </div>
            </div>
          )}

          <button
            onClick={handleUpdatePaymentMethod}
            disabled={loadingStripe}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loadingStripe ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>
                  {subscription?.payment_method_brand
                    ? 'Update Payment Method'
                    : 'Add Payment Method'}
                </span>
              </>
            )}
          </button>

          {stripeError && (
            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-800">{stripeError}</p>
              <button 
                onClick={clearError}
                className="text-xs text-red-700 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Your payment information is securely processed by Stripe.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}