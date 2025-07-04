import { refreshSession } from "./queryClient";

// Session timeout in milliseconds (8 hours)
export const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

// Event for communicating with components
export const SESSION_EVENTS = {
  TIMEOUT_WARNING: 'session-timeout-warning',
  SESSION_EXPIRED: 'session-expired'
};

let activityTimer: NodeJS.Timeout | null = null;
let lastActivityTime: number = Date.now();
let warningEmitted: boolean = false;
let isAuthenticated = true;

// Create custom events
const timeoutWarningEvent = new Event(SESSION_EVENTS.TIMEOUT_WARNING);
const sessionExpiredEvent = new Event(SESSION_EVENTS.SESSION_EXPIRED);

/**
 * Tracks user activity and refreshes the session
 */
export function trackActivity() {
  if (!isAuthenticated) return;
  
  lastActivityTime = Date.now();
  warningEmitted = false;
  
  // Reset timer on activity
  if (activityTimer) {
    clearTimeout(activityTimer);
  }
  
  // Set new timer for session timeout
  activityTimer = setTimeout(() => {
    // Emit session expired event
    document.dispatchEvent(sessionExpiredEvent);
    // Force logout
    window.location.href = '/auth';
  }, SESSION_TIMEOUT);
  
  // Ping server to refresh session
  refreshSession();
}

/**
 * Function to manually logout user
 */
export function forceLogout() {
  isAuthenticated = false;
  window.location.href = '/auth';
}

/**
 * Initializes the session activity tracking
 */
export function initSessionManager() {
  // Set up event listeners to track user activity
  const activityEvents = [
    'mousedown', 'mousemove', 'keydown',
    'scroll', 'touchstart', 'click', 'keypress'
  ];
  
  activityEvents.forEach(event => {
    document.addEventListener(event, () => trackActivity(), false);
  });
  
  // Set a timer to check for inactivity and emit warning before timeout
  setInterval(() => {
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivityTime;
    
    // Only refresh session every 15 minutes of activity to reduce server load
    if (inactiveTime < 15 * 60 * 1000) {  // Less than 15 minutes of inactivity
      refreshSession();
    }
    
    const timeUntilTimeout = SESSION_TIMEOUT - inactiveTime;
    
    // If we're within the warning period (5 minutes) and haven't emitted a warning yet
    if (timeUntilTimeout <= 5 * 60 * 1000 && timeUntilTimeout > 0 && !warningEmitted) {
      warningEmitted = true;
      document.dispatchEvent(timeoutWarningEvent);
    }
  }, 60000); // Check every minute instead of every 10 seconds
  
  // Initial tracking
  trackActivity();
}

/**
 * Cleans up session manager when component unmounts
 */
export function cleanupSessionManager() {
  if (activityTimer) {
    clearTimeout(activityTimer);
    activityTimer = null;
  }
}