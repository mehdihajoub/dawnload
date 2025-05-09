import { useEffect, useState } from 'react';
import { ArrowLeft, DollarSign, Download, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Fallback image if project image is missing
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=No+Image';

interface EarningsData {
  id: string;
  user_id: string;
  project_id: string;
  order_id: string;
  buyer_id: string;
  amount: number;
  platform_fee: number;
  total_amount: number;
  created_at: string;
  status: string;
  project?: {
    id: string;
    title: string;
    image_url?: string;
  };
  buyer?: {
    username: string;
  };
}

export function Earnings() {
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  
  // Load earnings data
  useEffect(() => {
    async function loadEarnings() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please log in to view your earnings');
          setLoading(false);
          return;
        }
        
        // Fetch earnings data
        const { data, error: earningsError } = await supabase
          .from('earnings')
          .select(`
            id,
            user_id,
            project_id,
            order_id,
            buyer_id,
            amount,
            platform_fee,
            total_amount,
            created_at,
            status,
            project:projects(id, title, image_url),
            buyer:users(username)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (earningsError) {
          if (earningsError.message.includes('does not exist')) {
            // Table might not exist yet if it's a new feature
            console.log('Earnings table may not exist yet');
            setEarnings([]);
          } else {
            throw earningsError;
          }
        } else {
          // Transform the data to match our interface
          const processedEarnings = data?.map(item => {
            const earnings: EarningsData = {
              id: item.id,
              user_id: item.user_id,
              project_id: item.project_id,
              order_id: item.order_id,
              buyer_id: item.buyer_id,
              amount: item.amount,
              platform_fee: item.platform_fee,
              total_amount: item.total_amount,
              created_at: item.created_at,
              status: item.status,
              project: item.project ? {
                id: String(item.project.id),
                title: String(item.project.title),
                image_url: item.project.image_url
              } : undefined,
              buyer: item.buyer ? {
                username: String(item.buyer.username)
              } : undefined
            };
            return earnings;
          }) || [];
          
          setEarnings(processedEarnings);
        }
      } catch (err) {
        console.error('Error loading earnings:', err);
        setError('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    }
    
    loadEarnings();
  }, []);
  
  // Calculate summary statistics
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalSales = earnings.reduce((sum, item) => sum + item.total_amount, 0);
  const totalFees = earnings.reduce((sum, item) => sum + item.platform_fee, 0);
  
  // Apply filters
  const filteredEarnings = earnings.filter(earning => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === '' || 
      earning.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      earning.buyer?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      earning.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter  
    const matchesStatus = 
      statusFilter === null || 
      earning.status === statusFilter;
    
    // Apply time filter
    let matchesTime = true;
    if (timeFilter) {
      const now = new Date();
      const earningDate = new Date(earning.created_at);
      
      if (timeFilter === 'today') {
        matchesTime = earningDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        matchesTime = earningDate >= oneWeekAgo;
      } else if (timeFilter === 'month') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        matchesTime = earningDate >= oneMonthAgo;
      } else if (timeFilter === 'year') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        matchesTime = earningDate >= oneYearAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });
  
  // Calculate filtered totals
  const filteredTotalEarnings = filteredEarnings.reduce((sum, item) => sum + item.amount, 0);
  const filteredTotalSales = filteredEarnings.reduce((sum, item) => sum + item.total_amount, 0);
  const filteredTotalFees = filteredEarnings.reduce((sum, item) => sum + item.platform_fee, 0);
  
  // Render loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Your Earnings</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
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
        <h1 className="text-3xl font-bold">Your Earnings</h1>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm text-neutral-600">Total Earnings</h2>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
          {timeFilter && (
            <p className="text-sm text-neutral-500 mt-1">
              Filtered: ${filteredTotalEarnings.toFixed(2)}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm text-neutral-600">Total Sales</h2>
            <Download className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
          {timeFilter && (
            <p className="text-sm text-neutral-500 mt-1">
              Filtered: ${filteredTotalSales.toFixed(2)}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm text-neutral-600">Platform Fees</h2>
            <DollarSign className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">${totalFees.toFixed(2)}</p>
          {timeFilter && (
            <p className="text-sm text-neutral-500 mt-1">
              Filtered: ${filteredTotalFees.toFixed(2)}
            </p>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <h2 className="text-lg font-bold">Earnings History</h2>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search project or buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
              />
            </div>
            
            {/* Status filter */}
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            
            {/* Time filter */}
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                onChange={(e) => setTimeFilter(e.target.value || null)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Earnings table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {filteredEarnings.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
            <h2 className="text-xl font-semibold mb-2">No earnings found</h2>
            <p className="text-neutral-600 mb-6">
              {earnings.length === 0 
                ? "You haven't earned any revenue yet." 
                : "No earnings match your current filters."}
            </p>
            {earnings.length > 0 && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter(null);
                  setTimeFilter(null);
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Your Earnings
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEarnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={earning.project?.image_url || PLACEHOLDER_IMAGE}
                          alt={earning.project?.title || 'Unknown project'}
                          className="w-10 h-10 rounded object-cover mr-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <Link to={`/project/${earning.project_id}`} className="hover:text-primary-600 font-medium">
                          {earning.project?.title || 'Unknown project'}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {earning.buyer?.username || 'Anonymous user'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(earning.created_at).toLocaleDateString()} 
                      <span className="text-gray-400 ml-1">
                        {new Date(earning.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${earning.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-600">
                      -${earning.platform_fee.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600 font-bold">
                      ${earning.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${earning.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          ${earning.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${earning.status === 'canceled' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {earning.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm font-medium">
                    Showing {filteredEarnings.length} of {earnings.length} earnings
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    ${filteredTotalSales.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-red-600 font-medium">
                    -${filteredTotalFees.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-green-600 font-bold">
                    ${filteredTotalEarnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 