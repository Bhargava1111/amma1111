import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  Heart } from
'lucide-react';
import NotificationCenter from './NotificationCenter';
import { useLogo } from '../hooks/use-logo';

const Navigation: React.FC = () => {
  const { user, logout, isAdmin, userProfile } = useAuth();
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logoSettings } = useLogo();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    return user?.Name || user?.Email || 'User';
  };

  const getAuthMethod = () => {
    if (userProfile?.auth_method === 'phone') {
      return `📱 ${userProfile.phone_number}`;
    }
    return `📧 ${user?.Email}`;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-lg border-b border-blue-200 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className={`flex items-center space-x-2 ${logoSettings?.logo_position === 'center' ? 'justify-center' : ''}`}>
            {logoSettings?.logo_url ? (
              <img 
                src={logoSettings.logo_url} 
                alt="Logo" 
                className={`object-contain ${
                  logoSettings?.logo_size === 'small' ? 'h-8 w-8' : 
                  logoSettings?.logo_size === 'medium' ? 'h-10 w-10' : 
                  'h-12 w-12'
                }`}
                onError={(e) => {
                  // Fallback to default logo if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${
                logoSettings?.logo_size === 'small' ? 'h-8 w-8' : 
                logoSettings?.logo_size === 'medium' ? 'h-10 w-10' : 
                'h-12 w-12'
              }`}>
                <span className={`text-white font-bold ${
                  logoSettings?.logo_size === 'small' ? 'text-sm' : 
                  logoSettings?.logo_size === 'medium' ? 'text-base' : 
                  'text-lg'
                }`}>
                  E
                </span>
              </div>
            )}
            
            {(!logoSettings || logoSettings.show_text) && (
              <span className={`font-bold text-gray-900 ${
                logoSettings?.logo_size === 'small' ? 'text-lg' : 
                logoSettings?.logo_size === 'medium' ? 'text-xl' : 
                'text-2xl'
              }`}>
                {logoSettings?.logo_text || 'MANAfoods'}
              </span>
            )}
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
            <div className="relative w-full group">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-transparent focus:border-blue-400 focus:bg-white transition-all duration-300 rounded-full shadow-sm hover:shadow-md" />

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 group-focus-within:text-purple-500 transition-colors duration-300" />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm relative group">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-purple-600 font-medium px-3 py-2 rounded-full transition-all duration-300 hover:bg-purple-50 hover:shadow-sm relative group">
              <span className="relative z-10">Products</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-green-600 font-medium px-3 py-2 rounded-full transition-all duration-300 hover:bg-green-50 hover:shadow-sm relative group">
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-orange-600 font-medium px-3 py-2 rounded-full transition-all duration-300 hover:bg-orange-50 hover:shadow-sm relative group">
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            
            {user &&
            <>
                <NotificationCenter />
                
                {/* Wishlist */}
                <Link to="/wishlist" className="relative group">
                  <Button variant="ghost" size="sm" className="relative hover:bg-pink-50 hover:text-pink-600 transition-all duration-300 rounded-full p-2">
                    <Heart className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
                    {wishlistItems.length > 0 &&
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white border-0 animate-pulse">

                        {wishlistItems.length}
                      </Badge>
                  }
                  </Button>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative group">
                  <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 rounded-full p-2">
                    <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
                    {totalItems > 0 &&
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 animate-bounce">

                        {totalItems}
                      </Badge>
                  }
                  </Button>
                </Link>
              </>
            }

            {/* User Menu */}
            {user ?
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-5 h-5 mr-1" />
                    {getUserDisplayName()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <span>Welcome, {getUserDisplayName()}!</span>
                      <span className="text-xs text-gray-500 font-normal">
                        {getAuthMethod()}
                      </span>
                    </div>
                    {isAdmin &&
                  <Badge variant="secondary" className="mt-1 text-xs">
                        Admin
                      </Badge>
                  }
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile & Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <Package className="w-4 h-4 mr-2" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="cursor-pointer">
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin &&
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                }
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> :

            <div className="flex space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            }
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-1">
            {user && <NotificationCenter />}
            <Link to="/wishlist" className="relative group">
              <Button variant="ghost" size="sm" className="relative hover:bg-pink-50 hover:text-pink-600 transition-all duration-300 rounded-full p-2">
                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                {wishlistItems.length > 0 &&
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white border-0 animate-pulse">

                    {wishlistItems.length}
                  </Badge>
                }
              </Button>
            </Link>
            <Link to="/cart" className="relative group">
              <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 rounded-full p-2">
                <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                {totalItems > 0 &&
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 animate-bounce">

                    {totalItems}
                  </Badge>
                }
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 rounded-full p-2">

              {isMobileMenuOpen ? 
                <X className="w-5 h-5 text-red-500 rotate-90 transition-transform duration-300" /> : 
                <Menu className="w-5 h-5 text-blue-600 transition-transform duration-300 hover:scale-110" />
              }
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen &&
        <div className={`md:hidden border-t bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-lg transition-all duration-500 ease-out transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="px-3 pt-3 pb-4 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative group">
                  <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 bg-white border-2 border-transparent focus:border-gradient-to-r focus:from-blue-400 focus:to-purple-400 transition-all duration-300 rounded-full shadow-sm hover:shadow-md" />

                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 group-focus-within:text-purple-500 transition-colors duration-300" />
                </div>
              </form>

              <Link
              to="/"
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group"
              onClick={() => setIsMobileMenuOpen(false)}>
                <span className="relative z-10 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:animate-ping"></span>
                  Home
                </span>
              </Link>
              <Link
              to="/products"
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group"
              onClick={() => setIsMobileMenuOpen(false)}>
                <span className="relative z-10 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:animate-ping"></span>
                  Products
                </span>
              </Link>
              
              <Link
              to="/blog"
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group"
              onClick={() => setIsMobileMenuOpen(false)}>
                <span className="relative z-10 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 group-hover:animate-ping"></span>
                  Blog
                </span>
              </Link>
              
              <Link
              to="/contact"
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group"
              onClick={() => setIsMobileMenuOpen(false)}>
                <span className="relative z-10 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:animate-ping"></span>
                  Contact
                </span>
              </Link>

              {user ?
            <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <Link
                to="/profile"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group"
                onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="relative z-10 flex items-center">
                        <User className="w-4 h-4 mr-3 group-hover:animate-bounce" />
                        Profile & Preferences
                      </span>
                    </Link>
                    <Link
                to="/orders"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group"
                onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="relative z-10 flex items-center">
                        <Package className="w-4 h-4 mr-3 group-hover:animate-bounce" />
                        Orders
                      </span>
                    </Link>
                    <Link
                to="/wishlist"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-pink-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group"
                onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="relative z-10 flex items-center">
                        <Heart className="w-4 h-4 mr-3 group-hover:animate-bounce" />
                        Wishlist
                      </span>
                    </Link>
                    {isAdmin &&
              <Link
                to="/admin"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group"
                onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="relative z-10 flex items-center">
                          <Settings className="w-4 h-4 mr-3 group-hover:animate-spin" />
                          Admin Panel
                        </span>
                      </Link>
              }
                    <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 transform hover:scale-105 relative group">
                      <span className="relative z-10 flex items-center">
                        <LogOut className="w-4 h-4 mr-3 group-hover:animate-pulse" />
                        Logout
                      </span>
                    </button>
                  </div>
                </> :

            <div className="flex flex-col space-y-2 px-4 py-3 border-t border-gray-200 pt-3 mt-3">
                  <Button variant="ghost" asChild className="justify-start hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 rounded-xl">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </div>
            }
            </div>
          </div>
        }
      </div>
    </nav>);

};

export default Navigation;

