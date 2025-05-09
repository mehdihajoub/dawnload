import { AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useStripe } from '../../hooks/useStripe';

export function UnpaidBanner() {
  const { goToCustomerPortal, loading, error, clearError } = useStripe();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleUpdatePayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRedirecting(true);
    try {
      await goToCustomerPortal();
    } catch (err) {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="bg-red-50 border-b border-red-100">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Your subscription payment has failed. Please update your payment method to continue using premium features.
            </p>
          </div>
          
          {error && (
            <div className="text-xs text-red-800">
              {error}
              <button 
                onClick={clearError}
                className="ml-1 underline text-red-700"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {isRedirecting || loading ? (
            <div className="flex items-center gap-1 text-sm font-medium text-red-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
          ) : (
            <a
              href="#update-payment"
              onClick={handleUpdatePayment}
            className="flex-shrink-0 text-sm font-medium text-red-800 hover:text-red-900 underline"
          >
            Update Payment
            </a>
          )}
        </div>
      </div>
    </div>
  );
}