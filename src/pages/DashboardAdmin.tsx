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
  role: 'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO' | 'PREPOSTO';
  depotId: string;
}

export const DashboardAdmin: React.FC<{ defaultTab?: 'hubs' | 'users' | 'carriers' | 'modules' | 'activities' | 'reports' | 'bayusages' }> = ({ defaultTab = 'hubs' }) => {
  const {
    depots,
    warehouseModules,
    bays,
    carriers,
    activityTypes,
    reportSchedules,
    bayUsages,
    addDepot,
    addWarehouseModule,
    addBay,
    updateBayStatus,
    updateBayUsage,
    addBayUsage,
    deleteBayUsage,
    approveCarrier,
    rejectCarrier,
    addActivityType,
    addReportSchedule,
    toggleReportSchedule,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'hubs' | 'users' | 'carriers' | 'modules' | 'activities' | 'reports' | 'bayusages'>(defaultTab);

  // Stati Hub
  const [newHubName, setNewHubName] = useState('');
  const [newHubCity, setNewHubCity] = useState('');

  // Stati Baia
  const [selectedHubForBay, setSelectedHubForBay] = useState(depots[0]?.id || '');
  const [selectedModuleForBay, setSelectedModuleForBay] = useState('');
  const [selectedUsageForBay, setSelectedUsageForBay] = useState('');
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

  // Stati Uso Baia
  const [newUsageName, setNewUsageName] = useState('');
  const [newUsageDesc, setNewUsageDesc] = useState('');

  // Stati Utenti
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([
    { id: 'user-1', name: 'Alessandro Neri', email: 'a.neri@logisticauno.it', role: 'ADMIN', depotId: 'depot-milano' },
    { id: 'user-2', name: 'Fabio Gialli', email: 'f.gialli@logisticauno.it', role: 'GUARDIA_CANCELLO', depotId: 'depot-milano' },
    { id: 'user-3', name: 'Roberto Verdi', email: 'r.verdi@logisticauno.it', role: 'OPERATORE_YARD', depotId: 'depot-roma' },
    { id: 'user-4', name: 'Sara Rossi', email: 's.rossi@logisticauno.it', role: 'GUARDIA_CANCELLO', depotId: 'depot-bari' },
    { id: 'user-5', name: 'Filippo Marroni', email: 'f.marroni@logisticauno.it', role: 'PREPOSTO', depotId: 'depot-milano' },
  ]);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO' | 'PREPOSTO'>('GUARDIA_CANCELLO');
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
    addBay(selectedHubForBay, newBayName, selectedModuleForBay || undefined, selectedUsageForBay || undefined);
    setNewBayName('');
    setSelectedModuleForBay('');
    setSelectedUsageForBay('');
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

  const handleCreateBayUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsageName) return;
    addBayUsage(newUsageName, newUsageDesc);
    setNewUsageName('');
    setNewUsageDesc('');
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
            Configurazione Plant stabilimenti, baie, moduli magazzino, anagrafiche usi baia e validazione vettori
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
          onClick={() => setAdminTab('bayusages')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'bayusages' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          🏷️ Uso Baie ({bayUsages.length})
        </button>
        <button
          onClick={() => setAdminTab('carriers')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'carriers' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          Smaltimento Vettori ({carriers.filter(c => c.status === 'ATTESA_APPROVAZIONE').length})
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
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

                <Select
                  label="Destinazione Uso Baia (Opzionale)"
                  options={[{ value: '', label: 'Nessun uso specifico (Generico)' }, ...bayUsages.map(u => ({ value: u.id, label: u.name }))]}
                  value={bayUsages.find(u => u.id === selectedUsageForBay)?.name || selectedUsageForBay}
                  onChange={(e) => {
                    const found = bayUsages.find(u => u.name === e.target.value || u.id === e.target.value);
                    setSelectedUsageForBay(found ? found.id : e.target.value);
                  }}
                />

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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {depotBays.map((bay) => {
                            const modName = warehouseModules.find(m => m.id === bay.moduleId)?.name || 'Nessuno';
                            const activeUsage = bayUsages.find(u => u.id === bay.bayUsageId);
                            return (
                              <div
                                key={bay.id}
                                className="border border-black/10 rounded-lg p-3 bg-white flex flex-col justify-between min-h-[120px] shadow-2xs space-y-2"
                              >
                                <div className="space-y-1">
                                  <div className="flex justify-between items-start">
                                    <span className="font-mono text-xs font-bold text-ticket-fg truncate max-w-[100px]">{bay.name}</span>
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        bay.status === 'DISPONIBILE' ? 'bg-ticket-success' : bay.status === 'OCCUPATA' ? 'bg-ticket-warning animate-pulse-glow' : 'bg-ticket-error'
                                      }`}
                                    />
                                  </div>
                                  <div className="text-[8px] font-mono text-gray-400 uppercase truncate">
                                    Mod: {modName}
                                  </div>
                                  <div className="text-[8px] font-mono text-ticket-accent font-bold uppercase truncate">
                                    Uso: {activeUsage?.name || 'Generica'}
                                  </div>
                                </div>

                                <div className="space-y-1 pt-1.5 border-t border-black/5">
                                  <select
                                    value={bay.bayUsageId || ''}
                                    onChange={(e) => updateBayUsage(bay.id, e.target.value || undefined)}
                                    className="w-full bg-gray-50 border border-black/10 text-[8px] text-gray-500 font-mono p-0.5 rounded focus:ring-0 focus:outline-none cursor-pointer"
                                  >
                                    <option value="">Uso Generico</option>
                                    {bayUsages.map(u => (
                                      <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={bay.status}
                                    onChange={(e) => updateBayStatus(bay.id, e.target.value as any)}
                                    className="w-full bg-gray-50 border border-black/10 text-[8px] text-black font-mono p-0.5 rounded focus:ring-0 focus:outline-none cursor-pointer font-bold"
                                  >
                                    <option value="DISPONIBILE">Libera</option>
                                    <option value="OCCUPATA" disabled>Occupata</option>
                                    <option value="MANUTENZIONE">Manutenzione</option>
                                  </select>
                                </div>
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

      {/* --- TAB: USO BAIE / DEFINIZIONI --- */}
      {adminTab === 'bayusages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Uso Baia / Riferimento Cliente" accent="orange">
              <form onSubmit={handleCreateBayUsage} className="space-y-4 font-sans text-xs">
                <Input
                  label="Nome Categoria / Cliente *"
                  placeholder="Es. Pallet vuoti o Cliente Rossi"
                  value={newUsageName}
                  onChange={(e) => setNewUsageName(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                    Descrizione Criterio di Utilizzo
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Regole operative, rampa dedicata..."
                    value={newUsageDesc}
                    onChange={(e) => setNewUsageDesc(e.target.value)}
                    className="w-full bg-white border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none font-sans"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Salva Uso Baia
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Anagrafica Uso Baie Registrate">
              <Table
                data={bayUsages}
                emptyMessage="Nessun Uso Baia definito nel sistema."
                columns={[
                  {
                    header: 'Nome Categoria',
                    accessor: (u) => <span className="font-bold text-xs font-mono">{u.name}</span>
                  },
                  {
                    header: 'Descrizione Regola',
                    accessor: (u) => <span className="text-gray-500 text-xs">{u.description || '-'}</span>
                  },
                  {
                    header: 'Baie Associate',
                    accessor: (u) => {
                      const count = bays.filter(b => b.bayUsageId === u.id).length;
                      return <Badge variant={count > 0 ? 'primary' : 'info'}>{count} baie</Badge>;
                    }
                  },
                  {
                    header: 'Azioni',
                    accessor: (u) => (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Rimuovere la categoria "${u.name}"? Le baie associate torneranno in modalità Generica.`)) {
                            deleteBayUsage(u.id);
                          }
                        }}
                      >
                        Elimina
                      </Button>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: MODULI MAGAZZINO --- */}
      {adminTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Modulo Magazzino" accent="orange">
              <form onSubmit={handleAddModule} className="space-y-4">
                <Select
                  label="Seleziona Stabilimento Plant"
                  options={depots.map((d) => ({ value: d.id, label: d.name }))}
                  value={depots.find(d => d.id === newModHubId)?.name || newModHubId}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    if (found) setNewModHubId(found.id);
                  }}
                />
                <Input
                  label="Nome Modulo *"
                  placeholder="Es. Modulo A (Freschi)"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  required
                />
                <Input
                  label="Descrizione Modulo"
                  placeholder="Specifiche corsie o raccordi..."
                  value={newModDesc}
                  onChange={(e) => setNewModDesc(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Registra Modulo
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Anagrafica Moduli Magazzino per Plant">
              <Table
                data={warehouseModules}
                emptyMessage="Nessun modulo magazzino registrato."
                columns={[
                  {
                    header: 'Nome Modulo',
                    accessor: (m) => <span className="font-bold text-xs">{m.name}</span>
                  },
                  {
                    header: 'Stabilimento Plant',
                    accessor: (m) => {
                      const d = depots.find((x) => x.id === m.depotId);
                      return <span>{d ? `${d.name} (${d.city})` : m.depotId}</span>;
                    }
                  },
                  {
                    header: 'Descrizione',
                    accessor: (m) => <span className="text-gray-500">{m.description || '-'}</span>
                  },
                  {
                    header: 'Capacità Baie',
                    accessor: (m) => {
                      const count = bays.filter(b => b.moduleId === m.id).length;
                      return <Badge variant="primary">{count} baie</Badge>;
                    }
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: CARRIERS VALIDATION --- */}
      {adminTab === 'carriers' && (
        <div className="space-y-6 animate-fade-in">
          <Card title="Richieste Registrazione Vettori (In Attesa Approvazione)">
            <Table
              data={carriers.filter((c) => c.status === 'ATTESA_APPROVAZIONE')}
              emptyMessage="Nessuna richiesta di attivazione pendente."
              columns={[
                {
                  header: 'Vettore Azienda',
                  accessor: (c) => <span className="font-bold text-xs">{c.name}</span>
                },
                {
                  header: 'Partita IVA (VAT)',
                  accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || '-'}</span>
                },
                {
                  header: 'Email Contatto',
                  accessor: (c) => <span className="font-mono text-xs text-gray-500">{c.email}</span>
                },
                {
                  header: 'Targa Trattore Pref.',
                  accessor: (c) => <span className="font-mono text-xs">{c.licensePlate || '-'}</span>
                },
                {
                  header: 'Azioni Validazione',
                  accessor: (c) => (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => approveCarrier(c.id)}
                      >
                        Approva Vettore
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => rejectCarrier(c.id)}
                      >
                        Rifiuta
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </Card>

          <Card title="Anagrafica Vettori Abilitati al Portale">
            <Table
              data={carriers.filter((c) => c.status === 'APPROVATO')}
              emptyMessage="Nessun vettore registrato o abilitato."
              columns={[
                {
                  header: 'Vettore Azienda',
                  accessor: (c) => <span className="font-bold text-xs">{c.name}</span>
                },
                {
                  header: 'Partita IVA',
                  accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || '-'}</span>
                },
                {
                  header: 'Email',
                  accessor: (c) => <span className="font-mono text-xs text-gray-500">{c.email}</span>
                },
                {
                  header: 'Targa Trattore Pref.',
                  accessor: (c) => <span className="font-mono text-xs">{c.licensePlate || '-'}</span>
                },
                {
                  header: 'Stato',
                  accessor: () => <Badge variant="success">Abilitato</Badge>
                }
              ]}
            />
          </Card>
        </div>
      )}

      {/* --- TAB: TIPOLOGIE ATTIVITÀ --- */}
      {adminTab === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Tipo Attività" accent="orange">
              <form onSubmit={handleAddActivity} className="space-y-4">
                <Input
                  label="Nome Attività *"
                  placeholder="Es. Carico Ortofrutta"
                  value={newActName}
                  onChange={(e) => setNewActName(e.target.value)}
                  required
                />
                <Input
                  label="Codice Identificativo Attività *"
                  placeholder="Es. CARICO_ORTO"
                  value={newActCode}
                  onChange={(e) => setNewActCode(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Crea Attività
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Tipologie di Attività Attive">
              <Table
                data={activityTypes}
                emptyMessage="Nessun tipo attività registrato."
                columns={[
                  {
                    header: 'Codice Attività',
                    accessor: (a) => <span className="font-mono font-bold text-xs text-ticket-accent">{a.code}</span>
                  },
                  {
                    header: 'Nome Visualizzato',
                    accessor: (a) => <span className="font-bold text-xs">{a.name}</span>
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: SCHEDULATORE REPORT --- */}
      {adminTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuova Pianificazione Report" accent="orange">
              <form onSubmit={handleAddReport} className="space-y-4">
                <Input
                  label="Nome Pianificazione *"
                  placeholder="Es. Report saturazione settimanale"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  required
                />
                <Select
                  label="Frequenza Invio"
                  options={[
                    { value: 'GIORNALIERO', label: 'Ogni giorno alle 22:00' },
                    { value: 'SETTIMANALE', label: 'Ogni lunedì mattina' },
                    { value: 'MENSILE', label: 'Il 1° giorno del mese' }
                  ]}
                  value={newRepFreq}
                  onChange={(e) => setNewRepFreq(e.target.value as any)}
                />
                <Input
                  label="Indirizzi Email Destinatari *"
                  placeholder="es. capoturno@logisticauno.it"
                  value={newRepRecipients}
                  onChange={(e) => setNewRepRecipients(e.target.value)}
                  required
                />
                <Select
                  label="Contenuto Statistica"
                  options={[
                    { value: 'Saturazione Baie', label: 'KPI Saturazione Baie' },
                    { value: 'Tempi Turnaround', label: 'Kpi Tempi di Turnaround camion' },
                    { value: 'Qualità ed Anomalie', label: 'Registro Anomalie Checklist Qualità' }
                  ]}
                  value={newRepType}
                  onChange={(e) => setNewRepType(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Registra Pianificazione
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Pianificazioni Report Attive">
              <Table
                data={reportSchedules}
                emptyMessage="Nessun report pianificato."
                columns={[
                  {
                    header: 'Nome Report',
                    accessor: (r) => <span className="font-bold text-xs">{r.name}</span>
                  },
                  {
                    header: 'Frequenza',
                    accessor: (r) => <span className="font-mono text-xs">{r.frequency}</span>
                  },
                  {
                    header: 'Destinatari',
                    accessor: (r) => <span className="text-gray-500 font-mono text-xs truncate max-w-[150px] block">{r.recipients}</span>
                  },
                  {
                    header: 'Tipo Statistica',
                    accessor: (r) => <Badge variant="primary">{r.reportType}</Badge>
                  },
                  {
                    header: 'Attivo',
                    accessor: (r) => (
                      <button
                        onClick={() => toggleReportSchedule(r.id)}
                        className={`px-3 py-1 font-mono text-[9px] font-bold rounded-lg cursor-pointer transition-all ${
                          r.active
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-300'
                            : 'bg-red-50 text-red-600 border border-red-300'
                        }`}
                      >
                        {r.active ? 'SI (Attivo)' : 'NO (Disattivato)'}
                      </button>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: UTENTI & PERMESSI --- */}
      {adminTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Registrazione Nuovo Utente Interno" accent="orange">
              <form onSubmit={handleAddUser} className="space-y-4">
                <Input
                  label="Nome Completo *"
                  placeholder="Es. Mario Neri"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
                <Input
                  label="Indirizzo Email *"
                  type="email"
                  placeholder="Es. m.neri@logisticauno.it"
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
                    { value: 'PREPOSTO', label: 'Preposto di Magazzino' },
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
          </div>

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
                            : u.role === 'PREPOSTO'
                            ? 'info'
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
                        <option value="PREPOSTO">Preposto Magazzino</option>
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
