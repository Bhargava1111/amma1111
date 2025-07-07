import React, { useState } from 'react';
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

const Navigation: React.FC = () => {
  const { user, logout, isAdmin, userProfile } = useAuth();
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MANAfoods</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4" />

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-gray-900 font-medium">
              Products
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-gray-900 font-medium">
              Blog
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-gray-900 font-medium">
              Contact
            </Link>
            
            {user &&
            <>
                <NotificationCenter />
                
                {/* Wishlist */}
                <Link to="/wishlist" className="relative">
                  <Button variant="ghost" size="sm" className="relative">
                    <Heart className="w-5 h-5" />
                    {wishlistItems.length > 0 &&
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">

                        {wishlistItems.length}
                      </Badge>
                  }
                  </Button>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 &&
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">

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
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationCenter />}
            <Link to="/wishlist" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 &&
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">

                    {wishlistItems.length}
                  </Badge>
                }
              </Button>
            </Link>
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 &&
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">

                    {totalItems}
                  </Badge>
                }
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>

              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen &&
        <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4" />

                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </form>

              <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link
              to="/products"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}>

                Products
              </Link>
              
              <Link
              to="/blog"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}>

                Blog
              </Link>
              
              <Link
              to="/contact"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}>

                Contact
              </Link>

              {user ?
            <>
                  <Link
                to="/profile"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}>

                    Profile & Preferences
                  </Link>
                  <Link
                to="/orders"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}>

                    Orders
                  </Link>
                  <Link
                to="/wishlist"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}>

                    Wishlist
                  </Link>
                  {isAdmin &&
              <Link
                to="/admin"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}>

                      Admin Panel
                    </Link>
              }
                  <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">

                    Logout
                  </button>
                </> :

            <div className="flex space-x-2 px-3 py-2">
                  <Button variant="ghost" size="sm" asChild className="flex-1">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
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

