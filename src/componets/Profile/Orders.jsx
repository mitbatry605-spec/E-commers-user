// front-user/src/componets/Profile/Orders.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingOutlined, EyeOutlined } from '@ant-design/icons';

const Orders = ({ onStartShopping }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Phnom_Penh'
    };
    return date.toLocaleString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'paid': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'delivered': return 'text-green-700 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '⏳';
      case 'paid': return '✅';
      case 'shipped': return '📦';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pending Payment';
      case 'paid': return 'Payment Confirmed';
      case 'shipped': return 'Shipping';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status?.toUpperCase() || 'PENDING';
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setError('Please login to view your orders');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching user orders...');
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Orders fetched:', data.length, 'orders');
        setOrders(data);
      } else {
        setError('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed: Use window.confirm instead of confirm
  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem('access_token');
    
    // Use window.confirm to avoid ESLint error
    const isConfirmed = window.confirm('Are you sure you want to cancel this order?');
    if (!isConfirmed) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        window.alert('Order cancelled successfully');
        fetchOrders();
      } else {
        const data = await response.json();
        window.alert(data.detail || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      window.alert('Network error');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    
    let items = order.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Order #:</strong> {order.id}</p>
              <p className="text-sm"><strong>Date:</strong> {formatDate(order.created_at)}</p>
              <p className="text-sm"><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)} {getStatusText(order.status)}
                </span>
              </p>
              <p className="text-sm"><strong>Total:</strong> <span className="font-bold text-green-600">${order.total_amount?.toFixed(2)}</span></p>
            </div>
            
            <div className="border-t pt-3">
              <p className="font-semibold mb-2">Items:</p>
              <div className="space-y-2">
                {items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm border-b pb-2">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.size && <span className="text-gray-500 text-xs ml-2">Size: {item.size}</span>}
                      <span className="text-gray-500 text-xs ml-2">x{item.quantity}</span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-3">
              <p className="font-semibold mb-2">Customer Info:</p>
              <p className="text-sm"><strong>Name:</strong> {order.customer_name}</p>
              <p className="text-sm"><strong>Email:</strong> {order.customer_email}</p>
              {order.customer_phone && <p className="text-sm"><strong>Phone:</strong> {order.customer_phone}</p>}
            </div>
          </div>
          
          <button onClick={onClose} className="mt-5 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition">
            Close
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={fetchOrders} className="px-4 py-2 bg-green-600 text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingOutlined className="text-5xl text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
        <button onClick={onStartShopping} className="px-6 py-3 bg-[#004d2c] text-white rounded-xl font-semibold hover:bg-green-900 transition">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 text-sm">View and track your order history</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          let items = order.items;
          if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch (e) { items = []; }
          }
          
          return (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-900">Order #{order.id}</span>
                    <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#004d2c]">${order.total_amount?.toFixed(2) || '0.00'}</div>
                  <div className="text-xs text-gray-500">{items?.length || 0} item(s)</div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                        {item.size && <span className="text-gray-500 text-xs ml-2">Size: {item.size}</span>}
                        <span className="text-gray-500 text-xs ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {items?.length > 3 && (
                    <p className="text-xs text-gray-400">+{items.length - 3} more items</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3">
                  <button 
                    onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 transition"
                  >
                    <EyeOutlined /> View Details
                  </button>
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => cancelOrder(order.id)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showDetails && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setShowDetails(false)} />
      )}
    </div>
  );
};

export default Orders;