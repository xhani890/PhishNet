import React, { createContext, useContext, useState } from "react";

// ✅ Create Sidebar Context
const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

// ✅ Custom Hook for Sidebar Context (Export Separately)
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// ✅ Export SidebarContext (Ensures proper usage)
export default SidebarContext;
