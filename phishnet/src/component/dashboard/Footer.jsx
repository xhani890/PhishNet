import React from "react";

const Footer = () => {
  return (
    <div className="bg-gray-200 text-center p-2 text-sm">
      SafeTitan uses cookies. <button className="text-blue-500">Learn More</button>
      <button className="ml-4 bg-blue-500 text-white px-2 py-1">Approve</button>
      <button className="ml-2 bg-red-500 text-white px-2 py-1">Reject</button>
    </div>
  );
};

export default Footer;
