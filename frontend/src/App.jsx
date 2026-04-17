import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ServiceAccountSetup from './pages/ServiceAccountSetup';
import AppManagement from './pages/AppManagement';
import Testing from './pages/Testing';
import QuickStart from './pages/QuickStart';
import AdminPanel from './pages/AdminPanel';
import SupportWidget from './components/SupportWidget';
import ExitIntentPopup from './components/ExitIntentPopup';
import { authAPI } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
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
        const adminFlag = res.data.is_admin || false;
        setIsAdmin(adminFlag);
        localStorage.setItem('isAdmin', String(adminFlag));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    }
    setLoading(false);
  };

  const handleLogin = (adminFlag) => {
    setIsAuthenticated(true);
    setIsAdmin(adminFlag || false);
    localStorage.setItem('isAdmin', String(adminFlag || false));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
        <Route path="/register" element={!isAuthenticated ? <Register onRegister={() => handleLogin(false)} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard isAdmin={isAdmin} /> : <Navigate to="/login" />} />
        <Route path="/quick-start" element={<QuickStart isAuthenticated={isAuthenticated} />} />
        <Route path="/setup" element={isAuthenticated ? <ServiceAccountSetup /> : <Navigate to="/login" />} />
        <Route path="/apps/:serviceAccountId" element={isAuthenticated ? <AppManagement /> : <Navigate to="/login" />} />
        <Route path="/testing/:serviceAccountId" element={isAuthenticated ? <Testing /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminPanel /> : isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Home />} />
      </Routes>
      {isAuthenticated && <SupportWidget />}
      <ExitIntentPopup />
    </Router>
  );
}

export default App;
