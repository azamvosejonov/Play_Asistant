import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ServiceAccountSetup from './pages/ServiceAccountSetup';
import AppManagement from './pages/AppManagement';
import Testing from './pages/Testing';
import AdminPanel from './pages/AdminPanel';
import SupportWidget from './components/SupportWidget';
import { authAPI } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await authAPI.getMe();
        setIsAuthenticated(true);
        setIsAdmin(res.data.is_admin || false);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    }
    setLoading(false);
  };

  const handleLogin = (adminFlag) => {
    setIsAuthenticated(true);
    setIsAdmin(adminFlag || false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
        <Route path="/register" element={!isAuthenticated ? <Register onRegister={() => handleLogin(false)} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard isAdmin={isAdmin} /> : <Navigate to="/login" />} />
        <Route path="/setup" element={isAuthenticated ? <ServiceAccountSetup /> : <Navigate to="/login" />} />
        <Route path="/apps/:serviceAccountId" element={isAuthenticated ? <AppManagement /> : <Navigate to="/login" />} />
        <Route path="/testing/:serviceAccountId" element={isAuthenticated ? <Testing /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminPanel /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Home />} />
      </Routes>
      {isAuthenticated && <SupportWidget />}
    </Router>
  );
}

export default App;
