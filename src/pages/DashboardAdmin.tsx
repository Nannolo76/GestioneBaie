import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';

interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO';
  depotId: string;
}

export const DashboardAdmin: React.FC<{ defaultTab?: 'hubs' | 'users' | 'carriers' | 'modules' | 'activities' | 'reports' }> = ({ defaultTab = 'hubs' }) => {
  const {
    depots,
    warehouseModules,
    bays,
    carriers,
    activityTypes,
    reportSchedules,
    addDepot,
    addWarehouseModule,
    addBay,
    updateBayStatus,
    approveCarrier,
    rejectCarrier,
    addActivityType,
    addReportSchedule,
    toggleReportSchedule,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'hubs' | 'users' | 'carriers' | 'modules' | 'activities' | 'reports'>(defaultTab);

  // Stati Hub
  const [newHubName, setNewHubName] = useState('');
  const [newHubCity, setNewHubCity] = useState('');

  // Stati Baia
  const [selectedHubForBay, setSelectedHubForBay] = useState(depots[0]?.id || '');
  const [selectedModuleForBay, setSelectedModuleForBay] = useState('');
  const [newBayName, setNewBayName] = useState('');

  // Stati Modulo Magazzino
  const [newModHubId, setNewModHubId] = useState(depots[0]?.id || '');
  const [newModName, setNewModName] = useState('');
  const [newModDesc, setNewModDesc] = useState('');

  // Stati Attività
  const [newActName, setNewActName] = useState('');
  const [newActCode, setNewActCode] = useState('');

  // Stati Report Schedulatore
  const [newRepName, setNewRepName] = useState('');
  const [newRepFreq, setNewRepFreq] = useState<'GIORNALIERO' | 'SETTIMANALE' | 'MENSILE'>('GIORNALIERO');
  const [newRepRecipients, setNewRepRecipients] = useState('');
  const [newRepType, setNewRepType] = useState('Saturazione Baie');

  // Stati Utenti
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([
    { id: 'user-1', name: 'Alessandro Neri', email: 'a.neri@logisticauno.it', role: 'ADMIN', depotId: 'depot-milano' },
    { id: 'user-2', name: 'Fabio Gialli', email: 'f.gialli@logisticauno.it', role: 'GUARDIA_CANCELLO', depotId: 'depot-milano' },
    { id: 'user-3', name: 'Roberto Verdi', email: 'r.verdi@logisticauno.it', role: 'OPERATORE_YARD', depotId: 'depot-roma' },
    { id: 'user-4', name: 'Sara Rossi', email: 's.rossi@logisticauno.it', role: 'GUARDIA_CANCELLO', depotId: 'depot-bari' },
  ]);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO'>('GUARDIA_CANCELLO');
  const [newUserDepot, setNewUserDepot] = useState(depots[0]?.id || '');

  // Form Submits
  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName || !newHubCity) return;
    addDepot(newHubName, newHubCity);
    setNewHubName('');
    setNewHubCity('');
  };

  const handleAddBay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBayName || !selectedHubForBay) return;
    addBay(selectedHubForBay, newBayName, selectedModuleForBay || undefined);
    setNewBayName('');
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModName || !newModHubId) return;
    addWarehouseModule(newModHubId, newModName, newModDesc);
    setNewModName('');
    setNewModDesc('');
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActName || !newActCode) return;
    addActivityType(newActName, newActCode);
    setNewActName('');
    setNewActCode('');
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepName || !newRepRecipients) return;
    addReportSchedule(newRepName, newRepFreq, newRepRecipients, newRepType);
    setNewRepName('');
    setNewRepRecipients('');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newUser: InternalUser = {
      id: `user-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      depotId: newUserDepot,
    };
    setInternalUsers((prev) => [...prev, newUser]);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleChangeUserRole = (userId: string, role: InternalUser['role']) => {
    setInternalUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
  };

  const activeHubModules = warehouseModules.filter((m) => m.depotId === selectedHubForBay);

  return (
    <div className="space-y-6">
      {/* Header Pagina */}
      <div className="flex justify-between items-center border-b border-black/10 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-ticket-accent uppercase tracking-wide">
            // PANNELLO DI CONTROLLO AMMINISTRATORE
          </h2>
          <p className="text-[10px] text-ticket-muted mt-1 uppercase tracking-widest font-mono">
            Configurazione Plant stabilimenti, baie, moduli magazzino e anagrafica vettori
          </p>
        </div>
      </div>

      {/* Sotto-Navigazione Amministrativa (Tabs) */}
      <div className="flex flex-wrap gap-1 border-b border-black/10 pb-px font-mono text-[9px]">
        <button
          onClick={() => setAdminTab('hubs')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'hubs' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          🏬 Plant & Baie
        </button>
        <button
          onClick={() => setAdminTab('modules')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'modules' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          📦 Moduli Magazzino
        </button>
        <button
          onClick={() => setAdminTab('carriers')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'carriers' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          🚛 Validazione Vettori ({carriers.filter(c => c.status === 'ATTESA_APPROVAZIONE').length})
        </button>
        <button
          onClick={() => setAdminTab('activities')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'activities' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          📋 Attività
        </button>
        <button
          onClick={() => setAdminTab('reports')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'reports' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          📅 Schedulatore Report
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'users' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          👤 Utenti & Permessi
        </button>
      </div>

      {/* --- TAB: HUB & BAIE --- */}
      {adminTab === 'hubs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card title="Nuovo Plant (Stabilimento)" accent="orange">
              <form onSubmit={handleAddHub} className="space-y-4">
                <Input
                  label="Nome Plant"
                  placeholder="Es. Milano Logistics Plant"
                  value={newHubName}
                  onChange={(e) => setNewHubName(e.target.value)}
                  required
                />
                <Input
                  label="Città / Provincia"
                  placeholder="Es. Lainate (MI)"
                  value={newHubCity}
                  onChange={(e) => setNewHubCity(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Registra Plant
                </Button>
              </form>
            </Card>

            <Card title="Aggiungi Baia a Plant" accent="yellow">
              <form onSubmit={handleAddBay} className="space-y-4">
                <Select
                  label="Seleziona Plant Destinazione"
                  options={depots.map((d) => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                  value={depots.find(d => d.id === selectedHubForBay)?.name || selectedHubForBay}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    if (found) setSelectedHubForBay(found.id);
                  }}
                />
                
                {activeHubModules.length > 0 && (
                  <Select
                    label="Associa a Modulo Magazzino (Opzionale)"
                    options={[{ value: '', label: 'Nessuna associazione' }, ...activeHubModules.map(m => ({ value: m.id, label: m.name }))]}
                    value={warehouseModules.find(m => m.id === selectedModuleForBay)?.name || selectedModuleForBay}
                    onChange={(e) => {
                      const found = warehouseModules.find(m => m.name === e.target.value || m.id === e.target.value);
                      setSelectedModuleForBay(found ? found.id : e.target.value);
                    }}
                  />
                )}

                <Input
                  label="Identificativo Baia"
                  placeholder="Es. Baia M-05"
                  value={newBayName}
                  onChange={(e) => setNewBayName(e.target.value)}
                  required
                />
                <Button type="submit" variant="warning" className="w-full">
                  Crea Baia
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card title="Mappatura Attuale Stabilimenti & Baie">
              <div className="space-y-6">
                {depots.map((depot) => {
                  const depotBays = bays.filter((b) => b.depotId === depot.id);
                  return (
                    <div key={depot.id} className="border border-black/10 rounded-lg p-4 bg-white/40 mb-4">
                      <div className="flex justify-between items-center border-b border-black/10 pb-2 mb-3">
                        <div className="font-sans">
                          <span className="text-ticket-accent font-bold uppercase">{depot.name}</span>
                          <span className="text-xs text-ticket-muted ml-2">({depot.city})</span>
                        </div>
                        <Badge variant="primary">{depotBays.length} Baie</Badge>
                      </div>

                      {depotBays.length === 0 ? (
                        <p className="text-xs font-mono text-ticket-muted uppercase">Nessuna baia configurata per questo Stabilimento.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {depotBays.map((bay) => {
                            const modName = warehouseModules.find(m => m.id === bay.moduleId)?.name || 'Nessuno';
                            return (
                              <div
                                key={bay.id}
                                className="border border-black/10 rounded-lg p-2 bg-white flex flex-col justify-between h-24 shadow-2xs"
                              >
                                <div>
                                  <div className="flex justify-between items-start">
                                    <span className="font-mono text-xs font-bold text-ticket-fg">{bay.name}</span>
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        bay.status === 'DISPONIBILE' ? 'bg-ticket-success' : bay.status === 'OCCUPATA' ? 'bg-ticket-warning animate-pulse-glow' : 'bg-ticket-error'
                                      }`}
                                    />
                                  </div>
                                  <div className="text-[8px] font-mono text-gray-400 mt-1 uppercase truncate">
                                    Mod: {modName}
                                  </div>
                                </div>
                                <select
                                  value={bay.status}
                                  onChange={(e) => updateBayStatus(bay.id, e.target.value as any)}
                                  className="bg-gray-50 border border-black/10 text-[9px] text-black font-mono p-1 mt-1 rounded-sm focus:ring-0 focus:outline-none cursor-pointer"
                                >
                                  <option value="DISPONIBILE">Libera</option>
                                  <option value="OCCUPATA" disabled>Occupata</option>
                                  <option value="MANUTENZIONE">In Manutenzione</option>
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: MODULI MAGAZZINO --- */}
      {adminTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Nuovo Modulo Magazzino" accent="orange">
            <form onSubmit={handleAddModule} className="space-y-4">
              <Select
                label="Associa a Plant"
                options={depots.map(d => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                value={depots.find(d => d.id === newModHubId)?.name || newModHubId}
                onChange={(e) => {
                  const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                  if (found) setNewModHubId(found.id);
                }}
              />
              <Input
                label="Nome Modulo"
                placeholder="Es. Modulo A (Temperatura Controllata)"
                value={newModName}
                onChange={(e) => setNewModName(e.target.value)}
                required
              />
              <Input
                label="Descrizione Modulo / Note"
                placeholder="Es. Baie da 3 a 8, merci fresche"
                value={newModDesc}
                onChange={(e) => setNewModDesc(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Crea Modulo Magazzino
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2">
            <Card title="Anagrafica Moduli di Magazzino per Plant">
              <Table
                data={warehouseModules}
                emptyMessage="Nessun modulo magazzino registrato."
                columns={[
                  {
                    header: 'Plant Logistico',
                    accessor: (m) => {
                      const d = depots.find(x => x.id === m.depotId);
                      return <span className="font-bold text-xs uppercase">{d ? d.name : 'Sconosciuto'}</span>;
                    }
                  },
                  {
                    header: 'Nome Modulo',
                    accessor: (m) => <span className="font-bold text-ticket-accent text-xs">{m.name}</span>
                  },
                  {
                    header: 'Descrizione / Note',
                    accessor: (m) => <span className="text-xs text-gray-600">{m.description || '-'}</span>
                  },
                  {
                    header: 'Basi Baie Attestate',
                    accessor: (m) => {
                      const count = bays.filter(b => b.moduleId === m.id).length;
                      return <Badge variant="primary">{count} Baie</Badge>;
                    }
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: ATTIVITA' --- */}
      {adminTab === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Nuova Tipologia Attività" accent="orange">
            <form onSubmit={handleAddActivity} className="space-y-4">
              <Input
                label="Nome Attività"
                placeholder="Es. Reso a Fornitore"
                value={newActName}
                onChange={(e) => setNewActName(e.target.value)}
                required
              />
              <Input
                label="Codice Univoco Attività"
                placeholder="Es. RESO"
                value={newActCode}
                onChange={(e) => setNewActCode(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Registra Tipologia Attività
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2">
            <Card title="Tipologie Attività Gestite nel Piazzale">
              <Table
                data={activityTypes}
                columns={[
                  {
                    header: 'Nome Attività',
                    accessor: (a) => <span className="font-bold text-xs">{a.name}</span>
                  },
                  {
                    header: 'Codice Identificativo',
                    accessor: (a) => <span className="font-mono text-xs text-[#11BCEC] font-bold">[{a.code}]</span>
                  },
                  {
                    header: 'Stato',
                    accessor: () => <Badge variant="success">Attivo</Badge>
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: SCHEDULATORE REPORT --- */}
      {adminTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Nuova Pianificazione Report" accent="orange">
            <form onSubmit={handleAddReport} className="space-y-4">
              <Input
                label="Nome Pianificazione"
                placeholder="Es. Invia Turnaround Settimanale"
                value={newRepName}
                onChange={(e) => setNewRepName(e.target.value)}
                required
              />
              <Select
                label="Frequenza di Invio"
                options={[
                  { value: 'GIORNALIERO', label: 'Ogni Giorno alle 20:00' },
                  { value: 'SETTIMANALE', label: 'Ogni Lunedì alle 08:00' },
                  { value: 'MENSILE', label: 'Il 1° del mese' }
                ]}
                value={newRepFreq}
                onChange={(e) => setNewRepFreq(e.target.value as any)}
              />
              <Select
                label="Tipo di Report Elaborato"
                options={[
                  { value: 'Tempi Turnaround', label: 'Efficienza Vettori (Turnaround)' },
                  { value: 'Saturazione Baie', label: 'Saturazione Giornaliera Baie' }
                ]}
                value={newRepType}
                onChange={(e) => setNewRepType(e.target.value)}
              />
              <Input
                label="Email Destinatari (Separate da virgola)"
                placeholder="es. ops@logisticauno.it, report@logisticauno.it"
                value={newRepRecipients}
                onChange={(e) => setNewRepRecipients(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Attiva Schedulatore
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2">
            <Card title="Schedulatore dei Report Logistici Programmato">
              <Table
                data={reportSchedules}
                emptyMessage="Nessun report schedulato."
                columns={[
                  {
                    header: 'Nome Report',
                    accessor: (r) => <span className="font-bold text-xs">{r.name}</span>
                  },
                  {
                    header: 'Tipologia',
                    accessor: (r) => <span className="text-xs">{r.reportType}</span>
                  },
                  {
                    header: 'Frequenza',
                    accessor: (r) => <Badge variant="primary">{r.frequency}</Badge>
                  },
                  {
                    header: 'Destinatari',
                    accessor: (r) => <span className="text-[10px] font-mono block max-w-[200px] truncate">{r.recipients}</span>
                  },
                  {
                    header: 'Pianificato',
                    accessor: (r) => (
                      <div className="flex items-center gap-2">
                        <Badge variant={r.active ? 'success' : 'danger'}>
                          {r.active ? 'Attivo' : 'Sospeso'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleReportSchedule(r.id)}
                        >
                          Modifica
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: APPROVAZIONE VETTORI --- */}
      {adminTab === 'carriers' && (
        <div className="space-y-6">
          <Card title="Richieste Registrazione Vettori (Approvazione Manuale)" accent="orange">
            <Table
              data={carriers.filter((c) => c.status === 'ATTESA_APPROVAZIONE')}
              emptyMessage="Nessun vettore in attesa di approvazione."
              columns={[
                {
                  header: 'Nome Vettore',
                  accessor: (c) => <span className="font-bold text-ticket-accent">{c.name}</span>,
                },
                {
                  header: 'Email Operativa',
                  accessor: (c) => <span className="text-black">{c.email}</span>,
                },
                {
                  header: 'P.IVA / VAT Number',
                  accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || 'NON SPECIFICATO'}</span>
                },
                {
                  header: 'Targa Principale',
                  accessor: (c) => (
                    <span className="font-mono text-xs font-bold border border-black/10 rounded-sm px-2 py-1 bg-gray-50">
                      {c.licensePlate || 'NON SPECIFICATA'}
                    </span>
                  ),
                },
                {
                  header: 'Stato',
                  accessor: () => <Badge variant="warning">In Attesa</Badge>,
                },
                {
                  header: 'Gestisci Richiesta',
                  accessor: (c) => (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => approveCarrier(c.id)}
                      >
                        Approva
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => rejectCarrier(c.id)}
                      >
                        Rifiuta
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          <Card title="Anagrafica Storica Vettori">
            <Table
              data={carriers.filter((c) => c.status !== 'ATTESA_APPROVAZIONE')}
              columns={[
                {
                  header: 'Nome Vettore',
                  accessor: (c) => <span className="font-bold">{c.name}</span>,
                },
                {
                  header: 'P.IVA / Codice Fiscale',
                  accessor: (c) => <span className="font-mono">{c.vatNumber || 'N/D'}</span>
                },
                {
                  header: 'Contatto Email',
                  accessor: (c) => <span>{c.email}</span>,
                },
                {
                  header: 'Stato Abilitazione',
                  accessor: (c) => (
                    <Badge variant={c.status === 'APPROVATO' ? 'success' : 'danger'}>
                      {c.status}
                    </Badge>
                  ),
                },
                {
                  header: 'Codice Utente Accesso',
                  accessor: (c) => (
                    <span className="text-xs text-ticket-muted font-mono">
                      {c.status === 'APPROVATO' ? `AUTO-USER-${c.id.toUpperCase()}` : 'N/A'}
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {/* --- TAB: UTENTI & PERMESSI --- */}
      {adminTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Aggiungi Utente Interno" accent="orange">
            <form onSubmit={handleAddUser} className="space-y-4">
              <Input
                label="Nome & Cognome"
                placeholder="Es. Mario Rossi"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
              <Input
                label="Email Aziendale"
                type="email"
                placeholder="m.rossi@logisticauno.it"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
              <Select
                label="Ruolo Operativo"
                options={[
                  { value: 'ADMIN', label: 'Amministratore' },
                  { value: 'OPERATORE_YARD', label: 'Operatore Yard (Magazzino)' },
                  { value: 'GUARDIA_CANCELLO', label: 'Guardia del Cancello Check-In' },
                ]}
                value={internalUsers.find(u => u.role === newUserRole)?.role || newUserRole}
                onChange={(e) => {
                  setNewUserRole(e.target.value as any);
                }}
              />
              <Select
                label="Assegnato a Plant"
                options={depots.map((d) => ({ value: d.id, label: d.name }))}
                value={depots.find(d => d.id === newUserDepot)?.name || newUserDepot}
                onChange={(e) => {
                  const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                  if (found) setNewUserDepot(found.id);
                }}
              />
              <Button type="submit" variant="primary" className="w-full">
                Abilita Utente
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2">
            <Card title="Registro Utenti Interni & Ruoli">
              <Table
                data={internalUsers}
                columns={[
                  {
                    header: 'Nome Utente',
                    accessor: (u) => (
                      <div className="font-bold text-black">
                        {u.name}
                        <div className="text-[10px] text-ticket-muted font-normal lowercase">{u.email}</div>
                      </div>
                    ),
                  },
                  {
                    header: 'Magazzino Assegnato',
                    accessor: (u) => {
                      const depotName = depots.find((d) => d.id === u.depotId)?.name || 'Tutti';
                      return <span className="text-xs uppercase">{depotName}</span>;
                    },
                  },
                  {
                    header: 'Permessi / Ruolo',
                    accessor: (u) => (
                      <Badge
                        variant={
                          u.role === 'ADMIN'
                            ? 'warning'
                            : u.role === 'OPERATORE_YARD'
                            ? 'success'
                            : 'primary'
                        }
                      >
                        {u.role.replace('_', ' ')}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Azioni Cambio Ruolo',
                    accessor: (u) => (
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value as any)}
                        className="bg-white border border-black/10 text-xs text-black font-mono p-1 rounded-md focus:ring-0 focus:outline-none cursor-pointer"
                      >
                        <option value="ADMIN">Amministratore</option>
                        <option value="OPERATORE_YARD">Operatore Yard</option>
                        <option value="GUARDIA_CANCELLO">Guardia Cancello</option>
                      </select>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
