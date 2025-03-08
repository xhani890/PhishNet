import React from "react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-md h-full p-4">
      <h2 className="text-xl font-bold">PhishNet</h2>
      <ul>
        <li className="p-2 hover:bg-gray-200">Dashboard</li>
        <li className="p-2 hover:bg-gray-200">Phishing Manager</li>
        <li className="p-2 hover:bg-gray-200">Training Manager</li>
        <li className="p-2 hover:bg-gray-200">Quiz Manager</li>
        <li className="p-2 hover:bg-gray-200">User Manager</li>
      </ul>
    </div>
  );
};

export default Sidebar;
