import React from 'react';
import PropTypes from 'prop-types';
import { Info } from 'lucide-react';

const DashboardMeg = ({ theme }) => {
  return (
    <div className={`flex items-center gap-3 p-4 mb-6 rounded-lg ${
      theme === 'dark' 
        ? 'bg-[#1A1A1A] border border-gray-700' 
        : 'bg-white border border-gray-200'
    }`}>
      <Info className="text-orange-500 w-5 h-5 flex-shrink-0" />
      <div>
        <h1 className="text-lg font-semibold">Administration Dashboard</h1>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Welcome to your Administration Dashboard. Below is a snapshot of your organization&apos;s resources.
        </p>
      </div>
    </div>
  );
};

DashboardMeg.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default DashboardMeg;