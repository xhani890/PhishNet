import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Menu, Sun, Moon, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const HeaderComponent = ({ isCollapsed, setIsCollapsed, theme, setTheme }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const getEmailFromToken = () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return "admin@example.com";
      const decoded = jwtDecode(token);
      return decoded.email || decoded.username || "admin@example.com";
    } catch (error) {
      return "admin@example.com";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className={`h-16 flex items-center justify-between fixed top-0 right-0 left-0 z-50 
      ${theme === "dark" ? "bg-[#1A1A1A]" : "bg-white border-b"}`}>

      {/* Left Section */}
      <div className="flex items-center space-x-3">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-orange-500 hover:text-orange-600 ml-2">
          <Menu size={24} />
        </button>
        <img 
          src="/logo.jpg" 
          alt="PhishNet Logo" 
          className={`transition-all duration-0 ${isCollapsed ? 'w-6 h-6' : 'w-8 h-8'}`}
        />
        <span className={`text-text-black transition-all duration-0 ${
          isCollapsed ? 'text-sm opacity-50' : 'text-lg opacity-100'
        } font-semibold truncate`}>
          PhishNet
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 pr-4">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-orange-500 hover:text-orange-600">
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User size={20} className="text-orange-500" />
              <span className="text-sm">{getEmailFromToken()}</span>
            </div>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-orange-500 hover:text-orange-600 focus:outline-none"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {showDropdown && (
  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg transition-all duration-300
    ${theme === "dark" ? "bg-[#1A1A1A] border border-gray-700 text-white" : "bg-white border border-gray-300 text-black"}`}>
    <ul>
  <li className={`p-3 cursor-pointer flex items-center space-x-2 ${
    theme === "dark" 
      ? "hover:bg-gray-800"  // Match sidebar's dark hover
      : "hover:bg-gray-200"  // Match sidebar's light hover
  }`}>
    <Settings size={16} className="text-orange-500" />
    <span>Settings</span>
  </li>
  <li onClick={handleLogout} className={`p-3 cursor-pointer flex items-center space-x-2 ${
    theme === "dark" 
      ? "hover:bg-gray-800"  // Exact match
      : "hover:bg-gray-200"  // Exact match
  }`}>
    <LogOut size={16} className="text-orange-500" />
    <span>Logout</span>
  </li>
</ul>
  </div>
)}
        </div>
      </div>
    </header>
  );
};

HeaderComponent.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  setIsCollapsed: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  setTheme: PropTypes.func.isRequired,
};

export default HeaderComponent;