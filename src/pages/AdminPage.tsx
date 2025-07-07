import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  MessageSquare,
  Bell,
  BarChart,
  DollarSign,
  Save,
  LineChart,
  PieChart,
  Send,
  Eye } from
'lucide-react';
import { Link } from 'react-router-dom';
import CampaignManager from '../components/CampaignManager';
import ProductManagement from '../components/ProductManagement';
import CategoryManagement from '../components/CategoryManagement';
import OrderManagement from '../components/OrderManagement';
import UserManagement from '../components/UserManagement';
import NotificationManagement from '../components/NotificationManagement';
import ReportingAnalytics from '../components/ReportingAnalytics';
import BannerManagement from '../components/BannerManagement';
import InvoiceManagement from '../components/InvoiceManagement';
import DataManagement from '../components/DataManagement';

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced stats for the dashboard
  const stats = [
  { title: 'Total Orders', value: '1,234', icon: ShoppingCart, change: '+12%' },
  { title: 'Products', value: '89', icon: Package, change: '+5%' },
  { title: 'Customers', value: '456', icon: Users, change: '+8%' },
  { title: 'Revenue', value: '$12,345', icon: DollarSign, change: '+15%' },
  { title: 'Campaigns', value: '12', icon: MessageSquare, change: '+3%' },
  { title: 'Notifications', value: '456', icon: Bell, change: '+25%' }];


  const recentOrders = [
  { id: '#12345', customer: 'John Doe', amount: '$129.99', status: 'Pending' },
  { id: '#12346', customer: 'Jane Smith', amount: '$89.99', status: 'Shipped' },
  { id: '#12347', customer: 'Bob Johnson', amount: '$199.99', status: 'Delivered' }];




  // Debug information
  console.log('AdminPage Debug:', { user, isAdmin, userRole: user?.role });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login to access the admin panel
            </p>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/auth">Login</Link>
              </Button>
              <div className="text-sm text-gray-500 p-4 bg-gray-100 rounded-lg">
                <p className="font-semibold mb-2">Demo Admin Access:</p>
                <p>Email: admin@example.com</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>);
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the admin panel
            </p>
            <div className="text-sm text-gray-500 p-4 bg-gray-100 rounded-lg mb-6">
              <p className="font-semibold mb-2">Current User Info:</p>
              <p>Email: {user.Email}</p>
              <p>Role: {user.role}</p>
              <p>ID: {user.ID}</p>
              <div className="mt-2 pt-2 border-t">
                <p className="font-semibold">Admin Access Requirements:</p>
                <p>• Email: admin@example.com OR contains 'admin'</p>
                <p>• User ID: '1'</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/">Go Home</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/auth">Login as Admin</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your store, products, campaigns, and notifications
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile: Dropdown for tabs */}
          <div className="block md:hidden mb-6">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">📊 Overview</SelectItem>
                <SelectItem value="users">👥 Users</SelectItem>
                <SelectItem value="products">📦 Products</SelectItem>
                <SelectItem value="categories">🏷️ Categories</SelectItem>
                <SelectItem value="campaigns">📢 Campaigns</SelectItem>
                <SelectItem value="orders">🛒 Orders</SelectItem>
                <SelectItem value="invoices">📄 Invoices</SelectItem>
                <SelectItem value="reports">📈 Reports</SelectItem>
                <SelectItem value="notifications">🔔 Notifications</SelectItem>
                <SelectItem value="banners">🖼️ Banners</SelectItem>
                <SelectItem value="data">💾 Data Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Desktop: Horizontal tabs with responsive grid */}
          <TabsList className="hidden md:grid w-full md:grid-cols-5 lg:grid-cols-11 gap-1 h-auto">
            <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-xs lg:text-sm">Users</TabsTrigger>
            <TabsTrigger value="products" className="text-xs lg:text-sm">Products</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs lg:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs lg:text-sm">Campaigns</TabsTrigger>
            <TabsTrigger value="orders" className="md:col-start-1 lg:col-start-6 text-xs lg:text-sm">Orders</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs lg:text-sm">Invoices</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs lg:text-sm">Reports</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs lg:text-sm">Notifications</TabsTrigger>
            <TabsTrigger value="banners" className="text-xs lg:text-sm">Banners</TabsTrigger>
            <TabsTrigger value="data" className="text-xs lg:text-sm">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) =>
              <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-sm text-green-600">
                          {stat.change} from last month
                        </p>
                      </div>
                      <stat.icon className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) =>
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.amount}</p>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}`
                      }>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignManager />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <InvoiceManagement />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportingAnalytics />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <NotificationManagement />
          </TabsContent>

          <TabsContent value="banners" className="space-y-6 mt-6">
            <BannerManagement />
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-6">
            <DataManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>);

};

export default AdminPage;
