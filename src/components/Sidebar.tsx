import React from 'react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentRole,
    setCurrentRole,
    carriers,
    currentCarrierId,
    setCurrentCarrierId,
    depots,
    selectedDepotId,
    setSelectedDepotId,
    resetState,
  } = useApp();

  const handleRoleChange = (role: 'ADMIN' | 'VETTORE' | 'OPERATORE') => {
    setCurrentRole(role);
    // Set some defaults when switching roles
    if (role === 'OPERATORE') {
      setActiveTab('yard-monitor');
    } else if (role === 'VETTORE') {
      setActiveTab('carrier-portal');
    } else if (role === 'ADMIN') {
      setActiveTab('admin-dashboard');
    }
  };

  const currentCarrierName = carriers.find((c) => c.id === currentCarrierId)?.name || 'Vettore';
  const currentDepotName = depots.find((d) => d.id === selectedDepotId)?.name || 'Milano';

  return (
    <div className="w-80 bg-cyber-card border-r border-cyber-border flex flex-col justify-between h-screen sticky top-0 text-cyber-text select-none">
      {/* Header & Logo */}
      <div>
        <div className="p-6 border-b border-cyber-border">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-cyber-orange animate-pulse-glow" />
            <h1 className="text-lg font-mono font-bold tracking-wider uppercase text-cyber-text">
              YARD & DOCK <span className="text-cyber-orange">MGR</span>
            </h1>
          </div>
          <div className="text-[10px] font-mono text-cyber-text-muted mt-1 uppercase tracking-widest">
            LOGISTICA UNO // VER. 1.0.0
          </div>
        </div>

        {/* CONTROLLER DI SIMULAZIONE (RUOLI) */}
        <div className="p-4 border-b border-cyber-border bg-cyber-bg/30 m-4 border border-dashed">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-orange mb-3">
            [ SIMULATORE CONSOLE ]
          </div>
          
          {/* Pulsanti Ruolo */}
          <div className="grid grid-cols-3 gap-1 mb-3">
            <button
              onClick={() => handleRoleChange('OPERATORE')}
              className={`p-1.5 text-[10px] font-mono font-bold uppercase border transition-all text-center ${
                currentRole === 'OPERATORE'
                  ? 'bg-cyber-green text-cyber-bg border-cyber-green'
                  : 'bg-transparent text-cyber-text-muted border-cyber-border hover:border-cyber-text-muted'
              }`}
            >
              Guardia
            </button>
            <button
              onClick={() => handleRoleChange('VETTORE')}
              className={`p-1.5 text-[10px] font-mono font-bold uppercase border transition-all text-center ${
                currentRole === 'VETTORE'
                  ? 'bg-cyber-orange text-cyber-bg border-cyber-orange'
                  : 'bg-transparent text-cyber-text-muted border-cyber-border hover:border-cyber-text-muted'
              }`}
            >
              Vettore
            </button>
            <button
              onClick={() => handleRoleChange('ADMIN')}
              className={`p-1.5 text-[10px] font-mono font-bold uppercase border transition-all text-center ${
                currentRole === 'ADMIN'
                  ? 'bg-cyber-yellow text-cyber-bg border-cyber-yellow'
                  : 'bg-transparent text-cyber-text-muted border-cyber-border hover:border-cyber-text-muted'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Dettaglio Ruolo / Configurazione */}
          {currentRole === 'VETTORE' ? (
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono text-cyber-text-muted uppercase">Vettore Selezionato</label>
              <select
                value={currentCarrierId}
                onChange={(e) => setCurrentCarrierId(e.target.value)}
                className="bg-cyber-bg border border-cyber-border text-xs text-cyber-text font-mono p-1.5 focus:border-cyber-orange focus:ring-0 w-full"
              >
                {carriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.status !== 'APPROVATO' ? `(${c.status.replace('_', ' ')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono text-cyber-text-muted uppercase">Magazzino Attivo</label>
              <select
                value={selectedDepotId}
                onChange={(e) => setSelectedDepotId(e.target.value)}
                className="bg-cyber-bg border border-cyber-border text-xs text-cyber-text font-mono p-1.5 focus:border-cyber-orange focus:ring-0 w-full"
              >
                {depots.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* NAVIGAZIONE MENU */}
        <div className="px-4 py-2 flex flex-col space-y-1 font-mono">
          <div className="text-[10px] font-bold tracking-wider text-cyber-text-muted uppercase px-2 mb-2">
            Navigazione
          </div>

          {/* Viste Amministratore */}
          {currentRole === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`flex items-center space-x-3 px-3 py-2 text-sm uppercase transition-all w-full text-left ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-cyber-yellow/10 text-cyber-yellow border-l-2 border-cyber-yellow'
                    : 'text-cyber-text-muted hover:text-cyber-text hover:bg-cyber-card-hover'
                }`}
              >
                <span>⚙️ Configurazione Baie</span>
              </button>
              <button
                onClick={() => setActiveTab('admin-carriers')}
                className={`flex items-center space-x-3 px-3 py-2 text-sm uppercase transition-all w-full text-left ${
                  activeTab === 'admin-carriers'
                    ? 'bg-cyber-yellow/10 text-cyber-yellow border-l-2 border-cyber-yellow'
                    : 'text-cyber-text-muted hover:text-cyber-text hover:bg-cyber-card-hover'
                }`}
              >
                <span>🚛 Registri & Vettori</span>
              </button>
            </>
          )}

          {/* Viste Vettore */}
          {currentRole === 'VETTORE' && (
            <>
              <button
                onClick={() => setActiveTab('carrier-portal')}
                className={`flex items-center space-x-3 px-3 py-2 text-sm uppercase transition-all w-full text-left ${
                  activeTab === 'carrier-portal'
                    ? 'bg-cyber-orange/10 text-cyber-orange border-l-2 border-cyber-orange'
                    : 'text-cyber-text-muted hover:text-cyber-text hover:bg-cyber-card-hover'
                }`}
              >
                <span>📅 Prenotazioni Vettore</span>
              </button>
            </>
          )}

          {/* Viste Operative (Per Operatore e Admin) */}
          {(currentRole === 'OPERATORE' || currentRole === 'ADMIN') && (
            <>
              <button
                onClick={() => setActiveTab('yard-monitor')}
                className={`flex items-center space-x-3 px-3 py-2 text-sm uppercase transition-all w-full text-left ${
                  activeTab === 'yard-monitor'
                    ? 'bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green'
                    : 'text-cyber-text-muted hover:text-cyber-text hover:bg-cyber-card-hover'
                }`}
              >
                <span>🎛️ Monitor Yard Live</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-3 px-3 py-2 text-sm uppercase transition-all w-full text-left ${
                  activeTab === 'analytics'
                    ? 'bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green'
                    : 'text-cyber-text-muted hover:text-cyber-text hover:bg-cyber-card-hover'
                }`}
              >
                <span>📊 Analytics & Tempi</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer Info & Reset */}
      <div className="p-4 border-t border-cyber-border">
        <div className="p-3 bg-cyber-bg/50 border border-cyber-border mb-3 font-mono text-[10px] text-cyber-text-muted space-y-1">
          <div><span className="text-cyber-orange">UTENTE:</span> {currentRole}</div>
          {currentRole === 'VETTORE' ? (
            <div className="truncate"><span className="text-cyber-orange">CARRIER:</span> {currentCarrierName}</div>
          ) : (
            <div className="truncate"><span className="text-cyber-orange">HUB:</span> {currentDepotName}</div>
          )}
          <div><span className="text-cyber-orange">STAZIONE:</span> TERMINAL-01</div>
        </div>

        <button
          onClick={() => {
            if (confirm('Sei sicuro di voler ripristinare il database allo stato iniziale?')) {
              resetState();
              alert('Database ripristinato.');
            }
          }}
          className="w-full border border-cyber-red/50 text-cyber-red font-mono text-xs font-bold tracking-wider uppercase py-2 bg-transparent hover:bg-cyber-red hover:text-cyber-text transition-all duration-150 cursor-pointer active:scale-95 text-center"
        >
          🚨 Ripristina Database
        </button>
      </div>
    </div>
  );
};
