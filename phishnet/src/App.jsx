import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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
import { SidebarProvider } from "./context/SidebarContext"; // ✅ Ensure correct import

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("authToken"));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Sync theme with LocalStorage
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <SidebarProvider> {/* ✅ Wrap with SidebarProvider */}
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <div className={`flex h-screen transition-all duration-300 ${theme}`}>
                  {/* ✅ Sidebar Syncs Theme & Collapse State */}
                  <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} theme={theme} />

                  <div className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
                    {/* ✅ Header Syncs Theme */}
                    <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} theme={theme} setTheme={setTheme} />

                    <main className="p-6 flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Dashboard theme={theme} isCollapsed={isCollapsed} />} /> {/* ✅ Fix Navigation */}
                      </Routes>
                    </main>

                    <Footer />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </SidebarProvider> // ✅ Wrap everything inside SidebarProvider
  );
}

export default App;
