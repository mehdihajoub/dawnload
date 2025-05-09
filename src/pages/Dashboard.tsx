import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  LineChart, 
  Download, 
  ArrowUpRight, 
  ShoppingBag, 
  Music, 
  Users, 
  BarChart, 
  Clock, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import { getUserPurchases } from '../services/purchases';
import { getProjects } from '../services/projects';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

// Fallback image if project image is missing
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=No+Image';

interface PurchaseItem {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  project: {
    id: string;
    title: string;
    image_url: string;
    preview_url: string;
    daw_type: string;
    genre: string;
    price: number;
    author_id: string;
    author: {
      id: string;
      username: string;
      avatar_url: string;
    }
  };
}

interface DownloadRecord {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  amount_paid?: number;
  stripe_payment_id?: string;
  project: Record<string, any>;
}

interface SalesData {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  amount: number;
  project: {
    id: string;
    title: string;
    imageUrl: string;
    dawType: string;
    genre: string;
    price: number;
  };
}

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
    imageUrl?: string;
  };
  buyer?: {
    username: string;
  };
}

interface ChartData {
  month: string;
  sales: number;
}

export function Dashboard() {
  const [recentPurchases, setRecentPurchases] = useState<PurchaseItem[]>([]);
  const [recentSales, setRecentSales] = useState<SalesData[]>([]);
  const [recentEarnings, setRecentEarnings] = useState<EarningsData[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalPlatformFees, setTotalPlatformFees] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [salesChartData, setSalesChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Load user's purchases
        const purchasesData = await getUserPurchases();
        const recentPurchasesData = purchasesData.slice(0, 4);
        setRecentPurchases(recentPurchasesData);
        setTotalPurchases(purchasesData.length);
        
        // Load user's projects/uploads
        const { data: userProjectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('author_id', user.id);
        
        setUserProjects(userProjectsData || []);
        
        // Calculate total downloads
        const totalProjectDownloads = userProjectsData ? 
          userProjectsData.reduce((total, project) => total + (project.download_count || 0), 0) : 
          0;
        setTotalDownloads(totalProjectDownloads);
        
        // Get sales data (from downloads table where project author is the current user)
        const { data: salesData, error: salesError } = await supabase
          .from('downloads')
          .select(`
            id,
            project_id,
            user_id,
            created_at,
            amount_paid,
            project:projects(
              id,
              title,
              price,
              image_url,
              daw_type,
              genre,
              author_id
            )
          `)
          .eq('project:projects.author_id', user.id);
          
        if (salesError) throw salesError;
        
        // Process sales data
        const sales = salesData as DownloadRecord[] || [];
        const processedSales: SalesData[] = [];
        
        // Safely process each sale record
        for (const sale of sales) {
          try {
            // Make sure project exists and is an object
            if (sale.project && typeof sale.project === 'object') {
              processedSales.push({
                id: sale.id,
                project_id: sale.project_id,
                user_id: sale.user_id,
                created_at: sale.created_at,
                amount: sale.amount_paid || sale.project.price || 0,
                project: {
                  id: sale.project.id || '',
                  title: sale.project.title || '',
                  imageUrl: sale.project.image_url || '',
                  dawType: sale.project.daw_type || '',
                  genre: sale.project.genre || '',
                  price: sale.project.price || 0
                }
              });
            }
          } catch (err) {
            console.error('Error processing sale:', err, sale);
          }
        }
        
        setRecentSales(processedSales.slice(0, 4));
        
        const totalSalesAmount = processedSales.reduce((total, sale) => total + sale.amount, 0);
        setTotalSales(totalSalesAmount);
        
        // Get earnings data from earnings table
        const { data: earningsData, error: earningsError } = await supabase
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
            project:projects!project_id(id, title, image_url),
            buyer:users!buyer_id(username)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (earningsError) {
          console.error('Error fetching earnings:', earningsError);
          // Don't throw here, it might be a new table not yet created
        }
        
        // Process earnings data if it exists
        if (earningsData) {
          // Transform the data to match our interface
          const processedEarnings = earningsData.map(item => {
            // Create a properly typed earnings object
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
                id: Array.isArray(item.project) ? String(item.project[0]?.id) : String(item.project.id),
                title: Array.isArray(item.project) ? String(item.project[0]?.title) : String(item.project.title),
                imageUrl: Array.isArray(item.project) ? String(item.project[0]?.image_url) : String(item.project.image_url)
              } : undefined,
              buyer: item.buyer ? {
                username: Array.isArray(item.buyer) ? String(item.buyer[0]?.username) : String(item.buyer.username)
              } : undefined
            };
            return earnings;
          });
          
          setRecentEarnings(processedEarnings.slice(0, 4));
          
          const totalEarningsAmount = earningsData.reduce((sum, item) => sum + (item.amount || 0), 0);
          const totalFees = earningsData.reduce((sum, item) => sum + (item.platform_fee || 0), 0);
          
          setTotalEarnings(totalEarningsAmount);
          setTotalPlatformFees(totalFees);
        }
        
        // Generate chart data - last 6 months of sales
        const salesByMonth = generateSalesChartData(processedSales);
        setSalesChartData(salesByMonth);
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);
  
  // Generate chart data for the last 6 months
  const generateSalesChartData = (sales: SalesData[]): ChartData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data: ChartData[] = [];
    
    // Create data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[month.getMonth()];
      
      // Filter sales for this month
      const monthlySales = sales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate.getMonth() === month.getMonth() && 
               saleDate.getFullYear() === month.getFullYear();
      });
      
      // Calculate total sales for this month
      const totalMonthlySales = monthlySales.reduce((total, sale) => total + sale.amount, 0);
      
      data.push({
        month: monthName,
        sales: totalMonthlySales
      });
    }
    
    return data;
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/upload" className="btn-primary">
          Upload New Project
        </Link>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center">
          <div className="bg-primary-100 p-3 rounded-lg mr-4">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold">${totalEarnings > 0 ? totalEarnings.toFixed(2) : totalSales.toFixed(2)}</p>
            {totalPlatformFees > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Platform fee: ${totalPlatformFees.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center">
          <div className="bg-secondary-100 p-3 rounded-lg mr-4">
            <Download className="h-6 w-6 text-secondary-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-1">Total Downloads</p>
            <p className="text-2xl font-bold">{totalDownloads}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center">
          <div className="bg-success-100 p-3 rounded-lg mr-4">
            <Music className="h-6 w-6 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-1">Your Projects</p>
            <p className="text-2xl font-bold">{userProjects.length}</p>
          </div>
        </div>
      </div>
      
      {/* Payout setup reminder - NEW SECTION */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success-600" />
            Payouts Setup
          </h2>
        </div>
        
        <p className="mb-4">
          To receive payments when your projects are sold, you need to connect your Stripe account.
          This allows us to send 80% of each sale directly to your bank account.
        </p>
        
        <Link to="/payouts" className="btn-primary">
          Manage Payouts
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary-600" />
              Sales Overview
            </h2>
            <span className="text-sm text-neutral-600">Last 6 months</span>
          </div>
          
          <div className="h-60 flex items-end gap-2">
            {salesChartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary-100 rounded-t"
                  style={{ 
                    height: `${Math.max(item.sales * 100 / (Math.max(...salesChartData.map(d => d.sales)) || 1), 10)}%`,
                    minHeight: '20px'
                  }}
                ></div>
                <p className="text-xs mt-2 text-neutral-600">{item.month}</p>
                <p className="text-xs font-medium">${item.sales.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary-600" />
              Recent Sales
            </h2>
            <Link to="/sales" className="text-sm text-primary-600 flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="text-center py-6 text-neutral-500">
              <p>No sales yet</p>
              <p className="text-sm mt-2">Your sales will appear here when you make your first sale</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                  <img 
                    src={sale.project?.imageUrl || PLACEHOLDER_IMAGE} 
                    alt={sale.project?.title}
                    className="w-12 h-12 rounded object-cover mr-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{sale.project?.title}</p>
                    <p className="text-sm text-neutral-600">
                      {new Date(sale.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-success-600">${sale.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Earnings Overview - New section */}
      {recentEarnings.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success-600" />
              Recent Earnings
            </h2>
            <div className="flex items-center gap-3">
              <Link to="/payouts" className="text-sm text-secondary-600 flex items-center gap-1">
                Manage Payouts <ExternalLink className="h-3 w-3" />
              </Link>
              <Link to="/earnings" className="text-sm text-primary-600 flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium text-gray-500">Project</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Buyer</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Date</th>
                  <th className="text-right pb-3 font-medium text-gray-500">Total</th>
                  <th className="text-right pb-3 font-medium text-gray-500">Platform Fee</th>
                  <th className="text-right pb-3 font-medium text-gray-500">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {recentEarnings.map((earning) => (
                  <tr key={earning.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center">
                        <img 
                          src={earning.project?.imageUrl || PLACEHOLDER_IMAGE}
                          alt={earning.project?.title}
                          className="w-8 h-8 rounded object-cover mr-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <Link to={`/project/${earning.project_id}`} className="hover:text-primary-600 truncate max-w-[150px]">
                          {earning.project?.title}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{earning.buyer?.username || 'Unknown user'}</td>
                    <td className="py-3 text-gray-600">{new Date(earning.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right text-gray-900 font-medium">${earning.total_amount.toFixed(2)}</td>
                    <td className="py-3 text-right text-red-600">${earning.platform_fee.toFixed(2)}</td>
                    <td className="py-3 text-right text-green-600 font-medium">${earning.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Recent Purchases */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            Recent Purchases
          </h2>
          <Link to="/library" className="text-sm text-primary-600 flex items-center gap-1">
            View library <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        
        {recentPurchases.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            <p>No purchases yet</p>
            <p className="text-sm mt-2">Your purchases will appear here</p>
            <Link to="/browse" className="btn-sm btn-primary mt-4">Browse Projects</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPurchases.map((purchase) => (
              <Link to={`/project/${purchase.project_id}`} key={purchase.id} className="group">
                <div className="aspect-video mb-2 rounded-lg overflow-hidden">
                  <img 
                    src={purchase.project?.image_url || PLACEHOLDER_IMAGE} 
                    alt={purchase.project?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
                <p className="font-medium truncate group-hover:text-primary-600 transition-colors">
                  {purchase.project?.title}
                </p>
                <p className="text-sm text-neutral-600">
                  {new Date(purchase.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 