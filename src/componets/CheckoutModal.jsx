// front-user/src/componets/CheckoutModal.jsx
import React, { useState } from 'react';
import { CloseOutlined, UserOutlined, MailOutlined, PhoneOutlined, QrcodeOutlined, CreditCardOutlined } from '@ant-design/icons';
import KHQRPayment from './KHQRPayment';

const CheckoutModal = ({ isOpen, onClose, cartItems, totalAmount, onCheckoutSuccess, user, onLoginClick }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKHQR, setShowKHQR] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('khqr');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Pre-fill form with user data if logged in
  React.useEffect(() => {
    if (user && isOpen) {
      setFormData({
        customer_name: user.full_name || '',
        customer_email: user.email || '',
        customer_phone: user.phone || ''
      });
      setShowCheckoutForm(true);
    }
  }, [user, isOpen]);

  const handleProceedToCheckout = () => {
    if (!user) {
      setError('Please login or register to continue checkout');
      setTimeout(() => {
        onLoginClick();
      }, 1500);
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const createOrder = async () => {
    const items = cartItems.map(item => ({
      product_id: item.product_id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size || 'M'
    }));

    const sessionId = localStorage.getItem('sessionId');
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId || 'default_session'
    };
    
    // ✅ IMPORTANT: Send token if user is logged in
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Creating order with authentication');
    }

    const requestBody = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      items: items
    };

    console.log('📤 Creating order...');
    const response = await fetch('http://localhost:8000/api/orders/create', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('📥 Order response:', data);

    if (!response.ok) {
      throw new Error(data.detail || 'Checkout failed');
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.customer_name || !formData.customer_email) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const order = await createOrder();
      setCreatedOrder(order);
      
      if (paymentMethod === 'khqr') {
        setShowKHQR(true);
      } else {
        onCheckoutSuccess(order);
        onClose();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment success:', paymentData);
    onCheckoutSuccess(createdOrder);
  };

  const handlePaymentClose = () => {
    setShowKHQR(false);
    onClose();
  };

  if (!isOpen) return null;

  // Login required modal
  if (!user && !showCheckoutForm) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-6 text-center">
            <div className="text-5xl mb-2">🔐</div>
            <h2 className="text-2xl font-bold text-white">Login Required</h2>
            <p className="text-amber-200 text-sm mt-1">Please login to continue checkout</p>
          </div>

          <div className="p-6 text-center">
            <p className="text-gray-600 mb-6">You need to be logged in to place an order.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClose();
                  onLoginClick();
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition"
              >
                Login / Register
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form
  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <CloseOutlined />
            </button>
          </div>

          <div className="p-6">
            {/* User Info Display */}
            {user && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Logged in as: <strong>{user?.full_name || user?.email}</strong>
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-[#004d2c]">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('khqr')}
                  className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                    paymentMethod === 'khqr' 
                      ? 'border-green-600 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <QrcodeOutlined className="text-lg" />
                  <span className="font-medium">KHQR Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-green-600 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCardOutlined className="text-lg" />
                  <span className="font-medium">Cash on Delivery</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MailOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (optional)</label>
                <div className="relative">
                  <PhoneOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004d2c] text-white py-3 rounded-xl font-semibold hover:bg-green-900 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : paymentMethod === 'khqr' ? `Pay $${totalAmount.toFixed(2)} with KHQR` : `Place Order • $${totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* KHQR Payment Modal */}
      {createdOrder && (
        <KHQRPayment
          isOpen={showKHQR}
          onClose={handlePaymentClose}
          orderId={createdOrder.id}
          amount={totalAmount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default CheckoutModal;