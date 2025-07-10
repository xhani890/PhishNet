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
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    // Set up listeners for session events
    const handleWarning = () => {
      setShowWarning(true);
      setCountdown(300); // Reset to 5 minutes
      
      // Start countdown
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowWarning(false);
            logoutMutation.mutate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };
    
    const handleExpired = () => {
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
    setShowWarning(false);
    extendSession();
    toast({
      title: "Session Extended",
      description: "Your session has been extended for another 30 minutes.",
    });
  };

  const handleLogout = () => {
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
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="h-8 w-8 text-amber-500" />
                <span className="text-2xl font-bold text-amber-600">
                  {formatTime(countdown)}
                </span>
              </div>
              <p>
                Your session will expire in <strong>{formatTime(countdown)}</strong> due to inactivity.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Would you like to continue your session?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={handleLogout} className="bg-red-100 hover:bg-red-200 text-red-800">
              Logout Now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue} className="bg-green-100 hover:bg-green-200 text-green-800">
              Continue Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}