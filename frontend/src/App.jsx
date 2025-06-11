import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// User pages
import Home from './pages/user/Home.jsx';
import Login from './pages/user/Login.jsx';
import Register from './pages/user/Register.jsx';
import VerifyEmail from './pages/user/VerifyEmail.jsx';
import AccountSettings from './pages/user/AccountSettings.jsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import CreateProduct from './pages/admin/CreateProduct.jsx';
import EditProduct from './pages/admin/EditProduct.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';
import ProductDetail from './pages/user/ProductDetail.jsx';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route path="products/:id" element={<ProductDetail />} />
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
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
