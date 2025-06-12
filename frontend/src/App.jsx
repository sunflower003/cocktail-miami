import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext'; // THÊM IMPORT NÀY
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// User pages
import Home from './pages/user/Home.jsx';
import Login from './pages/user/Login.jsx';
import Register from './pages/user/Register.jsx';
import VerifyEmail from './pages/user/VerifyEmail.jsx';
import AccountSettings from './pages/user/AccountSettings.jsx';
import ProductDetail from './pages/user/ProductDetail.jsx';
import AllProducts from './pages/user/AllProducts.jsx';
import Wishlist from './pages/user/Wishlist';
import Cart from './pages/user/Cart'; // THÊM IMPORT NÀY

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import CreateProduct from './pages/admin/CreateProduct.jsx';
import EditProduct from './pages/admin/EditProduct.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import UserDetail from './pages/admin/UserDetail.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider> {/* THÊM CARTPROVIDER */}
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify-email" element={<VerifyEmail />} />
              <Route path="account-settings" element={<AccountSettings />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products" element={<AllProducts />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="cart" element={<Cart />} /> {/* THÊM ROUTE CHO CART */}
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="products/create" element={<CreateProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id" element={<UserDetail />} />
            </Route>
          </Routes>
        </CartProvider> {/* ĐÓNG CARTPROVIDER */}
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
