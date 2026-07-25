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
    <div className="w-80 bg-gradient-to-br from-[#003a75] via-[#004B97] to-[#0062b8] flex flex-col justify-between h-screen sticky top-0 text-white select-none shrink-0 border-r border-white/10">
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
                YARD & DOCK PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLLER DI SIMULAZIONE (RUOLI) */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 m-4 shadow-inner">
          <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/50 mb-3">
            [ SIMULATORE RUOLI ]
          </div>
          
          {/* Pulsanti Ruolo */}
          <div className="grid grid-cols-3 gap-1 mb-3">
            <button
              onClick={() => handleRoleChange('OPERATORE')}
              className={`p-1.5 text-[9px] font-mono font-bold uppercase border transition-all text-center rounded-lg cursor-pointer ${
                currentRole === 'OPERATORE'
                  ? 'bg-emerald-500/30 text-white border-emerald-400/50'
                  : 'bg-transparent text-white/60 border-white/10 hover:bg-white/5'
              }`}
            >
              Guardia
            </button>
            <button
              onClick={() => handleRoleChange('VETTORE')}
              className={`p-1.5 text-[9px] font-mono font-bold uppercase border transition-all text-center rounded-lg cursor-pointer ${
                currentRole === 'VETTORE'
                  ? 'bg-[#11BCEC]/30 text-white border-[#11BCEC]/50'
                  : 'bg-transparent text-white/60 border-white/10 hover:bg-white/5'
              }`}
            >
              Vettore
            </button>
            <button
              onClick={() => handleRoleChange('ADMIN')}
              className={`p-1.5 text-[9px] font-mono font-bold uppercase border transition-all text-center rounded-lg cursor-pointer ${
                currentRole === 'ADMIN'
                  ? 'bg-amber-500/30 text-white border-amber-400/50'
                  : 'bg-transparent text-white/60 border-white/10 hover:bg-white/5'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Dettaglio Ruolo / Configurazione */}
          {currentRole === 'VETTORE' ? (
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] font-mono text-white/40 uppercase tracking-wider">Vettore Selezionato</label>
              <select
                value={currentCarrierId}
                onChange={(e) => setCurrentCarrierId(e.target.value)}
                className="bg-black/20 border border-white/10 text-xs text-white font-mono p-2 rounded-lg focus:border-[#11BCEC] focus:ring-0 w-full cursor-pointer"
              >
                {carriers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#004B97] text-white">
                    {c.name} {c.status !== 'APPROVATO' ? `(${c.status.replace('_', ' ')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] font-mono text-white/40 uppercase tracking-wider">Magazzino Attivo</label>
              <select
                value={selectedDepotId}
                onChange={(e) => setSelectedDepotId(e.target.value)}
                className="bg-black/20 border border-white/10 text-xs text-white font-mono p-2 rounded-lg focus:border-[#11BCEC] focus:ring-0 w-full cursor-pointer"
              >
                {depots.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#004B97] text-white">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* NAVIGAZIONE MENU */}
        <div className="px-4 py-2 flex flex-col space-y-1 font-sans">
          <div className="text-[9px] font-mono font-bold tracking-widest text-white/35 uppercase px-3 mb-2">
            Pagine Consolle
          </div>

          {/* Viste Amministratore */}
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
                <span>⚙️ Configurazione Baie</span>
                {activeTab === 'admin-dashboard' && (
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
                <span>🚛 Registri & Vettori</span>
                {activeTab === 'admin-carriers' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
            </>
          )}

          {/* Viste Vettore */}
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
                <span>📅 Prenotazioni Vettore</span>
                {activeTab === 'carrier-portal' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
            </>
          )}

          {/* Viste Operative (Per Operatore e Admin) */}
          {(currentRole === 'OPERATORE' || currentRole === 'ADMIN') && (
            <>
              <button
                onClick={() => setActiveTab('yard-monitor')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'yard-monitor'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>🎛️ Monitor Yard Live</span>
                {activeTab === 'yard-monitor' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer mb-0.5 ${
                  activeTab === 'analytics'
                    ? 'bg-white/20 text-white shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>📊 Analytics & Tempi</span>
                {activeTab === 'analytics' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#11BCEC] shrink-0" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* User profile + logout */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
          <div className="h-8 w-8 rounded-lg bg-[#11BCEC]/30 border border-[#11BCEC]/40 flex items-center justify-center font-black text-white text-xs uppercase select-none shrink-0">
            {currentRole === 'OPERATORE' ? 'OP' : currentRole === 'VETTORE' ? 'VT' : 'AD'}
          </div>
          <div className="min-w-0 flex-grow">
            <span className="block text-xs font-bold text-white truncate leading-tight">
              {currentRole === 'OPERATORE' ? 'Operatore Yard' : currentRole === 'VETTORE' ? 'Area Vettori' : 'System Admin'}
            </span>
            <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest mt-0.5 truncate">
              {currentRole === 'VETTORE' ? currentCarrierName : currentDepotName}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Sei sicuro di voler ripristinare il database allo stato iniziale?')) {
              resetState();
              alert('Database ripristinato.');
            }
          }}
          className="w-full border border-red-500/30 text-red-200 font-mono text-[9px] font-bold tracking-wider uppercase py-2 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-center"
        >
          🚨 Ripristina Database
        </button>
      </div>
    </div>
  );
};
