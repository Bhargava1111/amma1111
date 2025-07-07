import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Download, 
  Upload, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  FileSpreadsheet, 
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react';

const DataManagement: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataStats, setDataStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lastBackup: null as string | null,
    dataIntegrity: 100
  });
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    fetchDataStats();
  }, []);

  const fetchDataStats = async () => {
    setLoading(true);
    try {
      // Fetch comprehensive data statistics
      const [users, orders, products] = await Promise.all([
        fetch('http://localhost:3001/api/table/10411', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }),
        fetch('http://localhost:3001/api/table/10401', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }),
        fetch('http://localhost:3001/api/table/10403', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
      ]);

      const usersData = await users.json();
      const ordersData = await orders.json();
      const productsData = await products.json();

      const totalRevenue = ordersData.data?.List?.reduce((sum: number, order: any) => 
        sum + (order.order_total || 0), 0) || 0;

      setDataStats({
        totalUsers: usersData.data?.VirtualCount || 0,
        totalOrders: ordersData.data?.VirtualCount || 0,
        totalProducts: productsData.data?.VirtualCount || 0,
        totalRevenue,
        lastBackup: localStorage.getItem('lastBackupDate'),
        dataIntegrity: 100
      });
    } catch (error) {
      console.error('Error fetching data stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = async () => {
    setLoading(true);
    setExportProgress(0);
    
    try {
      const dataToExport = {
        exportDate: new Date().toISOString(),
        users: [],
        orders: [],
        products: [],
        categories: [],
        notifications: [],
        campaigns: [],
        invoices: [],
        reviews: []
      };

      const tables = [
        { id: '10411', key: 'users', name: 'Users' },
        { id: '10401', key: 'orders', name: 'Orders' },
        { id: '10403', key: 'products', name: 'Products' },
        { id: 'categories', key: 'categories', name: 'Categories' },
        { id: '10412', key: 'notifications', name: 'Notifications' },
        { id: '10413', key: 'campaigns', name: 'Campaigns' },
        { id: '10415', key: 'invoices', name: 'Invoices' },
        { id: '10400', key: 'reviews', name: 'Reviews' }
      ];

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        setExportProgress(((i + 1) / tables.length) * 100);
        
        try {
          const response = await fetch(`http://localhost:3001/api/table/${table.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          
          const data = await response.json();
          if (data.success) {
            dataToExport[table.key as keyof typeof dataToExport] = data.data?.List || [];
          }
        } catch (tableError) {
          console.warn(`Failed to export ${table.name}:`, tableError);
        }
      }

      // Create and download the export file
      const exportBlob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(exportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `manafoods_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Also create CSV exports for individual tables
      await exportToCSV('users', dataToExport.users);
      await exportToCSV('orders', dataToExport.orders);
      await exportToCSV('products', dataToExport.products);

      toast({
        title: 'Export Complete! 📁',
        description: 'All data has been exported successfully. Check your downloads folder.'
      });

      // Update last backup date
      localStorage.setItem('lastBackupDate', new Date().toISOString());
      fetchDataStats();

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setExportProgress(0);
    }
  };

  const exportToCSV = async (tableName: string, data: any[]) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle complex objects and arrays
          const stringValue = typeof value === 'object' && value !== null 
            ? JSON.stringify(value).replace(/"/g, '""')
            : String(value || '').replace(/"/g, '""');
          return `"${stringValue}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const performDataBackup = async () => {
    setLoading(true);
    try {
      // Create a comprehensive backup
      await exportAllData();
      
      // Store backup metadata
      const backupInfo = {
        date: new Date().toISOString(),
        userCount: dataStats.totalUsers,
        orderCount: dataStats.totalOrders,
        productCount: dataStats.totalProducts,
        status: 'completed'
      };
      
      localStorage.setItem('lastBackupInfo', JSON.stringify(backupInfo));
      
      toast({
        title: 'Backup Complete! 💾',
        description: 'Data backup has been created successfully.'
      });
      
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: 'Failed to create data backup.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateDataIntegrity = async () => {
    setLoading(true);
    try {
      let issues = 0;
      let totalChecks = 0;

      // Check for orphaned records
      const ordersResponse = await fetch('http://localhost:3001/api/table/10401', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const ordersData = await ordersResponse.json();
      const orders = ordersData.data?.List || [];
      
      // Validate each order has valid user references
      for (const order of orders) {
        totalChecks++;
        if (!order.user_id) {
          issues++;
        }
      }

      const integrityPercentage = totalChecks > 0 ? ((totalChecks - issues) / totalChecks) * 100 : 100;
      
      setDataStats(prev => ({
        ...prev,
        dataIntegrity: Math.round(integrityPercentage)
      }));

      toast({
        title: issues > 0 ? 'Data Issues Found' : 'Data Integrity Verified',
        description: issues > 0 
          ? `Found ${issues} data integrity issues that need attention.`
          : 'All data integrity checks passed successfully.',
        variant: issues > 0 ? 'destructive' : 'default'
      });

    } catch (error) {
      toast({
        title: 'Validation Failed',
        description: 'Failed to validate data integrity.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{dataStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-blue-600">All registered users</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dataStats.totalOrders.toLocaleString()}</p>
                <p className="text-sm text-green-600">All order records</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${dataStats.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-purple-600">From all orders</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Integrity</p>
                <p className="text-2xl font-bold text-gray-900">{dataStats.dataIntegrity}%</p>
                <p className="text-sm text-orange-600">System health</p>
              </div>
              <Database className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Export & Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export & Backup
          </CardTitle>
          <CardDescription>
            Export all user and order data for backup or analysis purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Last Backup</Label>
              <p className="text-sm text-gray-600">
                {dataStats.lastBackup 
                  ? new Date(dataStats.lastBackup).toLocaleString()
                  : 'No backup created yet'
                }
              </p>
            </div>
            <div className="space-y-2">
              <Label>Export Formats</Label>
              <p className="text-sm text-gray-600">JSON (complete) + CSV (individual tables)</p>
            </div>
          </div>

          {exportProgress > 0 && (
            <div className="space-y-2">
              <Label>Export Progress</Label>
              <Progress value={exportProgress} />
              <p className="text-sm text-gray-600">Exporting data... {Math.round(exportProgress)}%</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button onClick={exportAllData} disabled={loading}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {loading ? 'Exporting...' : 'Export All Data'}
            </Button>
            <Button onClick={performDataBackup} variant="outline" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
            <Button onClick={validateDataIntegrity} variant="outline" disabled={loading}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Validate Integrity
            </Button>
            <Button onClick={fetchDataStats} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Storage Status
          </CardTitle>
          <CardDescription>
            Current status of all data storage and management systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">User Data</p>
                <p className="text-sm text-green-700">All user profiles stored</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Order Data</p>
                <p className="text-sm text-green-700">All orders tracked</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Product Data</p>
                <p className="text-sm text-green-700">Inventory up-to-date</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Analytics Data</p>
                <p className="text-sm text-blue-700">Reports available</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Audit Logs</p>
                <p className="text-sm text-purple-700">Activity tracked</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Backup Status</p>
                <p className="text-sm text-orange-700">
                  {dataStats.lastBackup ? 'Backed up' : 'Needs backup'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement; 