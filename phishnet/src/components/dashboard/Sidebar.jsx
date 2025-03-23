import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Settings, Briefcase, Shield } from "lucide-react";

const Sidebar = ({ isCollapsed, theme }) => {
  return (
    <div className={`fixed left-0 top-0 h-screen transition-all duration-300 
      ${isCollapsed ? "w-16" : "w-64"} 
      ${theme === "dark" ? "bg-[#1A1A1A]" : "bg-white border-r"}`}>

      {/* Logo Section */}
      {!isCollapsed && (
        <div className="flex items-center p-4 border-b border-gray-700">
          <img 
            src="/logo.jpg" 
            alt="PhishNet Logo" 
            className="w-8 h-8 mr-3 rounded-sm"
          />
          <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            PhishNet
          </span>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="mt-4">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} theme={theme} end />
        <NavItem to="/dashboard/campaigns" icon={Shield} label="Phishing Campaigns" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/dashboard/reports" icon={FileText} label="Reports" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/dashboard/users" icon={Users} label="User Management" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/dashboard/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/dashboard/organizations" icon={Briefcase} label="Organizational Manager" isCollapsed={isCollapsed} theme={theme} />
      </nav>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ to, icon: Icon, label, isCollapsed, theme, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 transition-all duration-300 ${
        isActive
          ? "bg-orange-600 text-white"
          : theme === "dark"
          ? "hover:bg-gray-800 text-white"
          : "hover:bg-gray-200 text-black"
      }`
    }
  >
    <Icon size={20} className={theme === "dark" ? "text-white" : "text-black"} />
    {!isCollapsed && (
      <span className="ml-4 sidebar-text" style={{ fontFamily: 'inherit' }}>
        {label}
      </span>
    )}
  </NavLink>
);

export default Sidebar;