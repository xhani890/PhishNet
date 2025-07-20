// Create: phisnet/client/src/hooks/use-session-timeout.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before timeout

export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const { logoutMutation } = useAuth();
  const { toast } = useToast();

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setTimeLeft(120);
  }, []);

  const extendSession = useCallback(() => {
    resetTimer();
    toast({
      title: "Session Extended",
      description: "Your session has been extended for another 10 minutes.",
    });
  }, [resetTimer, toast]);

  const forceLogout = useCallback(() => {
    setShowWarning(false);
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
    logoutMutation.mutate();
  }, [logoutMutation, toast]);

  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    
    const startTimers = () => {
      // Clear existing timers
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownTimer);
      
      // Set warning timer (8 minutes)
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(120);
        
        // Start countdown
        countdownTimer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownTimer);
              forceLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, SESSION_TIMEOUT - WARNING_TIME);
      
      // Set auto-logout timer (10 minutes)
      logoutTimer = setTimeout(() => {
        forceLogout();
      }, SESSION_TIMEOUT);
    };
    
    const handleActivity = () => {
      startTimers();
    };
    
    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    // Start initial timers
    startTimers();
    
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [forceLogout]);

  return {
    showWarning,
    timeLeft,
    extendSession,
    forceLogout,
  };
}