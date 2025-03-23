// src/context/DashboardContext.jsx
import { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');

  return (
    <DashboardContext.Provider value={{ isCollapsed, setIsCollapsed, theme, setTheme }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);