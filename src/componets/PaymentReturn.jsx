// front-user/src/componets/PaymentReturn.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [messageSent, setMessageSent] = useState(false);

  const transactionId = searchParams.get('transaction_id');
  const successHash = searchParams.get('success_hash');
  const successAmount = searchParams.get('success_amount');
  const reqTime = searchParams.get('req_time');

  console.log('📥 PaymentReturn Page Loaded');
  console.log('   transaction_id:', transactionId);
  console.log('   success_hash:', successHash);
  console.log('   success_amount:', successAmount);
  console.log('   window.opener:', window.opener ? 'Exists' : 'None');

  useEffect(() => {
    // Try to send message to parent window
    if (window.opener && !messageSent) {
      console.log('📤 Sending message to parent window');
      
      const messageData = {
        type: 'KHQR_PAYMENT_SUCCESS',
        transaction_id: transactionId,
        success_hash: successHash,
        success_amount: successAmount,
        req_time: reqTime
      };
      
      window.opener.postMessage(messageData, 'http://localhost:3000');
      setMessageSent(true);
      
      // Start countdown to close popup
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            console.log('🔒 Closing popup window');
            window.close();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (!window.opener) {
      console.log('⚠️ No window.opener found - redirecting to home');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, [transactionId, successHash, successAmount, reqTime, messageSent]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
        <h2 className="text-xl font-bold text-green-600 mt-4">Payment Successful!</h2>
        <p className="text-gray-600 mt-2">Thank you for your purchase.</p>
        <p className="text-sm text-gray-500 mt-1">Amount: ${parseFloat(successAmount || '0').toFixed(2)}</p>
        <p className="text-xs text-gray-400 mt-4">Closing in {countdown} seconds...</p>
      </div>
    </div>
  );
};

export default PaymentReturn;