// front-user/src/componets/PaymentReturn.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // Get parameters from URL
  const transactionId = searchParams.get('transaction_id');
  const successHash = searchParams.get('success_hash');
  const successAmount = searchParams.get('success_amount');
  const reqTime = searchParams.get('req_time');

  console.log('📥 Payment Return Page - Params:', {
    transactionId,
    successHash,
    successAmount,
    reqTime
  });

  useEffect(() => {
    const verifyAndNotify = async () => {
      // If no transaction_id, show error
      if (!transactionId) {
        console.log('❌ No transaction_id found');
        setStatus('failed');
        setErrorMsg('No transaction information found');
        return;
      }

      // Verify payment with backend
      try {
        const response = await fetch('http://localhost:8000/api/orders/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: transactionId,
            success_hash: successHash,
            success_amount: successAmount,
            success_time: reqTime
          })
        });
        
        const data = await response.json();
        console.log('📥 Verification response:', data);
        
        if (data.verified === true) {
          setStatus('success');
          
          // Send message to parent window (the main app)
          if (window.opener) {
            console.log('📤 Sending success message to parent');
            window.opener.postMessage({
              type: 'KHQR_PAYMENT_SUCCESS',
              transaction_id: transactionId,
              amount: successAmount || data.amount,
              order_id: data.order_id
            }, 'http://localhost:3000');
            
            // Close popup after 2 seconds
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            // If not a popup, redirect to home after 3 seconds
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        } else {
          setStatus('failed');
          setErrorMsg('Payment verification failed');
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        setStatus('failed');
        setErrorMsg('Network error. Please try again.');
      }
    };

    verifyAndNotify();
  }, [transactionId, successHash, successAmount, reqTime, navigate]);

  // Listen for messages from parent (optional)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'CLOSE_PAYMENT_POPUP') {
        window.close();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingOutlined className="text-4xl text-green-600 animate-spin" />
          <p className="mt-4 text-gray-600 font-medium">Processing payment...</p>
          <p className="text-xs text-gray-400 mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
          <CheckCircleOutlined className="text-6xl text-green-500" />
          <h1 className="text-2xl font-bold text-green-600 mt-4">Payment Successful!</h1>
          <p className="text-gray-600 mt-2">Thank you for your purchase.</p>
          <p className="text-sm text-gray-500 mt-1">Amount: ${parseFloat(successAmount || '0').toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-4">This window will close automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
        <CloseCircleOutlined className="text-6xl text-red-500" />
        <h1 className="text-2xl font-bold text-red-600 mt-4">Payment Failed!</h1>
        <p className="text-gray-600 mt-2">Your payment could not be processed.</p>
        {errorMsg && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
        <button 
          onClick={() => window.close()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentReturn;