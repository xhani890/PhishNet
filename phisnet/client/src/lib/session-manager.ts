import { refreshSession } from "./queryClient";

// Session timeout in milliseconds (30 minutes to match server)
export const SESSION_TIMEOUT = 30 * 60 * 1000;

// Event for communicating with components
export const SESSION_EVENTS = {
  TIMEOUT_WARNING: 'session-timeout-warning',
  SESSION_EXPIRED: 'session-expired'
};

let activityTimer: NodeJS.Timeout | null = null;
let warningTimer: NodeJS.Timeout | null = null;
let lastActivityTime: number = Date.now();
let warningEmitted: boolean = false;
let isAuthenticated = true;

// Time before session expiration to show warning (5 minutes before)
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000;

/**
 * Tracks user activity and refreshes the session
 */
export function trackActivity() {
  if (!isAuthenticated) return;
  
  lastActivityTime = Date.now();
  warningEmitted = false;
  
  // Clear existing timers
  if (activityTimer) {
    clearTimeout(activityTimer);
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
  }
  
  // Set warning timer (25 minutes after activity)
  warningTimer = setTimeout(() => {
    if (!warningEmitted && isAuthenticated) {
      warningEmitted = true;
      const warningEvent = new CustomEvent(SESSION_EVENTS.TIMEOUT_WARNING, {
        detail: { timeRemaining: WARNING_BEFORE_TIMEOUT }
      });
      document.dispatchEvent(warningEvent);
    }
  }, SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT);
  
  // Set session expiration timer (30 minutes after activity)
  activityTimer = setTimeout(() => {
    if (isAuthenticated) {
      // Emit session expired event
      const expiredEvent = new Event(SESSION_EVENTS.SESSION_EXPIRED);
      document.dispatchEvent(expiredEvent);
      // Force logout after a short delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    }
  }, SESSION_TIMEOUT);
  
  // Ping server to refresh session (but not too frequently)
  const now = Date.now();
  const lastPing = sessionStorage.getItem('lastSessionPing');
  if (!lastPing || now - parseInt(lastPing) > 5 * 60 * 1000) { // 5 minutes
    refreshSession();
  }
}

/**
 * Initialize session management
 */
export function initSessionManager() {
  isAuthenticated = true;
  
  // Events to track user activity
  const events = [
    'mousedown', 'mousemove', 'keypress', 
    'scroll', 'touchstart', 'click', 'keydown'
  ];
  
  // Add event listeners with throttling
  let throttleTimer: NodeJS.Timeout | null = null;
  const throttledTrackActivity = () => {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      trackActivity();
      throttleTimer = null;
    }, 1000); // Throttle to once per second
  };
  
  events.forEach(event => {
    document.addEventListener(event, throttledTrackActivity, { passive: true });
  });
  
  // Initialize first activity tracking
  trackActivity();
}

/**
 * Cleanup session management
 */
export function cleanupSessionManager() {
  isAuthenticated = false;
  
  // Clear timers
  if (activityTimer) {
    clearTimeout(activityTimer);
    activityTimer = null;
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
  
  // Remove event listeners
  const events = [
    'mousedown', 'mousemove', 'keypress', 
    'scroll', 'touchstart', 'click', 'keydown'
  ];
  
  events.forEach(event => {
    document.removeEventListener(event, trackActivity);
  });
}

/**
 * Force logout and cleanup
 */
export function forceLogout() {
  cleanupSessionManager();
  window.location.href = '/auth';
}

/**
 * Extend session when user chooses to continue
 */
export function extendSession() {
  warningEmitted = false;
  trackActivity();
}