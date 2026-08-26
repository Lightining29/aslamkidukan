import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomeLayout } from './pages/shop/Home';
import ShopCatalogPage from './pages/shop/ShopCatalogPage';
import Cart from './pages/shop/Cart';
import ProductDetail from './pages/shop/ProductDetail';
import CategoryProducts from './pages/shop/CategoryProducts';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import Checkout from './pages/shop/Checkout';
import CheckoutSuccess from './pages/shop/CheckoutSuccess';
import RazorpayCheckoutTest from './pages/shop/RazorpayCheckoutTest';
import AccountLayout from './pages/account/AccountLayout';
import OrderHistory from './pages/account/OrderHistory';
import CustomerDashboard from './pages/account/CustomerDashboard';
import WishlistPage from './pages/account/WishlistPage';
import AccountSettings from './pages/account/AccountSettings';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminContacts from './pages/admin/AdminContacts';
import AdminStock from './pages/admin/AdminStock';
import AdminReviews from './pages/admin/AdminReviews';
import AdminOfflineSale from './pages/admin/AdminOfflineSale';
import AdminFlashSale from './pages/admin/AdminFlashSale';
import AdminPromoBanners from './pages/admin/AdminPromoBanners';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAiGenerator from './pages/admin/AdminAiGenerator';
import AdminImageEnhancer from './pages/admin/AdminImageEnhancer';
import AdminEmailGenerator from './pages/admin/AdminEmailGenerator';
import AdminMarketingHub from './pages/admin/AdminMarketingHub';
import AiSupportChatbot from './components/common/AiSupportChatbot';
import { FlashSaleCountdownBanner, PromotionalExitPopup } from './components/common/MarketingPopups';
import Contact from './pages/Contact';
import BlogList from './pages/blog/BlogList';
import BlogDetail from './pages/blog/BlogDetail';
import LocalSEO from './pages/shop/LocalSEO';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginModal from './components/LoginModal';
import MobileBottomNav from './components/layout/MobileBottomNav';
import { useAuth } from './context/AuthContext';
import './pages/shop/Home.css';

function RevealShell({ children }) {
  return <div>{children}</div>;
}

function App() {
  const location = useLocation();
  const { showLoginModal, setShowLoginModal } = useAuth();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '50px' });

    // Small delay to let the DOM settle after route change
    const timer = setTimeout(() => {
      const nodes = document.querySelectorAll('.reveal, .animate-in, .scroll-reveal');
      nodes.forEach((node) => {
        // Immediately reveal elements already in viewport (fixes mobile)
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          node.classList.add('visible');
        } else {
          io.observe(node);
        }
      });
    }, 100);

    return () => { clearTimeout(timer); io.disconnect(); };
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<RevealShell><HomeLayout /></RevealShell>} />
        <Route
          path="/cart"
          element={
            <>
              <Navbar />
              <RevealShell><Cart /></RevealShell>
              <Footer />
            </>
          }
        />
        <Route
          path="/shop"
          element={<RevealShell><ShopCatalogPage /></RevealShell>}
        />
        <Route
          path="/products"
          element={<RevealShell><ShopCatalogPage /></RevealShell>}
        />
        <Route
          path="/categories"
          element={<RevealShell><ShopCatalogPage /></RevealShell>}
        />
        <Route
          path="/product/:slug"
          element={<RevealShell><ProductDetail /></RevealShell>}
        />
        <Route
          path="/products/:slug"
          element={<RevealShell><ProductDetail /></RevealShell>}
        />
        <Route
          path="/category/:categorySlug"
          element={<RevealShell><CategoryProducts /></RevealShell>}
        />
        <Route
          path="/blogs"
          element={<RevealShell><BlogList /></RevealShell>}
        />
        <Route
          path="/blog/:slug"
          element={<RevealShell><BlogDetail /></RevealShell>}
        />
        <Route
          path="/locations/:city"
          element={<RevealShell><LocalSEO /></RevealShell>}
        />
        <Route
          path="/contact"
          element={<RevealShell><Contact /></RevealShell>}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <RevealShell><Checkout /></RevealShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <ProtectedRoute>
              <RevealShell><CheckoutSuccess /></RevealShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/razorpay-checkout"
          element={<RevealShell><RazorpayCheckoutTest /></RevealShell>}
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <RevealShell><AccountLayout /></RevealShell>
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerDashboard />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <RevealShell><AdminLayout /></RevealShell>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/new" element={<AdminCategories />} />
          <Route path="categories/:id/edit" element={<AdminCategories />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="offline-sale" element={<AdminOfflineSale />} />
          <Route path="flash-sale" element={<AdminFlashSale />} />
          <Route path="promo-banners" element={<AdminPromoBanners />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="ai-generator" element={<AdminAiGenerator />} />
          <Route path="image-enhancer" element={<AdminImageEnhancer />} />
          <Route path="email-generator" element={<AdminEmailGenerator />} />
          <Route path="marketing" element={<AdminMarketingHub />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showLoginModal && (
        <LoginModal
          initialMode={typeof showLoginModal === 'string' ? showLoginModal : 'login'}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      {!location.pathname.startsWith('/admin') && <MobileBottomNav />}
      <AiSupportChatbot />
      <PromotionalExitPopup />
    </>
  );
}

export default App;
