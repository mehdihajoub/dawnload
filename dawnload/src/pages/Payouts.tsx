import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { PayoutSettings } from '../components/payout/PayoutSettings';

interface PayoutData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  period_start: string;
  period_end: string;
  created_at: string;
  stripe_payout_id?: string;
}

export function Payouts() {
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadPayouts() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('payouts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setPayouts(data || []);
      } catch (err: any) {
        console.error('Error loading payouts:', err);
        setError(err.message || 'Failed to load payout history');
      } finally {
        setLoading(false);
      }
    }
    
    loadPayouts();
  }, []);
  
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };
  
  if (loading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Payouts</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold">Payout History</h2>
            </div>
            
            {payouts.length === 0 ? (
              <div className="p-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No payouts yet</h3>
                <p className="text-gray-600 mb-4">
                  Your earnings will be transferred monthly to your connected Stripe account.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Period
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              {formatDateRange(payout.period_start, payout.period_end)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          ${payout.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              payout.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payout.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <PayoutSettings />
          
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mt-6">
            <h3 className="font-medium mb-3">About Payouts</h3>
            <p className="text-sm text-gray-600 mb-3">
              We process payouts on the 1st of each month for the previous month's earnings.
              You'll receive 80% of each sale price, with 20% retained as a platform fee.
            </p>
            <p className="text-sm text-gray-600">
              Payouts are processed automatically through Stripe Connect. Make sure your
              banking information is up to date in your Stripe account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 