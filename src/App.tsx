import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";

// Components
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import WishlistPage from "./pages/WishlistPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OnAuthSuccessPage from "./pages/OnAuthSuccessPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true
          }}
        >
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Navigation />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/orders" element={<OrderTrackingPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
                  <Route path="/resetpassword" element={<ResetPasswordPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
