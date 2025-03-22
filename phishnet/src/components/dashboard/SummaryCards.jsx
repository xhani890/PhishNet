import React from "react";
import { Users, UserCheck, Shield } from "lucide-react";

const SummaryCards = ({ theme }) => {
  const summaryData = [
    { title: "Total Users", count: 1200, icon: <Users size={32} />, colorDark: "bg-blue-700", colorLight: "bg-blue-400" },
    { title: "Total User Groups", count: 150, icon: <UserCheck size={32} />, colorDark: "bg-green-700", colorLight: "bg-green-400" },
    { title: "Total Phishing Campaigns", count: 75, icon: <Shield size={32} />, colorDark: "bg-orange-700", colorLight: "bg-orange-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {summaryData.map((item, index) => (
        <div
          key={index}
          className={`flex items-center p-5 rounded-lg shadow-md transition-all duration-300 border 
            ${theme === "dark" ? "bg-[#1A1A1A] text-white border-gray-700" : "bg-white text-black border-gray-300"}`}
        >
          <div className={`p-3 rounded-full text-white ${theme === "dark" ? item.colorDark : item.colorLight}`}>
            {item.icon}
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-semibold">{item.title}</h4>
            <p className="text-2xl font-bold">{item.count}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
