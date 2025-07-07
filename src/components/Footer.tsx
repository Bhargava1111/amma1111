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
  Truck } from
'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">MANAfoods</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted partner for online shopping. We offer high-quality products 
              with fast delivery and excellent customer service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-gray-300">support@manafoods.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                <span className="text-gray-300">
                  123 Commerce Street<br />
                  Business District, NY 10001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-center py-2">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2" />
              <span className="text-xs sm:text-sm text-gray-300">Secure Payment</span>
            </div>
            <div className="flex items-center justify-center py-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2" />
              <span className="text-xs sm:text-sm text-gray-300">Privacy Protected</span>
            </div>
            <div className="flex items-center justify-center py-2">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mr-2" />
              <span className="text-xs sm:text-sm text-gray-300">Fast Delivery</span>
            </div>
            <div className="flex items-center justify-center py-2">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mr-2" />
              <span className="text-xs sm:text-sm text-gray-300">Quality Products</span>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-gray-800 text-center md:text-left">
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 MANAfoods. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4 sm:space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;

