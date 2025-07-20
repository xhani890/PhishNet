import { useState, useEffect, useCallback } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackActivity } from "@/lib/session-manager";

// Warning will show 2 minutes before timeout
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minutes

interface SessionTimeoutAlertProps {
  timeoutInMs: number;
  onContinue: () => void;
  onLogout: () => void;
}

export function SessionTimeoutAlert({ 
  timeoutInMs, 
  onContinue, 
  onLogout 
}: SessionTimeoutAlertProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const { toast } = useToast();
  
  // Reset timer when user chooses to continue session
  const handleContinue = useCallback(() => {
    setShowWarning(false);
    trackActivity();
    onContinue();
    toast({
      title: "Session Extended",
      description: "Your session has been extended for another 30 minutes.",
    });
  }, [onContinue, toast]);
  
  // Logout user when they click logout or time expires
  const handleLogout = useCallback(() => {
    setShowWarning(false);
    onLogout();
  }, [onLogout]);
  
  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    let countdownValue = 120; // 2 minutes in seconds
    
    // Set timer to show warning before session expires
    warningTimer = setTimeout(() => {
      setShowWarning(true);
      setCountdown(120); // Reset to 2 minutes
      
      // Start countdown timer
      countdownTimer = setInterval(() => {
        countdownValue -= 1;
        setCountdown(countdownValue);
        
        if (countdownValue <= 0) {
          clearInterval(countdownTimer);
          handleLogout();
        }
      }, 1000);
    }, timeoutInMs - WARNING_BEFORE_TIMEOUT);
    
    // Clean up timers
    return () => {
      clearTimeout(warningTimer);
      clearInterval(countdownTimer);
    };
  }, [timeoutInMs, handleLogout]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
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
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-bold text-amber-600">
                  {formatTime(countdown)}
                </span>
              </div>
              <p>
                Your session will expire due to inactivity. Would you like to continue?
              </p>
              <div className="text-sm text-muted-foreground">
                For security reasons, inactive sessions are automatically logged out after 30 minutes.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Logout Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Continue Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}