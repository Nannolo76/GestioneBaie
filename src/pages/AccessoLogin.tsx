import React, { useState } from 'react';
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'admin' | 'guardiola' | 'vettore'>('guardiola');
  
  // Stati Guardiola
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

  const handleLogin = () => {
    if (activeTab === 'admin') {
      setCurrentRole('ADMIN');
      setCurrentUser({
        id: 'usr-admin-1',
        name: 'Mario Rossi (Admin)',
        email: 'mario.admin@logisticauno.it',
        role: 'ADMIN',
      });
    } else if (activeTab === 'guardiola') {
      setCurrentRole('GUARDIA');
      setSelectedDepotId(selectedPlantId);
      const plantName = depots.find(d => d.id === selectedPlantId)?.name || 'Plant';
      setCurrentUser({
        id: `usr-guard-${selectedPlantId}`,
        name: `Guardiola ${plantName}`,
        email: `guardiola.${selectedPlantId}@logisticauno.it`,
        role: 'GUARDIA_CANCELLO',
        depotId: selectedPlantId,
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
        role: 'OPERATORE_YARD', // Mapped as standard user for yard page operations
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
    // reset form
    setRegName('');
    setRegEmail('');
    setRegVat('');
    setRegPlate('');
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F0EB] flex flex-col justify-center items-center p-4">
      {/* Brand logo in alto */}
      <div className="flex items-center gap-3 mb-8 select-none">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#003a75] to-[#0062b8] flex items-center justify-center text-white font-black text-lg shadow-md border border-white/20">
          L1
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight uppercase leading-none">
            Logistica Uno
          </h1>
          <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1 block">
            YARD & DOCK MANAGEMENT SYSTEM
          </span>
        </div>
      </div>

      <div className="w-full max-w-md">
        {!showRegForm ? (
          <Card title="Autenticazione Portale" className="shadow-lg border-black/10">
            {/* Tabs per tipologia d'accesso */}
            <div className="flex space-x-1 border-b border-black/10 pb-px mb-6 font-mono text-[10px]">
              <button
                onClick={() => setActiveTab('guardiola')}
                className={`flex-1 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer text-center ${
                  activeTab === 'guardiola'
                    ? 'border-[#11BCEC] text-[#11BCEC] bg-gray-50'
                    : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50'
                }`}
              >
                🎥 Guardiola
              </button>
              <button
                onClick={() => setActiveTab('vettore')}
                className={`flex-1 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer text-center ${
                  activeTab === 'vettore'
                    ? 'border-[#11BCEC] text-[#11BCEC] bg-gray-50'
                    : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50/50'
                }`}
              >
                🚛 Vettore
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer text-center ${
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
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Seleziona lo stabilimento (Plant) logistico presso cui sei operativo per monitorare il piazzale e registrare gli arrivi dei camion.
                </p>
                <Select
                  label="Stabilimento Plant Attivo"
                  options={depots.map((d) => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                  value={plantIdToLabel(selectedPlantId)}
                  onChange={(e) => {
                    const opt = depots.find(d => `${d.name} (${d.city})` === e.target.value || d.id === e.target.value);
                    if (opt) setSelectedPlantId(opt.id);
                  }}
                />
                <Button onClick={handleLogin} className="w-full mt-4">
                  Accedi come Guardiola
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
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Console di amministrazione di sistema per la configurazione dei Plant, dei moduli magazzino, abilitazione utenze e approvazione dei vettori.
                </p>
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
      </div>
    </div>
  );

  function plantIdToLabel(id: string) {
    const d = depots.find(x => x.id === id);
    return d ? `${d.name} (${d.city})` : id;
  }
  function carrierIdToLabel(id: string) {
    const c = carriers.find(x => x.id === id);
    return c ? c.name : id;
  }
};
