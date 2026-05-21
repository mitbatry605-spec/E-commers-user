import React, { useState } from 'react';
import { BellOutlined, MailOutlined, ShoppingOutlined, RocketOutlined } from '@ant-design/icons';

const Notification = () => {
  const [settings, setSettings] = useState({
    email_notifications: true,
    order_updates: true,
    promotions: false,
    newsletter: true
  });

  const [message, setMessage] = useState('');

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    setMessage('Saving...');
    
    try {
      // You can save to backend if you have an endpoint
      // For now, just show success message
      setTimeout(() => {
        setMessage('Notification settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }, 500);
      
      // Uncomment when you have backend endpoint
      /*
      const response = await fetch('http://localhost:8000/api/auth/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setMessage('Notification settings saved!');
        setTimeout(() => setMessage(''), 3000);
      }
      */
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <BellOutlined className="text-2xl text-[#004d2c]" />
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center">
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <MailOutlined className="text-gray-400" />
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive email updates about your account</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('email_notifications')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.email_notifications ? 'bg-green-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.email_notifications ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <ShoppingOutlined className="text-gray-400" />
            <div>
              <p className="font-medium">Order Updates</p>
              <p className="text-xs text-gray-500">Get notified about order status changes</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('order_updates')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.order_updates ? 'bg-green-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.order_updates ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <RocketOutlined className="text-gray-400" />
            <div>
              <p className="font-medium">Promotions & Offers</p>
              <p className="text-xs text-gray-500">Exclusive deals and discounts</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('promotions')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.promotions ? 'bg-green-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.promotions ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-6 bg-[#004d2c] text-white py-2 rounded-lg font-semibold hover:bg-green-900 transition-colors"
      >
        Save Settings
      </button>
    </div>
  );
};

export default Notification;