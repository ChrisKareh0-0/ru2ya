'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentMethod: string;
  items: Array<{
    id: number;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove order from local state
        setOrders(prev => prev.filter(order => order.id !== orderId));
      } else {
        console.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7C805A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/x7k9m2p/dashboard')}
                className="px-4 py-2 bg-white/20 text-[#7C805A] border border-white/30 rounded-lg hover:bg-white/30 transition-colors font-light flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-4xl font-light text-[#7C805A] font-elegant">Orders Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-[#7C805A] text-[#F5E6D3] rounded-lg font-light hover:bg-[#6A7150] transition-colors"
              >
                Refresh Orders
              </button>
              <div className="text-sm text-[#7C805A] font-light">
                Total Orders: {orders.length}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-black/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-light text-[#7C805A] mb-2">Order #{order.id}</h3>
                    <p className="text-[#7C805A] font-light opacity-80">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-light ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-2xl font-light text-[#7C805A]">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  {/* Customer Information */}
                  <div>
                    <h4 className="text-lg font-light text-[#7C805A] mb-3">Customer Information</h4>
                    <div className="space-y-2 text-[#7C805A] font-light">
                      <p><span className="font-medium">Name:</span> {order.customerName}</p>
                      <p><span className="font-medium">Email:</span> {order.email}</p>
                      <p><span className="font-medium">Phone:</span> {order.phone}</p>
                      <p><span className="font-medium">Address:</span> {order.address}</p>
                      <p><span className="font-medium">City:</span> {order.city}, {order.country}</p>
                      <p><span className="font-medium">Payment:</span> {order.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-lg font-light text-[#7C805A] mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white/10 rounded-lg">
                          <span className="text-[#7C805A] font-light">{item.productName}</span>
                          <div className="text-right">
                            <p className="text-[#7C805A] font-light">Qty: {item.quantity}</p>
                            <p className="text-[#7C805A] font-medium">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-light text-[#7C805A]">Update Status</h4>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="px-3 py-1 bg-red-600/20 text-red-600 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors font-light"
                    >
                      Delete Order
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order.id, status)}
                        className={`px-3 py-1 rounded-lg text-sm font-light transition-all duration-200 ${
                          order.status === status
                            ? 'bg-[#7C805A] text-[#F5E6D3]'
                            : 'bg-white/20 text-[#7C805A] hover:bg-white/30'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-light text-[#7C805A] mb-2">No orders yet</h3>
              <p className="text-[#7C805A] font-light opacity-80">Orders will appear here once customers place them.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
