import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/user/Home.jsx';
import Login from './pages/user/Login.jsx';
import Register from './pages/user/Register.jsx';
import VerifyEmail from './pages/user/VerifyEmail.jsx';
import AccountSettings from './pages/user/AccountSettings.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="account-settings" element={<AccountSettings />} />
          {/* Add more routes as needed */}
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
