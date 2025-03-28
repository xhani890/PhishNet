import React from "react";
import { Users, UserCheck, ShieldCheck, GraduationCap } from "lucide-react";

const SummaryCards = ({ theme }) => {
  const stats = [
    { label: "Users", count: 117, icon: Users, color: "bg-teal-500" },
    { label: "User Groups", count: 134, icon: UserCheck, color: "bg-gray-700" },
    { label: "Phishing Campaigns", count: 1772, icon: ShieldCheck, color: "bg-gray-400" },
    { label: "Training & Quiz Campaigns", count: 2483, icon: GraduationCap, color: "bg-blue-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-6 flex flex-col justify-between items-start rounded-lg shadow-lg transition-all duration-300
            ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-black border border-gray-300"}`}
        >
          <div className={`p-3 rounded-full ${stat.color} text-white`}>
            <stat.icon size={32} />
          </div>
          <h3 className="text-lg font-semibold mt-2">{stat.label}</h3>
          <p className="text-2xl font-bold">{stat.count}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
