import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  CreditCard,
  Shield,
  Truck,
  ArrowUp,
  Heart } from
'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                MANAfoods
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner for online shopping. We offer high-quality products 
              with fast delivery and excellent customer service.
            </p>
            <div className="flex justify-center sm:justify-start space-x-3">
              <a href="#" className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-sky-500 hover:bg-sky-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md">
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-600 hover:bg-pink-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md">
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-blue-400 hover:pl-2 transition-all duration-300 block">
                  → Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-blue-400 hover:pl-2 transition-all duration-300 block">
                  → Products
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-blue-400 hover:pl-2 transition-all duration-300 block">
                  → Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-blue-400 hover:pl-2 transition-all duration-300 block">
                  → Contact
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-gray-300 hover:text-blue-400 hover:pl-2 transition-all duration-300 block">
                  → Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-green-400 hover:pl-2 transition-all duration-300 block">
                  → Track Orders
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 hover:pl-2 transition-all duration-300 block">
                  → Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 hover:pl-2 transition-all duration-300 block">
                  → Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 hover:pl-2 transition-all duration-300 block">
                  → Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 hover:pl-2 transition-all duration-300 block">
                  → FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">
              Contact Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center sm:justify-start group">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start group">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">support@manafoods.com</span>
              </div>
              <div className="flex items-start justify-center sm:justify-start group">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300 text-center sm:text-left">
                  123 Commerce Street<br />
                  Business District, NY 10001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-all duration-300 group border border-gray-700">
              <CreditCard className="w-6 h-6 text-green-400 mb-2 sm:mb-0 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-gray-300 text-center font-medium">Secure Payment</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-all duration-300 group border border-gray-700">
              <Shield className="w-6 h-6 text-blue-400 mb-2 sm:mb-0 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-gray-300 text-center font-medium">Privacy Protected</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-all duration-300 group border border-gray-700">
              <Truck className="w-6 h-6 text-orange-400 mb-2 sm:mb-0 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-gray-300 text-center font-medium">Fast Delivery</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-all duration-300 group border border-gray-700">
              <ShoppingBag className="w-6 h-6 text-purple-400 mb-2 sm:mb-0 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-gray-300 text-center font-medium">Quality Products</span>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-gray-700 text-center md:text-left">
            <p className="text-sm text-gray-400 flex items-center justify-center md:justify-start">
              © 2025 MANAfoods. Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current animate-pulse" /> for amazing shopping.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4 sm:space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>);

};

export default Footer;

