// front-user/src/componets/KHQRPayment.jsx
import React, { useState, useEffect } from 'react';
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';

const KHQRPayment = ({ isOpen, onClose, orderId, amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentWindow, setPaymentWindow] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Create payment when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      console.log('🎯 KHQRPayment opened for order:', orderId);
      createPayment();
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
    };
  }, [isOpen, orderId]);

  // ============= LISTEN FOR MESSAGES FROM PAYMENT-RETURN PAGE =============
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("📨 Message received in KHQRPayment:", event.data);
      
      // Check origin for security
      if (event.origin !== 'http://localhost:3000') return;
      
      if (event.data.type === 'KHQR_PAYMENT_SUCCESS') {
        console.log("✅ Payment success! Transaction ID:", event.data.transaction_id);
        console.log("   Amount:", event.data.success_amount);
        
        // Close popup if still open
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.close();
        }
        
        // Stop polling if active
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        // Show success modal
        setPaymentData({
          amount: event.data.success_amount || amount,
          transaction_id: event.data.transaction_id,
          order_id: orderId
        });
        setShowSuccessModal(true);
        setLoading(false);
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(event.data);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [paymentWindow, pollingInterval, onSuccess, orderId, amount]);

  const createPayment = async () => {
    console.log('💰 Creating KHQR payment for order:', orderId);
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/khqr-payment`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📥 KHQR Response:', data);
      
      if (response.ok && data.payment_url) {
        console.log('✅ Opening KHQR Popup with URL:', data.payment_url);
        
        // Open KHQR payment popup
        const khqrWindow = window.open(
          data.payment_url,
          'KHQR Payment',
          'width=500,height=600,left=200,top=100,scrollbars=yes,resizable=yes'
        );
        
        setPaymentWindow(khqrWindow);
        
        if (!khqrWindow) {
          console.error('❌ Popup blocked!');
          setError('Popup blocked! Please allow popups for this website.');
          setLoading(false);
        }
      } else {
        console.error('❌ Failed to create payment:', data);
        setError(data.detail || 'Failed to create payment');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center">
              <CheckCircleOutlined className="text-5xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">Payment Successful!</h2>
            <p className="text-green-100 text-sm mt-2">Thank you for your purchase</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wide">Amount Paid</p>
              <p className="text-3xl font-bold text-green-600">${(paymentData?.amount || amount).toFixed(2)}</p>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-gray-600 text-sm font-medium mb-2">Order Information</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Order ID:</span> #{orderId}</p>
                <p><span className="text-gray-500">Transaction ID:</span> {paymentData?.transaction_id?.slice(0, 20)}...</p>
                <p><span className="text-gray-500">Payment Date:</span> {new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                  window.location.reload();
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen && !showSuccessModal) return null;

  return (
    <>
      <SuccessModal />
      
      {isOpen && !showSuccessModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
          
          <div className="relative bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
            {loading ? (
              <>
                <LoadingOutlined className="text-4xl text-green-600 animate-spin" />
                <p className="mt-4 text-gray-600 font-medium">Creating KHQR Payment...</p>
                <p className="text-xs text-gray-400 mt-2">Please wait...</p>
              </>
            ) : error ? (
              <>
                <div className="text-red-500 text-lg mb-3">❌</div>
                <div className="text-red-600 mb-4 text-sm">{error}</div>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={createPayment}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default KHQRPayment;