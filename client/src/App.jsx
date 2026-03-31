import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';
import { ThemeProvider } from './context/ThemeContext';
import './i18n/index.js';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import { Login, Register } from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import AdminLayout, { AdminOverview } from './pages/admin/AdminLayout';
import ManageProducts from './pages/admin/ManageProducts';
import ManageCategories from './pages/admin/ManageCategories';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCoupons from './pages/admin/ManageCoupons';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageUsers from './pages/admin/ManageUsers';
import ManageContacts from './pages/admin/ManageContacts';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <div className="app-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Navbar />
            <main className="main-content">
              <ErrorBoundary>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminOverview />} />
                  <Route path="products" element={<ManageProducts />} />
                  <Route path="categories" element={<ManageCategories />} />
                <Route path="orders" element={<ManageOrders />} />
                <Route path="coupons" element={<ManageCoupons />} />
                <Route path="announcement" element={<ManageAnnouncements />} />
                <Route path="contacts" element={<ManageContacts />} />
                <Route path="users" element={<ManageUsers />} />
              </Route>
                <Route path="*" element={
                  <div className="text-center py-32">
                    <p className="text-8xl mb-4 font-display" style={{ color: 'var(--text-muted)' }}>404</p>
                    <h2 className="text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Page not found</h2>
                  </div>
                } />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              border: '1px solid var(--border)', borderRadius: '12px', fontSize: '14px',
            },
          }} />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
