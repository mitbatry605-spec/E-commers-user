// front-user/src/componets/Delivery.jsx
import React from 'react';
import { 
  TruckOutlined, 
  ClockCircleOutlined, 
  SafetyOutlined, 
  CustomerServiceOutlined, 
  EnvironmentOutlined, 
  CarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const Delivery = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Delivery Information</h1>
        <p className="text-gray-500">Fast, reliable delivery across Cambodia</p>
      </div>

      {/* Features Grid - Same style as products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <TruckOutlined className="text-xl text-[#004d2c]" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">Free Delivery</h3>
          <p className="text-gray-400 text-xs">On orders over $50</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClockCircleOutlined className="text-xl text-[#004d2c]" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">Fast Delivery</h3>
          <p className="text-gray-400 text-xs">2-5 business days</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <SafetyOutlined className="text-xl text-[#004d2c]" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">Secure Packaging</h3>
          <p className="text-gray-400 text-xs">100% safe delivery</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <CustomerServiceOutlined className="text-xl text-[#004d2c]" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">24/7 Support</h3>
          <p className="text-gray-400 text-xs">Always here to help</p>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CarOutlined className="text-[#004d2c]" />
          Delivery Options
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <span className="font-medium text-gray-800">Standard Delivery</span>
              <p className="text-gray-400 text-xs">5-7 business days</p>
            </div>
            <span className="text-[#004d2c] font-bold">Free</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <span className="font-medium text-gray-800">Express Delivery</span>
              <p className="text-gray-400 text-xs">2-3 business days</p>
            </div>
            <span className="text-[#004d2c] font-bold">$5.99</span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <div>
              <span className="font-medium text-gray-800">Same Day Delivery</span>
              <p className="text-gray-400 text-xs">Order before 12PM (Phnom Penh)</p>
            </div>
            <span className="text-[#004d2c] font-bold">$9.99</span>
          </div>
        </div>
      </div>

      {/* Delivery Areas */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <EnvironmentOutlined className="text-[#004d2c]" />
          Delivery Areas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            "Phnom Penh", "Siem Reap", "Battambang", "Kampong Cham",
            "Sihanoukville", "Kampot", "Takeo", "Kandal"
          ].map((city, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircleOutlined className="text-[#004d2c] text-xs" />
              <span className="text-gray-600 text-sm">{city}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-4 text-center">
          More cities coming soon!
        </p>
      </div>

      {/* Process */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">How It Works</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-8 h-8 bg-[#004d2c] text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
            <p className="text-gray-700 text-sm font-medium">Order</p>
            <p className="text-gray-400 text-xs">Place your order</p>
          </div>
          <div>
            <div className="w-8 h-8 bg-[#004d2c] text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
            <p className="text-gray-700 text-sm font-medium">Pack</p>
            <p className="text-gray-400 text-xs">We prepare it</p>
          </div>
          <div>
            <div className="w-8 h-8 bg-[#004d2c] text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
            <p className="text-gray-700 text-sm font-medium">Deliver</p>
            <p className="text-gray-400 text-xs">Get it fast</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
     
      {/* Contact */}
      <div className="mt-8 text-center border-t border-gray-100 pt-6">
        <p className="text-gray-500 text-xs">
          Questions? Call us: 
          <a href="tel:+855123456789" className="text-[#004d2c] font-medium ml-1">+855 12 345 6789</a>
          <span className="mx-2">or</span>
          <a href="mailto:support@eshop.com" className="text-[#004d2c] font-medium">support@eshop.com</a>
        </p>
      </div>
    </div>
  );
};

export default Delivery;