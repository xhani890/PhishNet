import { ReactNode, useEffect } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "@/hooks/use-auth";
import { initSessionManager, cleanupSessionManager } from "@/lib/session-manager";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize session management when app loads
    initSessionManager();
    
    // Cleanup on unmount
    return () => {
      cleanupSessionManager();
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
