import React, { useState } from 'react';
import { HomeOutlined, PlusOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined } from '@ant-design/icons';

const AddressBook = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: 'Home',
      address: '123 Street, Phnom Penh, Cambodia',
      phone: '012345678',
      isDefault: true
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    phone: ''
  });

  const handleAddAddress = () => {
    if (formData.title && formData.address) {
      const newAddress = {
        id: Date.now(),
        ...formData,
        isDefault: addresses.length === 0
      };
      setAddresses([...addresses, newAddress]);
      setFormData({ title: '', address: '', phone: '' });
      setShowForm(false);
    }
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#004d2c] text-white rounded-lg hover:bg-green-900 transition-colors"
        >
          <PlusOutlined /> Add New Address
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Add New Address</h3>
          <input
            type="text"
            placeholder="Address Title (e.g., Home, Office)"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:border-green-500"
          />
          <input
            type="text"
            placeholder="Full Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:border-green-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:border-green-500"
          />
          <div className="flex gap-2">
            <button onClick={handleAddAddress} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr.id} className={`p-4 border rounded-lg ${addr.isDefault ? 'border-green-500 bg-green-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <EnvironmentOutlined className="text-gray-400 mt-1" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{addr.title}</h3>
                    {addr.isDefault && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{addr.address}</p>
                  <p className="text-gray-400 text-xs mt-1">Phone: {addr.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-green-600 hover:underline">Set as Default</button>
                )}
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-700">
                  <DeleteOutlined />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressBook;