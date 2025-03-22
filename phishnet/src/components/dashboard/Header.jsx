import React, { useState, useEffect, useRef } from "react";
import { Menu, Sun, Moon, User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ isCollapsed, setIsCollapsed, theme, setTheme }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // ✅ Handle Click Outside Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className={`p-4 flex justify-between items-center shadow-md transition-all duration-300 
      ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-black border-b"}`}>
      
      {/* 🔹 Left Section: Sidebar Toggle + Logo + Text */}
      <div className="flex items-center space-x-3">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-orange-500 hover:text-orange-600">
          <Menu size={24} />
        </button>
        <img src="/logo.jpg" alt="PhishNet Logo" className="w-12 h-12" />
        <span className="text-lg font-semibold">PhishNet</span>
      </div>
    
      {/* 🔹 Right Section: Theme Toggle & User Profile */}
      <div className="flex items-center space-x-4">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-orange-500 hover:text-orange-600">
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        
        {/* 🔹 User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-3">
            <User size={24} className="text-orange-500" />
            <span className="hidden sm:inline-block text-sm">{localStorage.getItem("userEmail") || "admin@example.com"}</span>
          </button>
    
          {/* 🔹 Dropdown Menu */}
          {showDropdown && (
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg transition-all duration-300
              ${theme === "dark" ? "bg-[#1A1A1A] border border-gray-700 text-white" : "bg-white border border-gray-300 text-black"}`}>
              <ul>
                <li className="p-3 hover:bg-gray-800 cursor-pointer flex items-center">
                  <Settings size={16} className="mr-2" /> Settings
                </li>
                <li onClick={handleLogout} className="p-3 hover:bg-gray-800 cursor-pointer flex items-center">
                  <LogOut size={16} className="mr-2" /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>    
  );
};

export default Header;
