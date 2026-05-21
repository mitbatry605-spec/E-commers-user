import React, { useState, useEffect } from 'react';
import { CloseOutlined, MailOutlined } from '@ant-design/icons';

const VerificationModal = ({ isOpen, onClose, email, onVerifySuccess }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const API_BASE_URL = 'http://localhost:8000/api';
    
    try {
      // Send as query parameters (GET style but with POST)
      const response = await fetch(`${API_BASE_URL}/auth/verify-email?email=${encodeURIComponent(email)}&code=${verificationCode}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onVerifySuccess(data.user);
        onClose();
      } else {
        let errorMsg = 'Verification failed';
        if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          errorMsg = data.detail[0].msg || 'Invalid verification code';
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError('');
    const API_BASE_URL = 'http://localhost:8000/api';
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-email-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });
      
      if (response.ok) {
        setResendTimer(60);
        setCode(['', '', '', '', '', '']);
        document.getElementById('code-input-0')?.focus();
        setError('');
      } else {
        const data = await response.json();
        let errorMsg = 'Failed to resend code';
        if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('code-input-0')?.focus();
      }, 100);
      setCode(['', '', '', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseOutlined />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <MailOutlined className="text-3xl text-green-600" />
            </div>
            <p className="text-gray-600">
              We've sent an activation code to<br/>
              <strong className="text-gray-900 text-lg">{email}</strong>
            </p>
          </div>
          
          {/* 6-digit code inputs */}
          <div className="flex gap-2 justify-center mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
              />
            ))}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-[#004d2c] text-white py-3 rounded-xl font-semibold hover:bg-green-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          
          {/* Resend code */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                className={`text-green-600 font-semibold ${
                  resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
                }`}
              >
                Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;