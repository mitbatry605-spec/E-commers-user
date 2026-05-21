import React from 'react';
import { 
  UserOutlined, 
  EnvironmentOutlined,
  ShoppingOutlined,
  LockOutlined,
  BellOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const UserDropdown = ({ user, onLogout, onNavigate, onClose }) => {
  if (!user) return null;

  const handleNavigation = (page) => {
    onNavigate(page);
    onClose();
  };

  const menuItems = [
    {
      section: "MY ACCOUNT",
      items: [
        { icon: <UserOutlined />, label: "Personal Details", key: "personal" },
        { icon: <EnvironmentOutlined />, label: "Address Book", key: "address" }
      ]
    },
    {
      section: "MY SHOP",
      items: [
        { icon: <ShoppingOutlined />, label: "Order", key: "orders" }
      ]
    },
    {
      section: "SETTINGS",
      items: [
        { icon: <LockOutlined />, label: "Change Password", key: "password" },
        { icon: <BellOutlined />, label: "Notification", key: "notification" }
      ]
    }
  ];

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* User Header */}
      <div className="bg-gradient-to-r from-[#004d2c] to-[#00a86b] p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <UserOutlined className="text-2xl text-[#004d2c]" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{user.full_name || 'User'}</h3>
            <p className="text-xs opacity-80">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/20">
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">ONLINE Member</span>
          <p className="text-xs mt-2 opacity-80">You don't have made any purchase yet!</p>
        </div>
      </div>

      {/* Menu Items */}
      {menuItems.map((section, idx) => (
        <div key={idx} className="p-3 border-b">
          <p className="text-xs font-semibold text-gray-400 mb-2 px-2">{section.section}</p>
          {section.items.map((item, itemIdx) => (
            <button
              key={itemIdx}
              onClick={() => handleNavigation(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}

      {/* Logout Button */}
      <div className="p-3">
        <button 
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogoutOutlined />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;