import { useState } from 'react';

// Simplified version that just returns the idle state
// The actual session management is handled by session-manager.ts
export function useIdleTimeout(timeout = 30 * 60 * 1000) {
  const [isIdle] = useState<boolean>(false);
  
  // Session management is now handled by the session-manager.ts
  // This hook is kept for compatibility but doesn't do the actual work
  
  return { isIdle };
}