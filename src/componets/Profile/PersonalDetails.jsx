import React, { useState, useEffect } from 'react';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

const PersonalDetails = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUpdate(updatedUser);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <EditOutlined /> Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CloseOutlined /> Cancel
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="border-b pb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          ) : (
            <div className="flex items-center gap-2">
              <UserOutlined className="text-gray-400" />
              <span className="text-gray-900">{formData.full_name || 'Not set'}</span>
            </div>
          )}
        </div>

        <div className="border-b pb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
          <div className="flex items-center gap-2">
            <MailOutlined className="text-gray-400" />
            <span className="text-gray-900">{formData.email}</span>
            {user?.is_email_verified && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Verified</span>
            )}
          </div>
        </div>

        <div className="border-b pb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          ) : (
            <div className="flex items-center gap-2">
              <PhoneOutlined className="text-gray-400" />
              <span className="text-gray-900">{formData.phone || 'Not set'}</span>
            </div>
          )}
        </div>

        {isEditing && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#004d2c] text-white py-2 rounded-lg font-semibold hover:bg-green-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><SaveOutlined /> Save Changes</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default PersonalDetails;