import React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';

const CookieFooter = ({ theme, isAuthenticated }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookiePreference = localStorage.getItem('cookiePreference');
    if (isAuthenticated && !cookiePreference) {
      setShowBanner(true);
    }
  }, [isAuthenticated]);

  const handleAccept = () => {
    Cookies.set('necessary', 'true', { expires: 365 });
    Cookies.set('preferences', 'true', { expires: 365 });
    Cookies.set('analytics', 'true', { expires: 365 });
    localStorage.setItem('cookiePreference', 'approved');
    setShowBanner(false);
  };

  const handleReject = () => {
    Cookies.remove('preferences');
    Cookies.remove('analytics');
    localStorage.setItem('cookiePreference', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner || !isAuthenticated) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-300 ${
      theme === 'dark' 
        ? 'bg-[#1A1A1A] border-t border-gray-700' 
        : 'bg-white border-t border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-2 md:mb-0 md:mr-4 text-center md:text-left">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            PhishNet uses cookies. By continuing you agree to PhishNets&apos;s use of cookies. 
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReject}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

CookieFooter.propTypes = {
  theme: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default CookieFooter;