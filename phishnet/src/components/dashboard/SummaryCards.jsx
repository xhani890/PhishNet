import React from "react";
import { Users, UserCheck, Shield } from "lucide-react";

const SummaryCards = ({ theme }) => {
  const summaryData = [
    { 
      title: "Users", 
      count: 1200, 
      icon: <Users className="w-6 h-6" />,
      color: "bg-orange-500"
    },
    { 
      title: "User Groups", 
      count: 150, 
      icon: <UserCheck className="w-6 h-6" />,
      color: "bg-blue-500"
    },
    { 
      title: "Phishing Campaigns", 
      count: 75, 
      icon: <Shield className="w-6 h-6" />,
      color: "bg-green-500"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {summaryData.map((item, index) => (
        <div
          key={index}
          className={`flex items-center p-4 rounded-lg shadow-sm ${
            theme === "dark" 
              ? "bg-[#1A1A1A] border border-gray-700" 
              : "bg-white border border-gray-200"
          }`}
        >
          <div className={`p-3 rounded-lg ${item.color} mr-4`}>
            {item.icon}
          </div>
          <div className="flex flex-col justify-center flex-1 text-right">
            <span className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              {item.title}
            </span>
            <span className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-black"
            }`}>
              {item.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;