import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./component/dashboard/Sidebar";
import Header from "./component/dashboard/Header";
import Dashboard from "./pages/Dashboard";
import Footer from "./component/dashboard/Footer";
import Login from "./pages/Login"; 
import Register from "./pages/Register"; // Import Register page
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login status

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes - Redirect if not authenticated */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex flex-col flex-1">
                  <Header />
                  <main className="p-6 flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
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
  );
}

export default App;
