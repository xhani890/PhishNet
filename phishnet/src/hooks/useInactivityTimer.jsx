import { useEffect } from 'react';

const useInactivityTimer = ({ onLogout, logoutTime, isAuthenticated }) => {
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onLogout, logoutTime);
    };

    const events = ['mousemove', 'keydown', 'scroll'];

    if (isAuthenticated) {
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();
    }

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [onLogout, logoutTime, isAuthenticated]);
};

export { useInactivityTimer };