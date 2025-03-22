import React from "react";
import SummaryCards from "../components/Dashboard/SummaryCards";
import { useSidebar } from "../context/SidebarContext";

const Dashboard = ({ theme }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"} p-6 
      ${theme === "dark" ? "bg-[#131313] text-white" : "bg-white text-black"}`}>
      
      {/* Section Title */}
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* Summary Cards */}
      <SummaryCards theme={theme} />
    </div>
  );
};

export default Dashboard;
