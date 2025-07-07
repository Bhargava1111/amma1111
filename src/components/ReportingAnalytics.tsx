import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart, LineChart, PieChart, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Assuming a simple chart component from shadcn/ui or similar
// For a real application, you'd integrate a dedicated charting library like Recharts, Chart.js, etc.
// For now, we'll use a placeholder or simple div for charts.
// If src/components/ui/chart.tsx is a functional charting component, we can use it.
// Let's assume it's a placeholder for now and focus on data fetching and display.

interface ReportingAnalyticsProps {}

const ReportingAnalytics: React.FC<ReportingAnalyticsProps> = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('last_30_days'); // 'last_7_days', 'last_30_days', 'last_90_days', 'all_time'

  const [salesData, setSalesData] = useState<any[]>([]);
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);

  useEffect(() => {
    fetchReportData();
  }, [timeframe]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`ReportingAnalytics: Fetching orders for total revenue and orders from table 10401 with timeframe: ${timeframe}`);
      // Fetch Total Revenue, Orders, Customers
      const { data: ordersData, error: ordersError } = await window.ezsite.apis.tablePage('10401', { // ORDERS_TABLE_ID
        PageNo: 1,
        PageSize: 1000, // Fetch more data to calculate revenue accurately
        Filters: getTimeframeFilters('order_date')
      });

      if (ordersError) {
        console.error('ReportingAnalytics: Error fetching orders for reports:', ordersError);
        throw new Error(ordersError);
      }
      console.log('ReportingAnalytics: Successfully fetched orders data:', ordersData);
      setTotalOrders(ordersData?.VirtualCount || 0);
      setTotalRevenue(ordersData?.List?.reduce((sum: number, order: any) => sum + order.order_total, 0) || 0);

      console.log(`ReportingAnalytics: Fetching users for total customers from table 10411 with timeframe: ${timeframe}`);
      const { data: usersData, error: usersError } = await window.ezsite.apis.tablePage('10411', { // USERS_TABLE_ID (User Profiles)
        PageNo: 1,
        PageSize: 1000, // Fetch more data for accurate count
        Filters: getTimeframeFilters('created_at') // Assuming user profiles have a created_at field
      });

      if (usersError) {
        console.error('ReportingAnalytics: Error fetching users for reports:', usersError);
        throw new Error(usersError);
      }
      console.log('ReportingAnalytics: Successfully fetched users data:', usersData);
      setTotalCustomers(usersData?.VirtualCount || 0);

      // Simulate fetching sales data over time (for a line chart)
      // In a real scenario, this would involve more complex backend aggregation
      const simulatedSales = [
        { date: '2024-01-01', sales: 1200 },
        { date: '2024-01-08', sales: 1500 },
        { date: '2024-01-15', sales: 1300 },
        { date: '2024-01-22', sales: 1800 },
        { date: '2024-01-29', sales: 1600 },
      ];
      setSalesData(simulatedSales);

      // Simulate product performance (for a bar chart or list)
      const simulatedProductPerformance = [
        { name: 'Product A', sales: 5000 },
        { name: 'Product B', sales: 3500 },
        { name: 'Product C', sales: 2800 },
        { name: 'Product D', sales: 2000 },
        { name: 'Product E', sales: 1500 },
      ];
      setProductPerformance(simulatedProductPerformance);

      // Simulate customer growth (for a line chart)
      const simulatedCustomerGrowth = [
        { date: '2024-01-01', customers: 100 },
        { date: '2024-02-01', customers: 120 },
        { date: '2024-03-01', customers: 150 },
        { date: '2024-04-01', customers: 180 },
        { date: '2024-05-01', customers: 200 },
      ];
      setCustomerGrowth(simulatedCustomerGrowth);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch report data.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch report data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeframeFilters = (dateField: string) => {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'last_7_days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last_30_days':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'last_90_days':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'all_time':
      default:
        return []; // No date filter for all time
    }

    return [{
      name: dateField,
      op: 'GreaterThanOrEqual',
      value: startDate.toISOString()
    }];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Reporting & Analytics
        </CardTitle>
        <CardDescription>Gain insights into your store's performance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading analytics data...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={fetchReportData} className="mt-4">Retry</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </CardContent>
              </Card>
            </div>

            {/* Sales Over Time Chart (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
                <CardDescription>Revenue trends over the selected timeframe.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                  <p className="text-gray-500">Sales Chart Placeholder</p>
                  {/* Integrate a charting library here, e.g., <LineChart data={salesData} /> */}
                </div>
              </CardContent>
            </Card>

            {/* Product Performance Chart (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Performance of your products by sales volume.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                  <p className="text-gray-500">Product Performance Chart Placeholder</p>
                  {/* Integrate a charting library here, e.g., <BarChart data={productPerformance} /> */}
                </div>
              </CardContent>
            </Card>

            {/* Customer Growth Chart (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customer registrations over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded-md border border-dashed">
                  <p className="text-gray-500">Customer Growth Chart Placeholder</p>
                  {/* Integrate a charting library here, e.g., <LineChart data={customerGrowth} /> */}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportingAnalytics;
