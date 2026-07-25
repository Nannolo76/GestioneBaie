import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { MonitorYard } from './pages/MonitorYard';
import { PortaleVettori } from './pages/PortaleVettori';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { ReportStatistiche } from './pages/ReportStatistiche';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('yard-monitor');

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
      case 'carrier-portal':
        return <PortaleVettori />;
      default:
        return <MonitorYard />;
    }
  };

  return (
    <div className="flex bg-ticket-bg min-h-screen w-full relative">
      {/* Barra di Navigazione & Simulazione Ruoli */}
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
