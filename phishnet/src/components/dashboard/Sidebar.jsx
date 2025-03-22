import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Settings, Briefcase, Shield } from "lucide-react";


const Sidebar = ({ isCollapsed, theme }) => {
  return (
    <div className={`fixed left-0 top-[64px] h-[calc(100vh-64px)] transition-all duration-300 
      ${isCollapsed ? "w-16" : "w-64"} 
      ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-black border-r border-gray-300"}`}>

      {/* Navigation Items */}
      <nav className="mt-4">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/campaigns" icon={Shield} label="Phishing Campaigns" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/reports" icon={FileText} label="Reports" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/users" icon={Users} label="User Management" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/organizations" icon={Briefcase} label="Organizational Manager" isCollapsed={isCollapsed} theme={theme} />
      </nav>
    </div>
  );
};

// 🔹 Sidebar Navigation Item Component
const NavItem = ({ to, icon: Icon, label, isCollapsed, theme }) => (
  <NavLink
    to={to}
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
    <Icon size={20} className="text-orange-500" />
    {!isCollapsed && <span className="ml-4">{label}</span>}
  </NavLink>
);

export default Sidebar;
