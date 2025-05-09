import { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useStripe } from '../../hooks/useStripe';
import { products } from '../../stripe-config';
import { CreditCard, Calendar, AlertCircle, Loader2, XCircle, RefreshCw, ArrowUpCircle } from 'lucide-react';

export function SubscriptionStatus() {
  const { subscription, loading: loadingSubscription, error: subscriptionError } = useSubscription();
  const { 
    createCheckoutSession,
    cancelSubscription, 
    reactivateSubscription,
    loading: loadingAction, 
    error: actionError 
  } = useStripe();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Error loading subscription</p>
        </div>
      </div>
    );
  }

  if (!subscription || !subscription.subscription_id) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">No active subscription</p>
      </div>
    );
  }

  const currentPlan = Object.values(products).find(p => p.priceId === subscription.price_id);
  const isActive = subscription.subscription_status === 'active';
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
    : 'N/A';

  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000).toLocaleDateString()
    : 'N/A';

  const handleCancel = async () => {
    if (showCancelConfirm) {
      await cancelSubscription();
      setShowCancelConfirm(false);
    } else {
      setShowCancelConfirm(true);
    }
  };

  const handleReactivate = async () => {
    await reactivateSubscription();
  };

  const handleUpgrade = async (plan: typeof products[keyof typeof products]) => {
    if (plan.priceId === subscription.price_id) {
      return; // Don't allow switching to the same plan
    }
    await createCheckoutSession(plan);
  };

  // Available plans for upgrade/downgrade
  const availablePlans = Object.values(products).filter(
    plan => plan.priceId !== subscription.price_id
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {currentPlan?.name || 'Unknown Plan'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {subscription.subscription_status}
        </span>
      </div>

      <div className="space-y-3">
        {subscription.payment_method_brand && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCard className="h-4 w-4" />
            <span>
              {subscription.payment_method_brand.charAt(0).toUpperCase() + 
               subscription.payment_method_brand.slice(1)} •••• {subscription.payment_method_last4}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            Started on {periodStart}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {subscription.cancel_at_period_end
              ? `Cancels on ${periodEnd}`
              : `Renews on ${periodEnd}`}
          </span>
        </div>
        
        {currentPlan && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Plan price:</span>
              <span className="font-medium">
                ${currentPlan.priceId.includes('_') 
                  ? currentPlan.priceId.split('_').pop()?.replace(/\D/g, '') || '0' 
                  : '0'}/month
              </span>
            </div>
            
            {currentPlan.description && (
              <p className="text-sm text-gray-600 mt-1">
                {currentPlan.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Upgrade/Downgrade Section */}
      {!subscription.cancel_at_period_end && isActive && (
        <div className="mt-4">
          <button
            onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
            className="btn-secondary w-full"
          >
            <ArrowUpCircle className="h-4 w-4" />
            <span>Change Plan</span>
          </button>

          {showUpgradeOptions && (
            <div className="mt-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Available Plans:</h4>
              {availablePlans.map(plan => (
                <div
                  key={plan.priceId}
                  className="p-4 border rounded-lg hover:border-black transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{plan.name}</h5>
                    <span className="text-sm font-medium">
                      ${plan.priceId.includes('_') 
                        ? plan.priceId.split('_').pop()?.replace(/\D/g, '') || '0' 
                        : '0'}/month
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {plan.description}
                  </p>
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={loadingAction}
                    className="btn-primary w-full"
                  >
                    {loadingAction ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>
                        {plan.name === 'Max plan' ? 'Upgrade' : 'Downgrade'} to {plan.name}
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subscription.cancel_at_period_end && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Your subscription will end on {periodEnd}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                You can reactivate now to keep your subscription and continue enjoying all the benefits.
              </p>
              <button
                onClick={handleReactivate}
                disabled={loadingAction}
                className="btn-primary mt-3"
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Reactivate Subscription</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">{actionError}</p>
        </div>
      )}

      {!subscription.cancel_at_period_end && (
        <div className="mt-6 border-t pt-6">
          {showCancelConfirm ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-red-600">
                <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Are you sure you want to cancel?</p>
                  <p className="text-sm mt-1">
                    Your subscription will remain active until {periodEnd}, after which it will be cancelled.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={loadingAction}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  {loadingAction ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={loadingAction}
                  className="btn-secondary"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleCancel} className="btn-secondary text-red-600 hover:text-red-700">
              Cancel Subscription
            </button>
          )}
        </div>
      )}
    </div>
  );
}