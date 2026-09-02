import React from 'react';
import { useApp } from '../context/AppContext';
import { useResizer } from '../hooks/useResizer';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentRole,
    currentUser,
    carriers,
    currentCarrierId,
    depots,
    selectedDepotId,
    setCurrentRole,
    setCurrentUser,
    setCurrentCarrierId,
    setSelectedDepotId,
  } = useApp();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setCurrentRole(null);
    setCurrentUser(null);
    setCurrentCarrierId('');
    setShowLogoutConfirm(false);
  };

  const currentCarrierName = carriers.find((c) => c.id === currentCarrierId)?.name || 'Vettore';
  const currentDepotName = depots.find((d) => d.id === selectedDepotId)?.name || 'Milano';

  const { width, startResizing } = useResizer(220, 180, 400);

  return (
    <div 
      className="bg-gradient-to-br from-[#003a75] via-[#004B97] to-[#0062b8] flex flex-col justify-between h-screen sticky top-0 text-white select-none shrink-0 border-r border-white/10 relative z-20"
      style={{ width: `${width}px` }}
    >
      <div 
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-white/20 transition-colors z-50 group flex items-center justify-center"
      >
        <div className="h-8 w-0.5 bg-white/30 rounded-full group-hover:bg-white/80 transition-colors"></div>
      </div>

      {/* Brand */}
      <div>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white font-black text-sm shadow border border-white/20 select-none shrink-0">
              L1
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-white tracking-tight uppercase leading-none truncate">
                Logistica Uno
              </h2>
              <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase mt-0.5 block">
                YARD & DOCK SYSTEM
                </span>
            </div>
          </div>
        </div>

        {/* INFO CONTESTO ATTIVO */}
        <div className="px-5 py-4 border-b border-white/10 bg-white/5 font-sans">
          <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
            [ sessione attiva ]
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-white/60">Ruolo:</span>
              <span className="font-bold text-[#11BCEC] uppercase font-mono">
                {currentRole === 'ADMIN' && 'Amministratore'}
                {currentRole === 'GUARDIA' && 'Guardiola'}
                {currentRole === 'PREPOSTO' && 'Preposto Mag.'}
                {currentRole === 'VETTORE' && 'Vettore'}
              </span>
            </div>
            {(currentRole === 'GUARDIA' || currentRole === 'PREPOSTO') && (
              <div className="flex flex-col gap-1 mt-1 border-t border-white/5 pt-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Plant:</span>
                  {currentUser?.role === 'ADMIN' ? (
                    <select
                      value={selectedDepotId}
                      onChange={(e) => setSelectedDepotId(e.target.value)}
                      className="bg-slate-900 border border-white/20 text-[10px] text-white font-mono rounded p-1 max-w-[160px] outline-none cursor-pointer focus:border-[#11BCEC]"
                    >
                      {depots.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : currentUser?.depotIds && currentUser.depotIds.length > 1 ? (
                    <select
                      value={selectedDepotId}
                      onChange={(e) => setSelectedDepotId(e.target.value)}
                      className="bg-slate-900 border border-white/20 text-[10px] text-white font-mono rounded p-1 max-w-[160px] outline-none cursor-pointer focus:border-[#11BCEC]"
                    >
                      {currentUser.depotIds.map((id: string) => (
                        <option key={id} value={id}>
                          {depots.find((d) => d.id === id)?.name || id}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-bold truncate max-w-[150px] text-right font-mono">{currentDepotName}</span>
                  )}
                </div>
              </div>
            )}
            {currentRole === 'VETTORE' && (
              <div className="flex justify-between">
                <span className="text-white/60">Rag. Soc:</span>
                <span className="font-bold truncate max-w-[150px] text-right">{currentCarrierName}</span>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGAZIONE DI RUOLO */}
        <div className="px-4 py-4 flex flex-col space-y-1 font-sans">
          <div className="text-[9px] font-mono font-bold tracking-widest text-white/35 uppercase px-3 mb-2">
            Menu Operazioni
          </div>

          {/* MENU: AMMINISTRATORE */}
          {currentRole === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>⚙️ Stabilimenti & Baie</span>
                {activeTab === 'admin-dashboard' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('admin-modules')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'admin-modules'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>📦 Moduli Magazzino</span>
                {activeTab === 'admin-modules' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('admin-carriers')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'admin-carriers'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>🚛 Validazione Vettori</span>
                {activeTab === 'admin-carriers' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('admin-activities')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'admin-activities'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>📋 Tipologie Attività</span>
                {activeTab === 'admin-activities' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('admin-bayusages')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'admin-bayusages'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>🏷️ Uso Baie / Clienti</span>
                {activeTab === 'admin-bayusages' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('admin-reports')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'admin-reports'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>📅 Pianificazione Report</span>
                {activeTab === 'admin-reports' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
              <div className="my-2 border-t border-white/10" />
              <button
                onClick={() => setActiveTab('yard-monitor')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'yard-monitor'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>🎛️ Vista Live Monitor</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'analytics'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>📊 Analytics & Performance</span>
              </button>
            </>
          )}

          {/* MENU: VETTORE */}
          {currentRole === 'VETTORE' && (
            <>
              <button
                onClick={() => setActiveTab('carrier-portal')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'carrier-portal'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>📅 Prenotazione Slot & Profilo</span>
                {activeTab === 'carrier-portal' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
            </>
          )}

          {/* MENU: GUARDIA O PREPOSTO */}
          {(currentRole === 'GUARDIA' || currentRole === 'PREPOSTO') && (
            <>
              <button
                onClick={() => setActiveTab('yard-monitor')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'yard-monitor'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>{currentRole === 'PREPOSTO' ? '🎛️ Gestione Baie & Checklist' : '🎛️ Monitor Live Piazzale'}</span>
                {activeTab === 'yard-monitor' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer Profilo & Logout */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
          <div className="h-8 w-8 rounded-lg bg-[#11BCEC]/30 border border-[#11BCEC]/40 flex items-center justify-center font-black text-white text-xs uppercase select-none shrink-0">
            {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="min-w-0 flex-grow">
            <span className="block text-xs font-bold text-white truncate leading-tight">
              {currentUser?.name || 'Utente Portale'}
            </span>
            <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest mt-0.5 truncate">
              {currentUser?.email || 'utente@logisticauno.it'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full border border-white/20 text-white font-mono text-[9px] font-bold tracking-wider uppercase py-2.5 bg-white/5 hover:bg-white/20 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2"
        >
          <span>🚪</span> Esci dal Portale
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Conferma Logout"
        message="Sei sicuro di voler effettuare il logout da questa postazione?"
        confirmLabel="Logout"
        cancelLabel="Annulla"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="warning"
      />
    </div>
  );
};
