import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Eye, Truck, XCircle, CheckCircle, Loader2, DollarSign } from 'lucide-react';
import { OrderService, Order, OrderItem } from '../services/OrderService';
import { format, formatDistanceToNow } from 'date-fns';

interface OrderManagementProps {}

const OrderManagement: React.FC<OrderManagementProps> = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [filterStatus, setFilterStatus] = useState('all');

  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);
  const [currentViewingOrder, setCurrentViewingOrder] = useState<(Order & { items: OrderItem[] }) | null>(null);

  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Order['order_status']>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryPartnerName, setDeliveryPartnerName] = useState('');
  const [deliveryPartnerLink, setDeliveryPartnerLink] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await OrderService.getAllOrders({
        pageNo: page,
        pageSize: pageSize,
        status: filterStatus === 'all' ? undefined : filterStatus
      });
      setOrders(result.orders);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch orders.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderClick = async (orderId: string) => {
    setLoading(true);
    try {
      const result = await OrderService.getOrderById(orderId);
      setCurrentViewingOrder(result.order); // Set the order object directly
      // The items are already part of the result, so no need to explicitly add them to the type of currentViewingOrder
      // The type of currentViewingOrder should be Order & { items: OrderItem[] }
      // So, I need to ensure that the result.order object contains the items array.
      // Let's re-check OrderService.ts for getOrderById return type.
      // OrderService.ts getOrderById returns { order, items }.
      // So, currentViewingOrder should be set to result.order, and items should be accessed as currentViewingOrder.items.
      // This means the type of currentViewingOrder should be Order & { items: OrderItem[] }
      // I need to modify the type of currentViewingOrder to be just Order, and then access items separately.
      // Or, I can modify the getOrderById to return Order & { items: OrderItem[] }
      // Let's modify the type of currentViewingOrder to be just Order, and then access items separately.
      // No, the current type is correct. The issue is how I'm setting it.
      // The result from getOrderById is { order: Order, items: OrderItem[] }.
      // So, I need to set currentViewingOrder to result.order, and then access items as result.items.
      // This means I need to change the type of currentViewingOrder to be { order: Order, items: OrderItem[] }
      // Let's change the type of currentViewingOrder to be { order: Order, items: OrderItem[] }
      // No, the type of currentViewingOrder is already (Order & { items: OrderItem[] }) | null.
      // This means currentViewingOrder itself should contain the order properties AND the items array.
      // So, I need to combine result.order and result.items into a single object.
      setCurrentViewingOrder({ ...result.order, items: result.items });
      setIsViewOrderModalOpen(true);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch order details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatusClick = (order: Order) => {
    setOrderToUpdate(order);
    setNewStatus(order.order_status);
    setTrackingNumber(order.tracking_number || '');
    setDeliveryPartnerName(order.delivery_partner_name || '');
    setDeliveryPartnerLink(order.delivery_partner_link || '');
    setIsUpdateStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!orderToUpdate) return;
    setLoading(true);
    try {
      await OrderService.updateOrderStatus(
        orderToUpdate.id.toString(), 
        newStatus, 
        trackingNumber,
        deliveryPartnerName,
        deliveryPartnerLink
      );
      toast({
        title: 'Success',
        description: 'Order status updated successfully.',
        variant: 'default'
      });
      setIsUpdateStatusModalOpen(false);
      setOrderToUpdate(null);
      fetchOrders();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update order status.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: Order['order_status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Management
        </CardTitle>
        <CardDescription>View and manage customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={fetchOrders} className="mt-4">Retry</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No orders found.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.user_id}</TableCell>
                    <TableCell>${order.order_total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.order_status)}`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.order_date ? (
                        <div>
                          <div>{format(new Date(order.order_date), 'MMM d, yyyy, h:mm a')}</div>
                          <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(order.order_date), { addSuffix: true })}</div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewOrderClick(order.id.toString())}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleUpdateStatusClick(order)}>
                        <Truck className="h-4 w-4" />
                      </Button>
                      {/* Placeholder for Refund */}
                      <Button variant="ghost" size="sm" disabled>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* View Order Details Modal */}
      <Dialog open={isViewOrderModalOpen} onOpenChange={setIsViewOrderModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details #{currentViewingOrder?.id}</DialogTitle>
            <CardDescription>Details for order placed by {currentViewingOrder?.user_id}</CardDescription>
          </DialogHeader>
          {currentViewingOrder && (
            <div className="grid gap-4 py-4">
              <p><strong>Total:</strong> ${currentViewingOrder.order_total.toFixed(2)}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(currentViewingOrder.order_status)}`}>
                {currentViewingOrder.order_status.charAt(0).toUpperCase() + currentViewingOrder.order_status.slice(1)}
              </span></p>
              <p><strong>Order Date:</strong> {new Date(currentViewingOrder.order_date).toLocaleString()}</p>
              <p><strong>Shipping Address:</strong> {JSON.parse(currentViewingOrder.shipping_address).street}, {JSON.parse(currentViewingOrder.shipping_address).city}</p>
              <p><strong>Payment Method:</strong> {currentViewingOrder.payment_method}</p>
              <p><strong>Tracking Number:</strong> {currentViewingOrder.tracking_number || 'N/A'}</p>
              {currentViewingOrder.delivery_partner_name && (
                <p><strong>Delivery Partner:</strong> {currentViewingOrder.delivery_partner_name}</p>
              )}
              {currentViewingOrder.delivery_partner_link && (
                <p><strong>Tracking Link:</strong> 
                  <a href={currentViewingOrder.delivery_partner_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    Track Package
                  </a>
                </p>
              )}
              <p><strong>Estimated Delivery:</strong> {new Date(currentViewingOrder.estimated_delivery).toLocaleDateString()}</p>

              <h4 className="font-semibold mt-4">Order Items:</h4>
              {currentViewingOrder.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentViewingOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.product_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No items found for this order.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOrderModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Order Status Modal */}
      <Dialog open={isUpdateStatusModalOpen} onOpenChange={setIsUpdateStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <CardDescription>
              Update status for Order #{orderToUpdate?.id}
            </CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Order['order_status'])}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(newStatus === 'shipped' || newStatus === 'delivered') && (
              <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="trackingNumber" className="text-right">
                  Tracking Number
                </Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="col-span-3"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deliveryPartnerName" className="text-right">
                    Delivery Partner
                  </Label>
                  <Input
                    id="deliveryPartnerName"
                    value={deliveryPartnerName}
                    onChange={(e) => setDeliveryPartnerName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., FedEx, UPS, DHL"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deliveryPartnerLink" className="text-right">
                    Tracking Link
                  </Label>
                  <Input
                    id="deliveryPartnerLink"
                    value={deliveryPartnerLink}
                    onChange={(e) => setDeliveryPartnerLink(e.target.value)}
                    className="col-span-3"
                    placeholder="https://tracking.example.com"
                />
              </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatus} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OrderManagement;
