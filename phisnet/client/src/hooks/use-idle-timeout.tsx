import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';

export function useIdleTimeout(timeout = 30 * 60 * 1000) { // 30 minutes
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const { logoutMutation } = useAuth();

  useEffect(() => {
    const updateLastActivity = () => {
      setLastActivity(Date.now());
      setIsIdle(false);
    };

    // Events to track user activity
    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Check idle status periodically
    const idleInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > timeout) {
        setIsIdle(true);
        // Auto logout when idle
        if (!isIdle) {
          logoutMutation.mutate();
        }
      }
    }, 60000); // Check every minute

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity);
      });
      clearInterval(idleInterval);
    };
  }, [lastActivity, timeout, isIdle, logoutMutation]);

  return { isIdle };
}