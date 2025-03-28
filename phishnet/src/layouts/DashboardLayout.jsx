// src/layouts/DashboardLayout.jsx
import { Header, Sidebar, Footer } from '../components/dashboard';
import { useDashboard } from '../context/DashboardContext';

const DashboardLayout = ({ children }) => {
  const { isCollapsed, theme } = useDashboard();

  return (
    <div className={`flex h-screen ${theme}`}>
      <Sidebar />
      <div className={`flex-1 transition-all ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="p-6 flex-1 overflow-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};