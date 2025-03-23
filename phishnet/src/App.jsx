import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
import CookiePolicy from './pages/CookiePolicy';
import Sidebar from "./components/dashboard/Sidebar";
import Header from "./components/dashboard/Header";
import Dashboard from "./pages/Dashboard";
import CookieFooter from './components/dashboard/CookieFooter';
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
import "./index.css";
import { SidebarProvider } from "./context/SidebarContext";
import { useInactivityTimer } from './hooks/useInactivityTimer';
import LogoutModal from './components/dashboard/LogoutModal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("authToken"));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setShowLogoutModal(false);
  };

  // Inactivity timer (15 minutes)
  useInactivityTimer({
    onLogout: handleLogout,
    logoutTime: 15 * 60 * 1000,
    isAuthenticated
  });

  // Sync theme
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Cookie handling
  useEffect(() => {
    const checkCookies = () => {
      const preference = localStorage.getItem('cookiePreference');
      
      if (preference === 'approved') {
        Cookies.set('necessary', 'true', { expires: 365 });
        Cookies.set('preferences', 'true', { expires: 365 });
        Cookies.set('analytics', 'true', { expires: 365 });
        initializeAnalytics();
      } else if (preference === 'rejected') {
        Cookies.remove('preferences');
        Cookies.remove('analytics');
      }
    };

    checkCookies();
  }, []);

  // Analytics initialization
  const initializeAnalytics = () => {
    if (typeof window !== 'undefined' && Cookies.get('analytics') === 'true') {
      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'YOUR_GA_TRACKING_ID');
    }
  };

  // Protected layout component
  const ProtectedLayout = () => (
    <div className={`flex h-screen transition-all duration-300 ${theme}`}>
      <Sidebar isCollapsed={isCollapsed} theme={theme} />
      <div className="flex flex-col flex-1">
        <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} theme={theme} setTheme={setTheme} />
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        } mt-16`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
        <CookieFooter theme={theme} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            isAuthenticated ? (
              <>
                <ProtectedLayout />
                <LogoutModal isOpen={showLogoutModal} onClose={() => <Navigate to="/login" replace />} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }>
            <Route index element={<Dashboard theme={theme} />} />
            <Route path="campaigns" element={<h1>Campaigns Page</h1>} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </SidebarProvider>
  );
}

export default App;