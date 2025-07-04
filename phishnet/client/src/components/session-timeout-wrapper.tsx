import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { 
  SESSION_EVENTS, 
  SESSION_TIMEOUT,
  trackActivity, 
  forceLogout 
} from "@/lib/session-manager";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

// Time before session expiration to show warning (1 minute before)
const WARNING_BEFORE_TIMEOUT = 60 * 1000;

export default function SessionTimeoutWrapper({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false);
  const { logoutMutation } = useAuth();
  
  // Get user's preferred timeout setting, default to global setting
  const userSessionTimeoutMinutes = parseInt(localStorage.getItem('sessionTimeoutMinutes') || '0');
  const effectiveTimeout = userSessionTimeoutMinutes > 0 ? 
    userSessionTimeoutMinutes * 60 * 1000 : SESSION_TIMEOUT;
  
  useEffect(() => {
    // Initialize session activity tracking
    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];
    
    // Function to update activity timestamp
    const handleUserActivity = () => {
      trackActivity();
    };
    
    // Add event listeners to track user activity
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Set up listeners for session events
    const handleWarning = () => setShowWarning(true);
    const handleExpired = () => logoutMutation.mutate();
    
    document.addEventListener(SESSION_EVENTS.TIMEOUT_WARNING, handleWarning);
    document.addEventListener(SESSION_EVENTS.SESSION_EXPIRED, handleExpired);
    
    // Start monitoring for session timeout
    const warningTimeout = setTimeout(() => {
      document.dispatchEvent(new Event(SESSION_EVENTS.TIMEOUT_WARNING));
    }, effectiveTimeout - WARNING_BEFORE_TIMEOUT);
    
    // Set the actual timeout
    const sessionTimeout = setTimeout(() => {
      document.dispatchEvent(new Event(SESSION_EVENTS.SESSION_EXPIRED));
    }, effectiveTimeout);
    
    // Initialize first activity tracking
    trackActivity();
    
    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      document.removeEventListener(SESSION_EVENTS.TIMEOUT_WARNING, handleWarning);
      document.removeEventListener(SESSION_EVENTS.SESSION_EXPIRED, handleExpired);
      
      clearTimeout(warningTimeout);
      clearTimeout(sessionTimeout);
    };
  }, [logoutMutation, effectiveTimeout]);

  return (
    <>
      {children}
      
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="text-warning h-5 w-5" />
              Session Timeout Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your session is about to expire due to inactivity. Would you like to continue working?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => forceLogout()}>
              Logout Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowWarning(false);
              trackActivity(); // This will ping the server and reset the timeout
            }}>
              Continue Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}