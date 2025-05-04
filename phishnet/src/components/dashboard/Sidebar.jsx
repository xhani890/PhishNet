import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Briefcase, 
  Shield, 
  ChevronDown,
  Mail,
  MessageCircle 
} from "lucide-react";

const Sidebar = ({ isCollapsed, theme }) => {
  const [isCampaignsOpen, setIsCampaignsOpen] = useState(false);

  return (
    <div className={`fixed left-0 top-0 h-screen transition-all duration-300 
      ${isCollapsed ? "w-16" : "w-64"} 
      ${theme === "dark" ? "bg-[#1A1A1A]" : "bg-white border-r"}`}>

      {/* Logo Section */}
      {!isCollapsed && (
        <div className="flex items-center p-4 border-b border-gray-700">
          <img 
            src="/logo.png" 
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
        
        {/* Phishing Campaigns Submenu */}
        <div className={`${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}>
          <div
            className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-300 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
            onClick={() => setIsCampaignsOpen(!isCampaignsOpen)}
          >
            <Shield size={20} className={`min-w-5 ${theme === "dark" ? "text-white" : "text-black"}`} />
            {!isCollapsed && (
              <>
                <span className="ml-5">Phishing Campaigns</span>
                <ChevronDown
                  size={16}
                  className={`ml-auto transition-transform duration-300 ${
                    isCampaignsOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isCampaignsOpen ? "max-h-40" : "max-h-0"
            }`}
          >
            <NavItem
              to="/dashboard/campaigns/templates"
              icon={Mail}
              label="Phishing Email Templates"
              isCollapsed={isCollapsed}
              theme={theme}
              isSubItem
            />
            <NavItem
              to="/dashboard/campaigns/feedback"
              icon={MessageCircle}
              label="User Feedback Messages"
              isCollapsed={isCollapsed}
              theme={theme}
              isSubItem
            />
          </div>
        </div>

        <NavItem to="/dashboard/reports" icon={FileText} label="Reports" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/dashboard/users" icon={Users} label="User Management" isCollapsed={isCollapsed} theme={theme} />
        <NavItem to="/dashboard/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} theme={theme} />
        <NavItem
          to="/dashboard/organizations"
          icon={Briefcase}
          label="Organizational Manager"
          isCollapsed={isCollapsed}
          theme={theme}
        />
      </nav>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ to, icon: Icon, label, isCollapsed, theme, end = false, isSubItem = false }) => (
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
      } ${isSubItem ? "pl-12" : ""}`
    }
  >
    {Icon && (
      <Icon 
        size={20} 
        className={`min-w-5 ${theme === "dark" ? "text-white" : "text-black"} ${isSubItem ? "ml-1" : ""}`}
      />
    )}
    {!isCollapsed && (
      <span className="ml-5 sidebar-text" style={{ fontFamily: 'inherit' }}>
        {label}
      </span>
    )}
  </NavLink>
);

export default Sidebar;