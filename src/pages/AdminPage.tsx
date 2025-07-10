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
  Eye,
  Sparkles,
  Star,
  Heart,
  Zap
} from 'lucide-react';
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
import BlogManagement from '../components/BlogManagement';
import LogoManagement from '../components/LogoManagement';

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced stats for the dashboard with colorful gradients
  const stats = [
    { 
      title: 'Total Orders', 
      value: '1,234', 
      icon: ShoppingCart, 
      change: '+12%',
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
      textColor: 'text-violet-600',
      changeColor: 'text-violet-700'
    },
    { 
      title: 'Products', 
      value: '89', 
      icon: Package, 
      change: '+5%',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600',
      changeColor: 'text-blue-700'
    },
    { 
      title: 'Customers', 
      value: '456', 
      icon: Users, 
      change: '+8%',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600',
      changeColor: 'text-green-700'
    },
    { 
      title: 'Revenue', 
      value: '$12,345', 
      icon: DollarSign, 
      change: '+15%',
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      textColor: 'text-orange-600',
      changeColor: 'text-orange-700'
    },
    { 
      title: 'Campaigns', 
      value: '12', 
      icon: MessageSquare, 
      change: '+3%',
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-50',
      textColor: 'text-pink-600',
      changeColor: 'text-pink-700'
    },
    { 
      title: 'Notifications', 
      value: '456', 
      icon: Bell, 
      change: '+25%',
      gradient: 'from-yellow-500 to-amber-600',
      bgGradient: 'from-yellow-50 to-amber-50',
      textColor: 'text-yellow-600',
      changeColor: 'text-yellow-700'
    }
  ];

  const recentOrders = [
    { id: '#12345', customer: 'John Doe', amount: '$129.99', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-800' },
    { id: '#12346', customer: 'Jane Smith', amount: '$89.99', status: 'Shipped', statusColor: 'bg-blue-100 text-blue-800' },
    { id: '#12347', customer: 'Bob Johnson', amount: '$199.99', status: 'Delivered', statusColor: 'bg-green-100 text-green-800' }
  ];

  // Debug information
  console.log('AdminPage Debug:', { user, isAdmin, userRole: user?.role });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-in fade-in duration-500">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Please login to access the admin panel
            </p>
            <div className="space-y-4">
              <Button asChild className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link to="/auth">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Login to Admin
                </Link>
              </Button>
              <div className="text-sm text-gray-600 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-inner">
                <p className="font-bold mb-3 text-indigo-600 flex items-center justify-center">
                  <Star className="w-4 h-4 mr-2" />
                  Demo Admin Access
                </p>
                <p className="mb-1"><span className="font-semibold">Email:</span> admin@example.com</p>
                <p><span className="font-semibold">Password:</span> admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-in fade-in duration-500">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              You don't have permission to access the admin panel
            </p>
            <div className="text-sm text-gray-600 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-inner mb-6">
              <p className="font-bold mb-3 text-red-600 flex items-center justify-center">
                <Heart className="w-4 h-4 mr-2" />
                Current User Info
              </p>
              <p className="mb-1"><span className="font-semibold">Email:</span> {user.Email}</p>
              <p className="mb-1"><span className="font-semibold">Role:</span> {user.role}</p>
              <p className="mb-3"><span className="font-semibold">ID:</span> {user.ID}</p>
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="font-bold text-red-600 mb-2">Admin Access Requirements:</p>
                <p className="text-xs">• Email: admin@example.com OR contains 'admin'</p>
                <p className="text-xs">• User ID: '1'</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link to="/">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full h-12 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link to="/auth">
                  <Zap className="w-5 h-5 mr-2" />
                  Login as Admin
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with gradient background */}
        <div className="mb-6 sm:mb-8 p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mr-3 animate-pulse" />
                Admin Dashboard
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base lg:text-lg">
                Manage your store with style and efficiency
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">Welcome back!</p>
                <p className="text-xs text-indigo-200">{user?.Name || user?.Email}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile: Colorful dropdown for tabs */}
          <div className="block lg:hidden mb-6">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full h-14 bg-gradient-to-r from-white to-indigo-50 border-2 border-indigo-200 rounded-xl shadow-lg text-base font-medium">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-indigo-200 shadow-2xl">
                <SelectItem value="overview" className="text-base py-3 hover:bg-indigo-50 cursor-pointer">📊 Overview</SelectItem>
                <SelectItem value="users" className="text-base py-3 hover:bg-green-50 cursor-pointer">👥 Users</SelectItem>
                <SelectItem value="products" className="text-base py-3 hover:bg-blue-50 cursor-pointer">📦 Products</SelectItem>
                <SelectItem value="categories" className="text-base py-3 hover:bg-purple-50 cursor-pointer">🏷️ Categories</SelectItem>
                <SelectItem value="campaigns" className="text-base py-3 hover:bg-pink-50 cursor-pointer">📢 Campaigns</SelectItem>
                <SelectItem value="orders" className="text-base py-3 hover:bg-yellow-50 cursor-pointer">🛒 Orders</SelectItem>
                <SelectItem value="invoices" className="text-base py-3 hover:bg-orange-50 cursor-pointer">📄 Invoices</SelectItem>
                <SelectItem value="reports" className="text-base py-3 hover:bg-red-50 cursor-pointer">📈 Reports</SelectItem>
                <SelectItem value="notifications" className="text-base py-3 hover:bg-cyan-50 cursor-pointer">🔔 Notifications</SelectItem>
                <SelectItem value="banners" className="text-base py-3 hover:bg-emerald-50 cursor-pointer">🖼️ Banners</SelectItem>
                <SelectItem value="logo" className="text-base py-3 hover:bg-violet-50 cursor-pointer">🏷️ Logo</SelectItem>
                <SelectItem value="data" className="text-base py-3 hover:bg-teal-50 cursor-pointer">💾 Data</SelectItem>
                <SelectItem value="blog" className="text-base py-3 hover:bg-rose-50 cursor-pointer">📝 Blog</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Desktop: Colorful horizontal tabs */}
          <div className="hidden lg:block mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 border border-indigo-200">
              <TabsList className="grid w-full grid-cols-7 gap-1 h-auto bg-transparent">
                <TabsTrigger 
                  value="overview" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white hover:bg-indigo-50 transition-all duration-300 rounded-xl"
                >
                  📊 Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white hover:bg-green-50 transition-all duration-300 rounded-xl"
                >
                  👥 Users
                </TabsTrigger>
                <TabsTrigger 
                  value="products" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white hover:bg-blue-50 transition-all duration-300 rounded-xl"
                >
                  📦 Products
                </TabsTrigger>
                <TabsTrigger 
                  value="categories" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white hover:bg-purple-50 transition-all duration-300 rounded-xl"
                >
                  🏷️ Categories
                </TabsTrigger>
                <TabsTrigger 
                  value="campaigns" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white hover:bg-pink-50 transition-all duration-300 rounded-xl"
                >
                  📢 Campaigns
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white hover:bg-yellow-50 transition-all duration-300 rounded-xl"
                >
                  🛒 Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="invoices" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white hover:bg-orange-50 transition-all duration-300 rounded-xl"
                >
                  📄 Invoices
                </TabsTrigger>
              </TabsList>
              
              {/* Second row of tabs */}
              <TabsList className="grid w-full grid-cols-6 gap-1 h-auto bg-transparent mt-2">
                <TabsTrigger 
                  value="reports" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white hover:bg-red-50 transition-all duration-300 rounded-xl"
                >
                  📈 Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white hover:bg-cyan-50 transition-all duration-300 rounded-xl"
                >
                  🔔 Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="banners" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white hover:bg-emerald-50 transition-all duration-300 rounded-xl"
                >
                  🖼️ Banners
                </TabsTrigger>
                <TabsTrigger 
                  value="logo" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white hover:bg-violet-50 transition-all duration-300 rounded-xl"
                >
                  🏷️ Logo
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white hover:bg-teal-50 transition-all duration-300 rounded-xl"
                >
                  💾 Data
                </TabsTrigger>
                <TabsTrigger 
                  value="blog" 
                  className="h-12 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white hover:bg-rose-50 transition-all duration-300 rounded-xl"
                >
                  📝 Blog
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Enhanced Stats Grid with mobile-first responsive design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <Card 
                  key={index} 
                  className={`group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-0 bg-gradient-to-br ${stat.bgGradient} shadow-lg hover:shadow-xl cursor-pointer animate-in fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                          {stat.title}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                          {stat.value}
                        </p>
                        <p className={`text-xs sm:text-sm font-medium ${stat.changeColor} flex items-center`}>
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders with enhanced mobile design */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {recentOrders.map((order, index) => (
                    <div 
                      key={order.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300 transform hover:scale-102 cursor-pointer animate-in fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="mb-3 sm:mb-0">
                        <p className="font-bold text-gray-900 text-lg mb-1">{order.id}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {order.customer}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-xl text-gray-900">{order.amount}</p>
                        </div>
                        <span className={`text-sm font-semibold px-4 py-2 rounded-full ${order.statusColor} shadow-md`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-200">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  User Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <UserManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-200">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Product Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <ProductManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-200">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <PieChart className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Category Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <CategoryManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-pink-200">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Campaign Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <CampaignManager />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Order Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <OrderManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-200">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <BarChart className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Invoice Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <InvoiceManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-200">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <LineChart className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Reports & Analytics
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <ReportingAnalytics />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-cyan-200">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Notification Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <NotificationManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="banners" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-200">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Banner Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <BannerManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logo" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-violet-200">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Logo Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <LogoManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-teal-200">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <Save className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Data Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <DataManagement />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-rose-200">
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 sm:p-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <Edit className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
                  Blog Management
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <BlogManagement />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
