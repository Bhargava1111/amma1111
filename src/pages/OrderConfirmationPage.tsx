import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { OrderService, Order, OrderItem } from '../services/OrderService'; // Import OrderService and types
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();

  const [orderDetails, setOrderDetails] = useState<{ order: Order | null; items: OrderItem[] | null }>({ order: null, items: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await OrderService.getOrderById(orderId);
        setOrderDetails(data);
      } catch (err: any) {
        console.error("Error fetching order details:", err);
        setError(err.message || "Failed to load order details.");
        toast({
          title: "Error",
          description: err.message || "Failed to load order details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading order details...</span>
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

  if (!orderDetails.order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order with ID "{orderId}" could not be found.</p>
            <Button asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { order, items } = orderDetails;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Order Number</p>
                    <p className="text-lg font-semibold text-gray-900">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Order Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {order.order_date ? (
                        <>
                          {format(new Date(order.order_date), 'MMM d, yyyy, h:mm a')}
                          <span className="block text-xs text-gray-500">{formatDistanceToNow(new Date(order.order_date), { addSuffix: true })}</span>
                        </>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.order_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.order_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {order.estimated_delivery ? (
                        <>
                          {format(new Date(order.estimated_delivery), 'MMM d, yyyy, h:mm a')}
                          <span className="block text-xs text-gray-500">{formatDistanceToNow(new Date(order.estimated_delivery), { addSuffix: true })}</span>
                        </>
                      ) : 'N/A'}
                    </p>
                  </div>
                  {order.tracking_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tracking Number</p>
                      <p className="text-lg font-semibold text-gray-900">{order.tracking_number}</p>
                      {order.delivery_partner_name && (
                        <p className="text-sm text-gray-600">via {order.delivery_partner_name}</p>
                      )}
                      {order.delivery_partner_link && (
                        <a 
                          href={order.delivery_partner_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          Track Package
                        </a>
                      )}
                    </div>
                  )}
                  {order.payment_method && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payment Method</p>
                      <p className="text-lg font-semibold text-gray-900">{order.payment_method}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items && items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{(item.product_price * item.quantity * 83).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Processing</p>
                      <p className="text-sm text-gray-600">
                        We're preparing your items for shipment. This usually takes 1-2 business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Shipping Notification</p>
                      <p className="text-sm text-gray-600">
                        Once your order ships, we'll send you tracking information via email.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Delivery</p>
                      <p className="text-sm text-gray-600">
                        Your order will be delivered to your specified address by {new Date(order.estimated_delivery).toLocaleDateString()}.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{(order.order_total).toFixed(0)}</span>
                  </div>
                  {/* Shipping and Tax might need to be calculated or fetched if not stored directly */}
                  {/* For now, using placeholders or simplified calculation */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                       {/* Assuming shipping is included in total or calculated */}
                       Free {/* Placeholder */}
                    </span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">
                       {/* Assuming tax is included in total or calculated */}
                       ₹{(order.order_total * 0.18).toFixed(0)} {/* GST 18% */}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{(order.order_total * 1.18).toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Button asChild className="w-full">
                  <Link to={`/orders/${order.tracking_number}`}>
                    <Package className="w-4 h-4 mr-2" />
                    Track Your Order
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link to="/products">
                    Continue Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <div className="text-center pt-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>Order confirmation sent to your email</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    If you have any questions about your order, our customer support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> support@manafoods.com
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> 1-800-123-4567
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Hours:</span> Mon-Fri 9AM-6PM EST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

