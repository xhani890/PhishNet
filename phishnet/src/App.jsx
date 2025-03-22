import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/dashboard/Sidebar";
import Header from "./components/dashboard/Header";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/dashboard/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { jwtDecode } from "jwt-decode";
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

  // Protected layout component
  const ProtectedLayout = () => (
    <div className={`flex h-screen transition-all duration-300 ${theme}`}>
      <Sidebar isCollapsed={isCollapsed} theme={theme} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"} mt-16`}>
        <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} theme={theme} setTheme={setTheme} />
        <main className="p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
        <Footer />
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
            {/* Add other dashboard routes here */}
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