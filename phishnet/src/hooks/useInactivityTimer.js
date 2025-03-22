import { useEffect } from 'react';

export const useInactivityTimer = ({ onLogout, logoutTime, isAuthenticated }) => {
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const events = ['mousemove', 'keydown', 'click'];

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onLogout();
      }, logoutTime);
    };

    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, logoutTime, onLogout]);
};