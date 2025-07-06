import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { 
  SESSION_EVENTS, 
  trackActivity, 
  forceLogout,
  extendSession
} from "@/lib/session-manager";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";
import { Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SessionTimeoutWrapper({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    // Set up listeners for session events
    const handleWarning = () => {
      console.log('Session timeout warning triggered');
      setShowWarning(true);
      setCountdown(120); // Reset to 2 minutes (120 seconds)
      
      // Start countdown
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowWarning(false);
            toast({
              title: "Session Expired",
              description: "Your session has expired due to inactivity.",
              variant: "destructive",
            });
            logoutMutation.mutate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };
    
    const handleExpired = () => {
      console.log('Session expired');
      setShowWarning(false);
      clearInterval(countdownInterval);
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity. Please log in again.",
        variant: "destructive",
      });
      logoutMutation.mutate();
    };
    
    document.addEventListener(SESSION_EVENTS.TIMEOUT_WARNING, handleWarning);
    document.addEventListener(SESSION_EVENTS.SESSION_EXPIRED, handleExpired);
    
    return () => {
      document.removeEventListener(SESSION_EVENTS.TIMEOUT_WARNING, handleWarning);
      document.removeEventListener(SESSION_EVENTS.SESSION_EXPIRED, handleExpired);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [logoutMutation, toast]);

  const handleContinue = () => {
    console.log('User chose to continue session');
    setShowWarning(false);
    extendSession();
    toast({
      title: "Session Extended",
      description: "Your session has been extended for another 30 minutes.",
    });
  };

  const handleLogout = () => {
    console.log('User chose to logout');
    setShowWarning(false);
    forceLogout();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}
      
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Session Timeout Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-lg font-mono">
                  <Clock className="h-8 w-8 text-amber-500" />
                  <span className="text-3xl font-bold text-amber-600">
                    {formatTime(countdown)}
                  </span>
                </div>
                <p>
                  Your session will expire in <strong>{formatTime(countdown)}</strong> due to inactivity.
                </p>
                <p className="text-sm text-muted-foreground">
                  For security reasons, inactive sessions are automatically logged out after 30 minutes.
                </p>
                <p className="text-sm font-medium">
                  Would you like to continue your session?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={handleLogout} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout Now
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleContinue} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}