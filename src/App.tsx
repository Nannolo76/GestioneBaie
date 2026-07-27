import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { MonitorYard } from './pages/MonitorYard';
import { PortaleVettori } from './pages/PortaleVettori';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { ReportStatistiche } from './pages/ReportStatistiche';
import { AccessoLogin } from './pages/AccessoLogin';

function AppContent() {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState<string>('yard-monitor');

  // Allinea il tab in base al ruolo loggato per evitare disallineamenti di navigazione
  useEffect(() => {
    if (currentRole === 'ADMIN') {
      setActiveTab('admin-dashboard');
    } else if (currentRole === 'VETTORE') {
      setActiveTab('carrier-portal');
    } else if (currentRole === 'GUARDIA') {
      setActiveTab('yard-monitor');
    }
  }, [currentRole]);

  // Renderizza la pagina corretta in base al tab selezionato
  const renderActivePage = () => {
    switch (activeTab) {
      case 'yard-monitor':
        return <MonitorYard />;
      case 'analytics':
        return <ReportStatistiche />;
      case 'admin-dashboard':
        return <DashboardAdmin key="admin-hubs" defaultTab="hubs" />;
      case 'admin-carriers':
        return <DashboardAdmin key="admin-carriers" defaultTab="carriers" />;
      case 'admin-modules':
        return <DashboardAdmin key="admin-modules" defaultTab="modules" />;
      case 'admin-activities':
        return <DashboardAdmin key="admin-activities" defaultTab="activities" />;
      case 'admin-reports':
        return <DashboardAdmin key="admin-reports" defaultTab="reports" />;
      case 'carrier-portal':
        return <PortaleVettori />;
      default:
        return <MonitorYard />;
    }
  };

  if (!currentRole) {
    return <AccessoLogin />;
  }

  return (
    <div className="flex bg-ticket-bg min-h-screen w-full relative">
      {/* Barra di Navigazione di Ruolo */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Area Principale del Contenuto */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {renderActivePage()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
