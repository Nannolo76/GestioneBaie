import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Input';

export const AccessoLogin: React.FC = () => {
  const {
    depots,
    carriers,
    registerCarrier,
    setCurrentRole,
    setCurrentUser,
    setCurrentCarrierId,
    setSelectedDepotId,
    users,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'admin' | 'guardiola' | 'vettore' | 'preposto'>('guardiola');
  
  // Stati Plant
  const [selectedPlantId, setSelectedPlantId] = useState(depots[0]?.id || '');

  // Stati Vettore
  const [selectedCarrierId, setSelectedCarrierId] = useState(carriers.filter(c => c.status === 'APPROVATO')[0]?.id || '');
  const [showRegForm, setShowRegForm] = useState(false);

  // Form di Registrazione Vettore
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVat, setRegVat] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    if (!users || users.length === 0) return;
    if (activeTab === 'guardiola') {
      const found = users.find(u => u.role === 'GUARDIA_CANCELLO');
      if (found) {
        setSelectedUserId(found.id);
        if (found.depotId) setSelectedPlantId(found.depotId);
      }
    } else if (activeTab === 'preposto') {
      const found = users.find(u => u.role === 'PREPOSTO' || u.role === 'OPERATORE_YARD');
      if (found) {
        setSelectedUserId(found.id);
        if (found.depotId) setSelectedPlantId(found.depotId);
      }
    } else if (activeTab === 'admin') {
      const found = users.find(u => u.role === 'ADMIN');
      if (found) setSelectedUserId(found.id);
    }
  }, [activeTab, users]);

  const handleLogin = () => {
    if (activeTab === 'admin') {
      const userObj = users.find(u => u.id === selectedUserId) || {
        id: 'usr-admin-1',
        name: 'Alessandro Neri',
        email: 'a.neri@logisticauno.it',
        role: 'ADMIN',
      };
      setCurrentRole('ADMIN');
      setCurrentUser({
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        role: 'ADMIN',
        depotId: userObj.depotId,
      });
    } else if (activeTab === 'guardiola') {
      const userObj = users.find(u => u.id === selectedUserId) || {
        id: `usr-guard-${selectedPlantId}`,
        name: `Guardiola di Presidio`,
        email: `guardiola.${selectedPlantId}@logisticauno.it`,
        role: 'GUARDIA_CANCELLO',
        depotId: selectedPlantId,
      };
      setCurrentRole('GUARDIA');
      setSelectedDepotId(userObj.depotId || selectedPlantId);
      setCurrentUser({
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        role: 'GUARDIA_CANCELLO',
        depotId: userObj.depotId || selectedPlantId,
      });
    } else if (activeTab === 'preposto') {
      const userObj = users.find(u => u.id === selectedUserId) || {
        id: `usr-preposto-${selectedPlantId}`,
        name: `Preposto di Presidio`,
        email: `preposto.${selectedPlantId}@logisticauno.it`,
        role: 'PREPOSTO',
        depotId: selectedPlantId,
      };
      setCurrentRole('PREPOSTO');
      setSelectedDepotId(userObj.depotId || selectedPlantId);
      setCurrentUser({
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        role: 'PREPOSTO',
        depotId: userObj.depotId || selectedPlantId,
      });
    } else if (activeTab === 'vettore') {
      if (!selectedCarrierId) {
        alert('Seleziona un vettore abilitato per accedere.');
        return;
      }
      setCurrentRole('VETTORE');
      setCurrentCarrierId(selectedCarrierId);
      const carrierName = carriers.find(c => c.id === selectedCarrierId)?.name || 'Vettore';
      setCurrentUser({
        id: `usr-carrier-${selectedCarrierId}`,
        name: carrierName,
        email: carriers.find(c => c.id === selectedCarrierId)?.email || 'carrier@info.it',
        role: 'OPERATORE_YARD',
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regVat) {
      setRegError('Tutti i campi obbligatori (*) devono essere compilati.');
      return;
    }
    registerCarrier(regName, regEmail, regVat, regPlate);
    setRegSuccess(true);
    setRegError('');
    setRegName('');
    setRegEmail('');
    setRegVat('');
    setRegPlate('');
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative bg-cover bg-center"
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80')` 
      }}
    >
      {/* Overlay scuro + sfocatura per leggibilità premium */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Brand logo in alto */}
      <div className="relative z-10 flex items-center gap-3 mb-8 select-none">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#003a75] to-[#0062b8] flex items-center justify-center text-white font-black text-lg shadow-md border border-white/20">
          L1
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-white tracking-tight uppercase leading-none">
            Logistica Uno
          </h1>
          <span className="text-[10px] font-mono text-gray-300 tracking-widest uppercase mt-1 block">
            YARD & DOCK MANAGEMENT SYSTEM
          </span>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {!showRegForm ? (
          <Card title="Autenticazione Portale" className="shadow-lg border-black/10">
            {/* Tabs per tipologia d'accesso */}
            <div className="flex space-x-1 border-b border-black/10 pb-px mb-6 font-mono text-[9px] overflow-x-auto whitespace-nowrap">
              <button
                onClick={() => setActiveTab('guardiola')}
                className={`flex-1 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer text-center px-2 ${
                  activeTab === 'guardiola'
                    ? 'border-[#11BCEC] text-[#11BCEC] bg-gray-50'
                    : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50'
                }`}
              >
                🎥 Guardiola
              </button>
              <button
                onClick={() => setActiveTab('preposto')}
                className={`flex-1 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer text-center px-2 ${
                  activeTab === 'preposto'
                    ? 'border-[#11BCEC] text-[#11BCEC] bg-gray-50'
                    : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50'
                }`}
              >
                📋 Preposto
              </button>
              <button
                onClick={() => setActiveTab('vettore')}
                className={`flex-1 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer text-center px-2 ${
                  activeTab === 'vettore'
                    ? 'border-[#11BCEC] text-[#11BCEC] bg-gray-50'
                    : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50'
                }`}
              >
                🚛 Vettore
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer text-center px-2 ${
                  activeTab === 'admin'
                    ? 'border-[#11BCEC] text-[#11BCEC] bg-gray-50'
                    : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50'
                }`}
              >
                ⚙️ Admin
              </button>
            </div>

            {/* CONTENUTO TAB: GUARDIOLA */}
            {activeTab === 'guardiola' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Seleziona la tua utenza operatore Guardiola registrata nel database per monitorare il piazzale ed effettuare i check-in dei camion.
                </p>
                <Select
                  label="Seleziona Operatore Reale *"
                  options={users.filter(u => u.role === 'GUARDIA_CANCELLO').map(u => ({ value: u.id, label: `${u.name} (Presidio: ${depots.find(d => d.id === u.depotId)?.name || 'Tutti'})` }))}
                  value={users.find(u => u.id === selectedUserId)?.name || ''}
                  onChange={(e) => {
                    const found = users.find(u => u.name === e.target.value || u.id === e.target.value);
                    if (found) {
                      setSelectedUserId(found.id);
                      if (found.depotId) setSelectedPlantId(found.depotId);
                    }
                  }}
                />
                <Button onClick={handleLogin} className="w-full mt-2">
                  Accedi come Guardiola
                </Button>
              </div>
            )}

            {/* CONTENUTO TAB: PREPOSTO */}
            {activeTab === 'preposto' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Seleziona la tua utenza operatore Preposto registrata nel database per compilare le check-list di conformità ed autorizzare le baie.
                </p>
                <Select
                  label="Seleziona Operatore Reale *"
                  options={users.filter(u => u.role === 'PREPOSTO' || u.role === 'OPERATORE_YARD').map(u => ({ value: u.id, label: `${u.name} (Presidio: ${depots.find(d => d.id === u.depotId)?.name || 'Tutti'})` }))}
                  value={users.find(u => u.id === selectedUserId)?.name || ''}
                  onChange={(e) => {
                    const found = users.find(u => u.name === e.target.value || u.id === e.target.value);
                    if (found) {
                      setSelectedUserId(found.id);
                      if (found.depotId) setSelectedPlantId(found.depotId);
                    }
                  }}
                />
                <Button onClick={handleLogin} className="w-full mt-2">
                  Accedi come Preposto
                </Button>
              </div>
            )}

            {/* CONTENUTO TAB: VETTORE */}
            {activeTab === 'vettore' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Accedi per pianificare i tuoi slot di carico/scarico merci presso i Plant di Logistica Uno.
                </p>

                {carriers.filter(c => c.status === 'APPROVATO').length === 0 ? (
                  <div className="p-3 text-xs text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                    Nessun vettore abilitato nel sistema. Registrati o contatta l'amministratore.
                  </div>
                ) : (
                  <Select
                    label="Seleziona il tuo Vettore"
                    options={carriers.filter(c => c.status === 'APPROVATO').map((c) => ({ value: c.id, label: c.name }))}
                    value={carrierIdToLabel(selectedCarrierId)}
                    onChange={(e) => {
                      const opt = carriers.find(c => c.name === e.target.value || c.id === e.target.value);
                      if (opt) setSelectedCarrierId(opt.id);
                    }}
                  />
                )}

                <Button onClick={handleLogin} disabled={!selectedCarrierId} className="w-full mt-2">
                  Accedi all'Area Riservata
                </Button>

                <div className="pt-4 border-t border-black/5 text-center">
                  <button
                    onClick={() => {
                      setShowRegForm(true);
                      setRegSuccess(false);
                    }}
                    className="text-xs font-bold text-[#11BCEC] hover:text-[#004B97] uppercase tracking-wider cursor-pointer"
                  >
                    Registra Nuovo Vettore ➔
                  </button>
                </div>
              </div>
            )}

            {/* CONTENUTO TAB: ADMIN */}
            {activeTab === 'admin' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Console di amministrazione di sistema per la configurazione dei Plant, dei moduli magazzino, abilitazione utenze e approvazione dei vettori.
                </p>
                <Select
                  label="Seleziona Utenza Admin *"
                  options={users.filter(u => u.role === 'ADMIN').map(u => ({ value: u.id, label: u.name }))}
                  value={users.find(u => u.id === selectedUserId)?.name || ''}
                  onChange={(e) => {
                    const found = users.find(u => u.name === e.target.value || u.id === e.target.value);
                    if (found) setSelectedUserId(found.id);
                  }}
                />
                <Button onClick={handleLogin} className="w-full mt-2" variant="warning">
                  Accedi come Amministratore
                </Button>
              </div>
            )}
          </Card>
        ) : (
          /* SCHEDA REGISTRAZIONE VETTORE */
          <Card title="Registrazione Nuovo Vettore" className="shadow-lg border-black/10">
            {regSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-3 border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans text-xs rounded-xl space-y-1">
                  <div className="font-bold text-[13px]">Richiesta Inviata!</div>
                  <p>L'anagrafica è stata registrata con successo in stato di attesa. Un operatore di Logistica Uno verificherà i dati e approverà l'accesso.</p>
                </div>
                <Button onClick={() => setShowRegForm(false)} className="w-full">
                  Torna al Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <p className="text-xs text-gray-500 font-sans">
                  Compila i dati aziendali per richiedere l'abilitazione al portale prenotazione baie.
                </p>

                {regError && (
                  <div className="p-2 text-xs border border-red-200 bg-red-50 text-red-600 rounded-lg">
                    {regError}
                  </div>
                )}

                <Input
                  label="Ragione Sociale Vettore *"
                  placeholder="es. Trasporti Veloci Spa"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />

                <Input
                  label="Partita IVA / VAT Number *"
                  placeholder="es. IT01234567890"
                  value={regVat}
                  onChange={(e) => setRegVat(e.target.value)}
                  required
                />

                <Input
                  label="Email di Contatto *"
                  type="email"
                  placeholder="es. logistica@azienda.it"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />

                <Input
                  label="Targa Trattore Stradale (Opzionale)"
                  placeholder="es. AA123BB"
                  value={regPlate}
                  onChange={(e) => setRegPlate(e.target.value)}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowRegForm(false)}
                  >
                    Annulla
                  </Button>
                  <Button type="submit" className="flex-1">
                    Invia Richiesta
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}
      
      {/* Credenziali di test in calce */}
      {!showRegForm && (
        <div className="w-full max-w-md mt-6 p-4 rounded-xl bg-black/75 border border-white/10 backdrop-blur-xs text-gray-300 space-y-3 font-mono text-[9px] shadow-lg animate-fade-in relative z-10">
          <span className="block text-white font-bold text-center border-b border-white/10 pb-2 uppercase tracking-wider">// Credenziali di Test Reali (Postgres)</span>
          <div className="space-y-2">
            <div>
              <span className="text-[#11BCEC] font-bold">⚙️ ADMIN:</span>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Alessandro Neri (<span className="text-gray-400">Ruolo: ADMIN</span>)</li>
              </ul>
            </div>
            <div>
              <span className="text-[#11BCEC] font-bold">🎥 GUARDIOLA:</span>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Fabio Gialli (<span className="text-gray-400">Milano Logistics Plant</span>)</li>
                <li>Sara Rossi (<span className="text-gray-400">Bari Logistics Plant</span>)</li>
              </ul>
            </div>
            <div>
              <span className="text-[#11BCEC] font-bold">📋 PREPOSTO:</span>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Filippo Marroni (<span className="text-gray-400">Milano Logistics Plant</span>)</li>
                <li>Roberto Verdi (<span className="text-gray-400">Roma Logistics Plant</span>)</li>
              </ul>
            </div>
            <div>
              <span className="text-[#11BCEC] font-bold">🚛 VETTORI:</span>
              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                <li>Logistica Uno Europe / Freccia Rossa Trasporti</li>
              </ul>
            </div>
          </div>
          <p className="text-[8px] text-gray-500 text-center italic border-t border-white/5 pt-2">
            Usa i menu a tendina sopra per selezionare queste anagrafiche reali caricate dal database. Le modifiche effettuate nel pannello Admin si rifletteranno qui all'istante.
          </p>
        </div>
      )}
      </div>
    </div>
  );


  function carrierIdToLabel(id: string) {
    const c = carriers.find(x => x.id === id);
    return c ? c.name : id;
  }
};
