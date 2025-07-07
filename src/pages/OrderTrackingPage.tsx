import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  ShoppingBag,
  Eye,
  Loader2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { OrderService, Order, OrderItem } from '../services/OrderService';

const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const trackingNumber = searchParams.get("trackingNumber");
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (trackingNumber?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (trackingNumber) {
        // Fetch order by tracking number
        const orderData = await OrderService.trackOrder(trackingNumber);
        setOrder(orderData);

        // Fetch order items
        const { items } = await OrderService.getOrderById(String(orderData.id));
        setOrderItems(items);
      } else {
        // Fetch all orders for the user
        const orderData = await OrderService.getUserOrders(user.ID);
        if (orderData && orderData.length > 0) {
          // For simplicity, just take the first order and its items
          const firstOrder = orderData[0];
          setOrder(firstOrder);
          const { items } = await OrderService.getOrderById(String(firstOrder.id));
          setOrderItems(items);
        } else {
          setOrder(null);
          setOrderItems(null);
        }
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.message || "Failed to load order details.");
      toast({
        title: "Error",
        description: err.message || "Failed to load order details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatAddress = (addressString: string) => {
    try {
      const address = JSON.parse(addressString);
      return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    } catch {
      return addressString;
    }
  };

  useEffect(() => {
    fetchOrder(trackingNumber);
  }, [user, trackingNumber]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login to track your orders
            </p>
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-32 w-32 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Order</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order with tracking number "{trackingNumber}" could not be found.</p>
            <Button asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            Order Tracking
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage your order
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center space-x-3">
                  <span>Order #{order.id}</span>
                  <Badge className={getStatusColor(order.order_status)}>
                    {getStatusIcon(order.order_status)}
                    <span className="ml-1 capitalize">{order.order_status}</span>
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(order.order_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">${order.order_total.toFixed(2)}</span>
                  </div>
                  {order.delivery_partner_name && (
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      <span>{order.delivery_partner_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Order Information</h4>

                {order.tracking_number && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tracking Number:</span>
                    <p className="text-sm text-gray-900 font-mono">{order.tracking_number}</p>
                    {order.delivery_partner_link && (
                      <a 
                        href={order.delivery_partner_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Track with {order.delivery_partner_name || 'Delivery Partner'}
                      </a>
                    )}
                  </div>
                )}

                <div >
                  <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                  <p className="text-sm text-gray-900">{order.payment_method}</p>
                </div>

                {order.estimated_delivery && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Estimated Delivery:</span>
                    <p className="text-sm text-gray-900">
                      {new Date(order.estimated_delivery).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Shipping Address:
                  </span>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatAddress(order.shipping_address)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Items Ordered</h4>

                <div className="space-y-3">
                  {orderItems && orderItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_name}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.product_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ${(item.quantity * item.product_price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

