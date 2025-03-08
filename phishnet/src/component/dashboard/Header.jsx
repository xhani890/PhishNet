import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const Header = () => {
  const [userEmail] = useState("user@example.com");

  return (
    <div className="flex items-center justify-between bg-gray-800 p-4 shadow-md">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Placeholder for SafeTitan Icon */}
        <div className="bg-white rounded p-2">
          <span className="text-black font-bold">ST</span>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1 border p-1 rounded">
          <ChevronLeft className="text-white cursor-pointer" size={18} />
          <ChevronRight className="text-white cursor-pointer" size={18} />
        </div>

        {/* SafeTitan Text */}
        <span className="text-white font-semibold text-lg">SafeTitan</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* User Info with Dropdown */}
        <div className="flex items-center text-white cursor-pointer">
          <span>{userEmail}</span>
          <ChevronDown size={18} className="ml-1" />
        </div>

        {/* Help Button with Dropdown */}
        <button className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Help
          <ChevronDown size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Header;




  // const [userEmail] = useState("user@example.com");

  // return (
  //   <div className="flex items-center justify-between bg-gray-800 p-4 shadow-md">
  //     {/* Left Section */}
  //     <div className="flex items-center gap-3">
  //       {/* Placeholder for SafeTitan Icon */}
  //       <div className="bg-white rounded p-2">
  //         <span className="text-black font-bold">ST</span>
  //       </div>

  //       {/* Navigation Arrows */}
  //       <div className="flex items-center gap-1 border p-1 rounded">
  //         <ChevronLeft className="text-white cursor-pointer" size={18} />
  //         <ChevronRight className="text-white cursor-pointer" size={18} />
  //       </div>

  //       {/* SafeTitan Text */}
  //       <span className="text-white font-semibold text-lg">SafeTitan</span>
  //     </div>

  //     {/* Right Section */}
  //     <div className="flex items-center gap-6">
  //       {/* User Info with Dropdown */}
  //       <div className="flex items-center text-white cursor-pointer">
  //         <span>{userEmail}</span>
  //         <ChevronDown size={18} className="ml-1" />
  //       </div>

  //       {/* Help Button with Dropdown */}
  //       <button className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
  //         Help
  //         <ChevronDown size={18} className="ml-1" />
  //       </button>
  //     </div>
  //   </div>
  // );