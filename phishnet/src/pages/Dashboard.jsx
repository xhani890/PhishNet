import React from "react";
import PropTypes from "prop-types";
import DashboardMeg from "../components/dashboard/DashboardMeg";
import SummaryCards from "../components/Dashboard/SummaryCards";
import DashboardChart from "../components/dashboard/DashboardChart";
import { useSidebar } from "../context/SidebarContext";

const Dashboard = ({ theme }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div 
      className={`min-h-screen ${
        theme === "dark" ? "bg-[#131313] text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex flex-col gap-6">
        <DashboardMeg theme={theme} />
        <SummaryCards theme={theme} />
        <DashboardChart theme={theme} />
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default Dashboard;