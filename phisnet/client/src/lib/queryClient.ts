import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage: string;
    
    try {
      // Try to parse the response as JSON
      const errorJson = await res.json();
      // If it has a message property, use that
      errorMessage = errorJson.message || res.statusText;
    } catch (e) {
      // If parsing fails, use the text response
      const text = await res.text();
      errorMessage = text || res.statusText;
    }
    
    throw new Error(errorMessage);
  }
}

// Touch the session to keep it alive
export async function refreshSession(skipForUserEndpoint: boolean = false): Promise<void> {
  try {
    // Skip session refresh if we're fetching the user endpoint to avoid infinite loops
    if (skipForUserEndpoint) {
      return;
    }
    
    // Implement a cooldown to prevent too many session pings
    const now = Date.now();
    const lastPing = sessionStorage.getItem('lastSessionPing');
    
    if (lastPing) {
      const timeSinceLastPing = now - parseInt(lastPing);
      // Don't ping more than once every 5 minutes unless it's an explicit user action
      if (timeSinceLastPing < 5 * 60 * 1000) {
        return;
      }
    }
    
    // Store this ping time
    sessionStorage.setItem('lastSessionPing', now.toString());
    
    const response = await fetch('/api/session-ping', { 
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error("Session ping failed:", response.status);
      if (response.status === 401) {
        // Session already expired, trigger logout
        const sessionExpiredEvent = new Event('session-expired');
        document.dispatchEvent(sessionExpiredEvent);
        window.location.href = '/auth';
        return;
      }
    } else {
      // Update the last successful ping time for better tracking
      sessionStorage.setItem('lastSuccessfulPing', now.toString());
    }
  } catch (error) {
    console.error('Failed to refresh session:', error);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Skip session refresh for the user endpoint to avoid infinite loops
  const isUserEndpoint = url === '/api/user';
  
  // Refresh the session before making the actual request
  await refreshSession(isUserEndpoint);
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    // Skip refreshing session for /api/user to avoid infinite loops
    const isUserEndpoint = url === '/api/user';
    
    // Refresh the session before making the actual request
    await refreshSession(isUserEndpoint);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
