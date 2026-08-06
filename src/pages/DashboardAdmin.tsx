import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';



export const DashboardAdmin: React.FC<{ defaultTab?: 'hubs' | 'users' | 'carriers' | 'modules' | 'activities' | 'reports' | 'bayusages' | 'anomalies' | 'clients' | 'pallettypes' | 'shipments' }> = ({ defaultTab = 'hubs' }) => {
  const {
    depots,
    warehouseModules,
    bays,
    carriers,
    activityTypes,
    reportSchedules,
    bayUsages,
    anomalies,
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
    resolveAnomaly,
    bookings,
    clients,
    palletTypes,
    users,
    shipments,
    addClient,
    deleteClient,
    addPalletType,
    deletePalletType,
    addUser,
    updateUserRole,
    deleteUser,
    addShipment,
    updateShipmentStatus,
    deleteShipment,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'hubs' | 'users' | 'carriers' | 'modules' | 'activities' | 'reports' | 'bayusages' | 'anomalies' | 'clients' | 'pallettypes' | 'shipments'>(defaultTab);

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
  const [newActBaseDuration, setNewActBaseDuration] = useState<number>(15);
  const [newActMinPerPallet, setNewActMinPerPallet] = useState<number>(1.0);

  // Stati Report Schedulatore
  const [newRepName, setNewRepName] = useState('');
  const [newRepFreq, setNewRepFreq] = useState<'GIORNALIERO' | 'SETTIMANALE' | 'MENSILE'>('GIORNALIERO');
  const [newRepRecipients, setNewRepRecipients] = useState('');
  const [newRepType, setNewRepType] = useState('Saturazione Baie');

  // Stati Uso Baia
  const [newUsageName, setNewUsageName] = useState('');
  const [newUsageDesc, setNewUsageDesc] = useState('');

  // Stati Anomalie
  const [activeResolveAnomalyId, setActiveResolveAnomalyId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  // Stati Clienti
  const [newClientName, setNewClientName] = useState('');
  const [newClientVat, setNewClientVat] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Stati Tipi Pallet
  const [newPalletName, setNewPalletName] = useState('');
  const [newPalletDesc, setNewPalletDesc] = useState('');

  // Stati Spedizioni
  const [newShipClientId, setNewShipClientId] = useState('');
  const [newShipCarrierId, setNewShipCarrierId] = useState('');
  const [newShipDepotId, setNewShipDepotId] = useState(depots[0]?.id || '');
  const [newShipOrderNum, setNewShipOrderNum] = useState('');
  const [newShipOrderNum2, setNewShipOrderNum2] = useState('');
  const [newShipActivityType, setNewShipActivityType] = useState<'CARICO' | 'SCARICO' | 'RESO' | 'CONTAINER'>('CARICO');
  const [newShipPalletPlaces, setNewShipPalletPlaces] = useState<number>(24);
  const [newShipExpectedDate, setNewShipExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newShipExpectedTime, setNewShipExpectedTime] = useState('');
  const [newShipOriginOrDestination, setNewShipOriginOrDestination] = useState('');
  const [newShipGoodsType, setNewShipGoodsType] = useState('');
  const [newShipExpectedDeliveryDate, setNewShipExpectedDeliveryDate] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO' | 'PREPOSTO'>('GUARDIA_CANCELLO');
  const [newUserDepot, setNewUserDepot] = useState(depots[0]?.id || '');

  useEffect(() => {
    if (depots.length > 0) {
      if (!selectedHubForBay) setSelectedHubForBay(depots[0].id);
      if (!newModHubId) setNewModHubId(depots[0].id);
      if (!newShipDepotId) setNewShipDepotId(depots[0].id);
      if (!newUserDepot) setNewUserDepot(depots[0].id);
    }
  }, [depots, selectedHubForBay, newModHubId, newShipDepotId, newUserDepot]);

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
    addActivityType(newActName, newActCode, newActBaseDuration, newActMinPerPallet);
    setNewActName('');
    setNewActCode('');
    setNewActBaseDuration(15);
    setNewActMinPerPallet(1.0);
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepName || !newRepRecipients) return;
    addReportSchedule(newRepName, newRepFreq, newRepRecipients, newRepType);
    setNewRepName('');
    setNewRepRecipients('');
  };

  const handleAddUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsageName) return;
    addBayUsage(newUsageName, newUsageDesc || undefined);
    setNewUsageName('');
    setNewUsageDesc('');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    addUser(newUserName, newUserEmail, newUserRole, newUserDepot);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleChangeUserRole = (userId: string, role: any) => {
    updateUserRole(userId, role);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    addClient(newClientName, newClientVat || undefined, newClientEmail || undefined);
    setNewClientName('');
    setNewClientVat('');
    setNewClientEmail('');
  };

  const handleAddPalletType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPalletName) return;
    addPalletType(newPalletName, newPalletDesc || undefined);
    setNewPalletName('');
    setNewPalletDesc('');
  };

  const handleAddShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const cId = newShipClientId || clients[0]?.id;
    const carrId = newShipCarrierId || carriers.filter(c => c.status === 'APPROVATO')[0]?.id;
    const dId = newShipDepotId || depots[0]?.id;
    if (!cId || !carrId || !dId || !newShipOrderNum) return;
    addShipment(
      cId,
      carrId,
      dId,
      newShipOrderNum,
      newShipOrderNum2,
      newShipActivityType,
      newShipPalletPlaces,
      newShipExpectedDate,
      newShipExpectedTime,
      newShipOriginOrDestination,
      newShipGoodsType,
      newShipExpectedDeliveryDate || undefined
    );
    setNewShipOrderNum('');
    setNewShipOrderNum2('');
    setNewShipPalletPlaces(24);
    setNewShipExpectedTime('');
    setNewShipOriginOrDestination('');
    setNewShipGoodsType('');
    setNewShipExpectedDeliveryDate('');
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
          onClick={() => setAdminTab('anomalies')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'anomalies' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          🚨 Gestione Anomalie ({anomalies.filter(a => !a.resolved).length})
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
          👤 Utenti & Permessi ({users.length})
        </button>
        <button
          onClick={() => setAdminTab('clients')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'clients' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          🏢 Gestione Clienti ({clients.length})
        </button>
        <button
          onClick={() => setAdminTab('pallettypes')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'pallettypes' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          🪵 Tipologie Pallet ({palletTypes.length})
        </button>
        <button
          onClick={() => setAdminTab('shipments')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'shipments' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          🚢 Spedizioni / Viaggi ({shipments.length})
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
                  Crea Stabilimento
                </Button>
              </form>
            </Card>

            <Card title="Nuova Baia Carico/Scarico" accent="orange">
              <form onSubmit={handleAddBay} className="space-y-4">
                <Select
                  label="Stabilimento Plant Ass."
                  options={depots.map(d => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                  value={depots.find(d => d.id === selectedHubForBay)?.name || selectedHubForBay}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    if (found) setSelectedHubForBay(found.id);
                  }}
                />

                <Select
                  label="Modulo di Magazzino (Opz.)"
                  options={[
                    { value: '', label: 'Nessun modulo specifico' },
                    ...activeHubModules.map(m => ({ value: m.id, label: m.name }))
                  ]}
                  value={warehouseModules.find(m => m.id === selectedModuleForBay)?.name || selectedModuleForBay}
                  onChange={(e) => {
                    const found = warehouseModules.find(m => m.name === e.target.value || m.id === e.target.value);
                    setSelectedModuleForBay(found ? found.id : e.target.value);
                  }}
                />

                <Select
                  label="Uso Baia / Cliente Associato"
                  options={[
                    { value: '', label: 'Uso Generico (Tutti)' },
                    ...bayUsages.map(bu => ({ value: bu.id, label: bu.name }))
                  ]}
                  value={bayUsages.find(bu => bu.id === selectedUsageForBay)?.name || selectedUsageForBay}
                  onChange={(e) => {
                    const found = bayUsages.find(bu => bu.name === e.target.value || bu.id === e.target.value);
                    setSelectedUsageForBay(found ? found.id : e.target.value);
                  }}
                />

                <Input
                  label="Identificativo Baia (Nome) *"
                  placeholder="Es. Baia A-09"
                  value={newBayName}
                  onChange={(e) => setNewBayName(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full">
                  Crea Baia
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card title="Stabilimenti Plant Registrati">
              <Table
                data={depots}
                emptyMessage="Nessun plant registrato."
                columns={[
                  {
                    header: 'Codice Hub',
                    accessor: (d) => <span className="font-mono font-bold text-xs text-ticket-accent">{d.id}</span>,
                  },
                  {
                    header: 'Nome Stabilimento',
                    accessor: (d) => <span className="font-bold">{d.name}</span>,
                  },
                  {
                    header: 'Provincia',
                    accessor: (d) => <span>{d.city}</span>,
                  },
                  {
                    header: 'Conteggio Baie',
                    accessor: (d) => (
                      <Badge variant="primary">
                        {bays.filter((b) => b.depotId === d.id).length} Baie
                      </Badge>
                    ),
                  },
                ]}
              />
            </Card>

            <Card title="Layout e Uso Baie del Yard (Gestione Rampa)">
              <p className="text-xs text-ticket-muted mb-4 font-mono uppercase">
                // Modifica al volo la destinazione d'uso o assegna le baie delle rampe a clienti specifici.
              </p>
              <Table
                data={bays}
                emptyMessage="Nessuna baia inserita a sistema."
                columns={[
                  {
                    header: 'Plant',
                    accessor: (b) => {
                      const dName = depots.find(d => d.id === b.depotId)?.name || 'Stabilimento';
                      return <span className="text-xs font-bold uppercase">{dName}</span>;
                    }
                  },
                  {
                    header: 'Modulo',
                    accessor: (b) => {
                      const mName = warehouseModules.find(m => m.id === b.moduleId)?.name || 'Nessuno';
                      return <span className="text-xs font-mono">{mName}</span>;
                    }
                  },
                  {
                    header: 'Identificativo Baia',
                    accessor: (b) => <span className="font-mono text-xs font-bold text-ticket-accent">{b.name}</span>
                  },
                  {
                    header: 'Uso Baia Attivo',
                    accessor: (b) => {
                      return (
                        <select
                          value={b.bayUsageId || ''}
                          onChange={(e) => updateBayUsage(b.id, e.target.value || undefined)}
                          className="bg-white border border-black/10 text-xs text-black font-mono p-1 rounded-md focus:ring-0 focus:outline-none cursor-pointer"
                        >
                          <option value="">Generico (Nessuno)</option>
                          {bayUsages.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      );
                    }
                  },
                  {
                    header: 'Stato Baia',
                    accessor: (b) => {
                      let badgeVar: 'success' | 'danger' | 'warning' = 'success';
                      if (b.status === 'OCCUPATA') badgeVar = 'danger';
                      if (b.status === 'MANUTENZIONE') badgeVar = 'warning';
                      return <Badge variant={badgeVar}>{b.status}</Badge>;
                    }
                  },
                  {
                    header: 'Attiva/Manutenzione',
                    accessor: (b) => {
                      const isMaintenance = b.status === 'MANUTENZIONE';
                      return (
                        <Button
                          size="sm"
                          variant={isMaintenance ? 'success' : 'warning'}
                          onClick={() => updateBayStatus(b.id, isMaintenance ? 'DISPONIBILE' : 'MANUTENZIONE')}
                        >
                          {isMaintenance ? 'Abilita' : 'Disabilita'}
                        </Button>
                      );
                    }
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
                  label="Stabilimento Plant"
                  options={depots.map(d => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                  value={depots.find(d => d.id === newModHubId)?.name || newModHubId}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    if (found) setNewModHubId(found.id);
                  }}
                />
                <Input
                  label="Nome Modulo Magazzino *"
                  placeholder="Es. Modulo A (Freschi)"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  required
                />
                <Input
                  label="Descrizione Modulo"
                  placeholder="Es. Temperatura controllata 4°C"
                  value={newModDesc}
                  onChange={(e) => setNewModDesc(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Crea Modulo
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Moduli Magazzino Configurati">
              <Table
                data={warehouseModules}
                emptyMessage="Nessun modulo magazzino registrato."
                columns={[
                  {
                    header: 'Plant Hub',
                    accessor: (m) => {
                      const dName = depots.find(d => d.id === m.depotId)?.name || 'Stabilimento';
                      return <span className="font-bold text-xs uppercase">{dName}</span>;
                    }
                  },
                  {
                    header: 'Modulo Magazzino',
                    accessor: (m) => <span className="font-mono text-xs font-bold text-ticket-accent">{m.name}</span>
                  },
                  {
                    header: 'Descrizione / Note',
                    accessor: (m) => <span>{m.description || '-'}</span>
                  },
                  {
                    header: 'Totale Baie Collegate',
                    accessor: (m) => (
                      <Badge variant="primary">
                        {bays.filter(b => b.moduleId === m.id).length} Baie Associate
                      </Badge>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: USO BAIE --- */}
      {adminTab === 'bayusages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Uso Baia / Riferimento Cliente" accent="orange">
              <form onSubmit={handleAddUsage} className="space-y-4">
                <Input
                  label="Nome Utilizzo / Cliente *"
                  placeholder="Es. Pallet vuoti o Cliente Rossi"
                  value={newUsageName}
                  onChange={(e) => setNewUsageName(e.target.value)}
                  required
                />
                <Input
                  label="Descrizione"
                  placeholder="Dettagli sulle merci o logistica di prossimità..."
                  value={newUsageDesc}
                  onChange={(e) => setNewUsageDesc(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Salva Anagrafica Uso
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Anagrafiche Usi Baia e Attività Prossimità">
              <Table
                data={bayUsages}
                emptyMessage="Nessun uso baia registrato."
                columns={[
                  {
                    header: 'Codice Uso',
                    accessor: (bu) => <span className="font-mono font-bold text-xs text-ticket-accent">{bu.id}</span>
                  },
                  {
                    header: 'Utilizzo / Riferimento',
                    accessor: (bu) => <span className="font-bold text-xs">{bu.name}</span>
                  },
                  {
                    header: 'Descrizione Operativa',
                    accessor: (bu) => <span>{bu.description || '-'}</span>
                  },
                  {
                    header: 'Rampe Collegate',
                    accessor: (bu) => (
                      <Badge variant="info">
                        {bays.filter((b) => b.bayUsageId === bu.id).length} Baie Attive
                      </Badge>
                    )
                  },
                  {
                    header: 'Gestisci',
                    accessor: (bu) => (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Rimuovendo ${bu.name}, le ralle collegate torneranno ad uso Generico. Rimuovere?`)) {
                            deleteBayUsage(bu.id);
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

      {/* --- TAB: VALIDAZIONE VETTORI --- */}
      {adminTab === 'carriers' && (
        <div className="space-y-6 animate-fade-in">
          <Card title="Richieste di Registrazione Vettori (Attesa Approvazione)">
            <Table
              data={carriers.filter((c) => c.status === 'ATTESA_APPROVAZIONE')}
              emptyMessage="Nessuna richiesta di approvazione pendente."
              columns={[
                {
                  header: 'Ragione Sociale Vettore',
                  accessor: (c) => <span className="font-bold text-xs uppercase">{c.name}</span>,
                },
                {
                  header: 'Email Contatto',
                  accessor: (c) => <span className="font-mono text-xs">{c.email}</span>,
                },
                {
                  header: 'Partita IVA',
                  accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || '-'}</span>,
                },
                {
                  header: 'Targa Trattore Pref.',
                  accessor: (c) => <span className="font-mono text-xs">{c.licensePlate || 'N/A'}</span>,
                },
                {
                  header: 'Valida Accesso',
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

          <Card title="Anagrafica Vettori Accreditati a Portale">
            <Table
              data={carriers.filter((c) => c.status === 'APPROVATO')}
              emptyMessage="Nessun vettore registrato a sistema."
              columns={[
                {
                  header: 'ID Vettore',
                  accessor: (c) => <span className="font-mono font-bold text-xs text-ticket-accent">{c.id}</span>
                },
                {
                  header: 'Ragione Sociale Vettore',
                  accessor: (c) => <span className="font-bold text-xs text-black">{c.name}</span>,
                },
                {
                  header: 'Partita IVA',
                  accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || '-'}</span>,
                },
                {
                  header: 'Indirizzo E-mail',
                  accessor: (c) => <span className="font-mono text-xs">{c.email}</span>,
                },
                {
                  header: 'Targa default',
                  accessor: (c) => <span className="font-mono text-xs">{c.licensePlate || 'N/A'}</span>
                },
                {
                  header: 'Stato Abilitazione',
                  accessor: () => <Badge variant="success">ACCEDITATO</Badge>,
                },
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
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Tempo Base (min) *"
                    type="number"
                    value={newActBaseDuration}
                    onChange={(e) => setNewActBaseDuration(Number(e.target.value))}
                    required
                  />
                  <Input
                    label="Minuti/Pallet (min) *"
                    type="number"
                    step="0.1"
                    value={newActMinPerPallet}
                    onChange={(e) => setNewActMinPerPallet(Number(e.target.value))}
                    required
                  />
                </div>
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
                  },
                  {
                    header: 'Tempo Base',
                    accessor: (a) => <span className="font-mono text-xs">{a.baseDurationMinutes} min</span>
                  },
                  {
                    header: 'Tempo per Pallet',
                    accessor: (a) => <span className="font-mono text-xs">{a.minutesPerPallet} min</span>
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: GESTIONE ANOMALIE --- */}
      {adminTab === 'anomalies' && (
        <div className="space-y-6 animate-fade-in">
          <Card title="Registro Storico delle Anomalie Yard (Tutti i Plant)">
            <p className="text-xs text-ticket-muted mb-4 font-mono uppercase">
              // CONSULTAZIONE E CONFERMA DEROGHE DA DIREZIONE O GUARDIOLA
            </p>
            <Table
              data={anomalies}
              emptyMessage="Nessuna anomalia o problematica registrata nei log."
              rowClassName={(a) => a.resolved ? 'opacity-60 bg-gray-50/50' : 'bg-rose-50/20 border-l-4 border-rose-500'}
              columns={[
                {
                  header: 'Data / Ora',
                  accessor: (a) => <span className="font-mono text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</span>
                },
                {
                  header: 'Plant',
                  accessor: (a) => {
                    const dName = depots.find(d => d.id === a.depotId)?.name || 'Plant';
                    return <span className="text-xs font-bold uppercase">{dName}</span>;
                  }
                },
                {
                  header: 'Ticket / Targa',
                  accessor: (a) => (
                    <div className="font-mono text-xs">
                      {a.licensePlate && <div>Targa: <span className="font-bold">{a.licensePlate}</span></div>}
                      {a.ticketNumber && <div className="text-[10px] text-gray-400">Ticket: {a.ticketNumber}</div>}
                    </div>
                  )
                },
                {
                  header: 'Tipo Anomalia',
                  accessor: (a) => {
                    let color: 'danger' | 'warning' | 'info' | 'primary' = 'danger';
                    if (a.type === 'TARGA_DUPLICATA') color = 'warning';
                    if (a.type === 'SFORAMENTO_TEMPO') color = 'primary';
                    return <Badge variant={color}>{a.type.replace('_', ' ')}</Badge>;
                  }
                },
                {
                  header: 'Descrizione Problema',
                  accessor: (a) => <p className="text-xs max-w-[250px] whitespace-normal font-medium">{a.message}</p>
                },
                {
                  header: 'Stato / Risoluzione',
                  accessor: (a) => {
                    if (a.resolved) {
                      return (
                        <div className="text-[10px] font-sans text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                          <span className="font-bold">Risolta da:</span> {a.resolvedBy}
                          <div className="italic mt-0.5">Note: "{a.resolutionNotes}"</div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-1">
                        <Badge variant="danger">ATTIVA</Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setActiveResolveAnomalyId(a.id);
                            setResolveNotes('');
                          }}
                        >
                          Risolvi
                        </Button>
                      </div>
                    );
                  }
                }
              ]}
            />
          </Card>
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
                    { value: 'GIORNALIERO', label: 'Ogni Giorno alle 22:00' },
                    { value: 'SETTIMANALE', label: 'Ogni Lunedì alle 06:00' },
                    { value: 'MENSILE', label: 'Il 1° giorno del Mese alle 06:00' }
                  ]}
                  value={newRepFreq}
                  onChange={(e) => setNewRepFreq(e.target.value as any)}
                />
                <Input
                  label="Indirizzi Destinatari (Email) *"
                  placeholder="Es. ops@logisticauno.it, dir@..."
                  value={newRepRecipients}
                  onChange={(e) => setNewRepRecipients(e.target.value)}
                  required
                />
                <Select
                  label="Tipo di Reportistica"
                  options={[
                    { value: 'Saturazione Baie', label: 'Report di Saturazione Rampa' },
                    { value: 'Tempi Turnaround', label: 'Report Tempi di Permanenza Camion' },
                    { value: 'Esiti Checklist', label: 'Report Anomalie & Checklist Fallite' }
                  ]}
                  value={newRepType}
                  onChange={(e) => setNewRepType(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Pianifica Invio
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Pianificazioni Attive di Invio Report automatici">
              <Table
                data={reportSchedules}
                emptyMessage="Nessun invio programmato."
                columns={[
                  {
                    header: 'Identificativo Report',
                    accessor: (r) => <span className="font-bold text-xs">{r.name}</span>
                  },
                  {
                    header: 'Frequenza',
                    accessor: (r) => <Badge variant="info">{r.frequency}</Badge>
                  },
                  {
                    header: 'Destinatari (E-mail)',
                    accessor: (r) => <span className="font-mono text-xs">{r.recipients}</span>
                  },
                  {
                    header: 'Tipo Contenuto',
                    accessor: (r) => <span className="font-mono text-xs text-ticket-accent font-bold uppercase">{r.reportType}</span>
                  },
                  {
                    header: 'Stato',
                    accessor: (r) => <Badge variant={r.active ? 'success' : 'danger'}>{r.active ? 'ATTIVO' : 'DISATTIVATO'}</Badge>
                  },
                  {
                    header: 'Cambia Stato',
                    accessor: (r) => (
                      <Button
                        size="sm"
                        variant={r.active ? 'warning' : 'success'}
                        onClick={() => toggleReportSchedule(r.id)}
                      >
                        {r.active ? 'Disattiva' : 'Attiva'}
                      </Button>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: UTENTI E PERMESSI --- */}
      {adminTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Crea Utente Interno" accent="orange">
              <form onSubmit={handleAddUser} className="space-y-4">
                <Input
                  label="Nome Completo *"
                  placeholder="Es. Fabio Neri"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
                <Input
                  label="E-mail Aziendale *"
                  type="email"
                  placeholder="f.neri@logisticauno.it"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
                <Select
                  label="Ruolo Organizzativo"
                  options={[
                    { value: 'ADMIN', label: 'Amministratore di Sistema' },
                    { value: 'OPERATORE_YARD', label: 'Operatore Yard' },
                    { value: 'GUARDIA_CANCELLO', label: 'Guardia Cancello (Guardiola)' },
                    { value: 'PREPOSTO', label: 'Preposto Magazzino (Qualità)' }
                  ]}
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                />
                <Select
                  label="Stabilimento di Presidio (Plant)"
                  options={depots.map(d => ({ value: d.id, label: d.name }))}
                  value={depots.find(d => d.id === newUserDepot)?.name || newUserDepot}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    if (found) setNewUserDepot(found.id);
                  }}
                />
                <Button type="submit" className="w-full">
                  Crea Utente
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Registro Utenti Interni & Ruoli">
              <Table
                data={users}
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
                  {
                    header: 'Elimina',
                    accessor: (u) => (
                      <Button size="sm" variant="danger" onClick={() => deleteUser(u.id)}>Rimuovi</Button>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: GESTIONE CLIENTI --- */}
      {adminTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Cliente Committente" accent="orange">
              <form onSubmit={handleAddClient} className="space-y-4">
                <Input
                  label="Ragione Sociale Cliente *"
                  placeholder="Es. Rossi SpA"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required
                />
                <Input
                  label="Partita IVA"
                  placeholder="Es. IT01234567890"
                  value={newClientVat}
                  onChange={(e) => setNewClientVat(e.target.value)}
                />
                <Input
                  label="E-mail Referente"
                  type="email"
                  placeholder="Es. logistica@cliente.it"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Registra Cliente
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Elenco Clienti Committenti Attivi">
              <Table
                data={clients}
                emptyMessage="Nessun cliente registrato."
                columns={[
                  {
                    header: 'Ragione Sociale',
                    accessor: (c) => <span className="font-bold text-xs">{c.name}</span>
                  },
                  {
                    header: 'Partita IVA',
                    accessor: (c) => <span className="font-mono text-xs">{c.vatNumber || '-'}</span>
                  },
                  {
                    header: 'E-mail Referente',
                    accessor: (c) => <span className="font-mono text-xs lowercase">{c.email || '-'}</span>
                  },
                  {
                    header: 'Azioni',
                    accessor: (c) => (
                      <Button size="sm" variant="danger" onClick={() => deleteClient(c.id)}>
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

      {/* --- TAB: TIPOLOGIE PALLET --- */}
      {adminTab === 'pallettypes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Aggiungi Tipologia Pallet" accent="orange">
              <form onSubmit={handleAddPalletType} className="space-y-4">
                <Input
                  label="Sigla / Codice Pallet *"
                  placeholder="Es. EPAL, CHEP, DUSSELDORF"
                  value={newPalletName}
                  onChange={(e) => setNewPalletName(e.target.value)}
                  required
                />
                <Input
                  label="Descrizione Tipologia"
                  placeholder="Es. Pallet in legno standard europeo"
                  value={newPalletDesc}
                  onChange={(e) => setNewPalletDesc(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Aggiungi Pallet
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Tipologie Pallet (Legni) Abilitati">
              <Table
                data={palletTypes}
                emptyMessage="Nessun tipo pallet configurato."
                columns={[
                  {
                    header: 'Codice Pallet',
                    accessor: (p) => <span className="font-bold text-xs uppercase text-ticket-accent">{p.name}</span>
                  },
                  {
                    header: 'Descrizione',
                    accessor: (p) => <span className="text-xs text-gray-600">{p.description || '-'}</span>
                  },
                  {
                    header: 'Azioni',
                    accessor: (p) => (
                      <Button size="sm" variant="danger" onClick={() => deletePalletType(p.id)}>
                        Rimuovi
                      </Button>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: GESTIONE SPEDIZIONI --- */}
      {adminTab === 'shipments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Viaggio / Spedizione" accent="orange">
              <form onSubmit={handleAddShipment} className="space-y-4">
                <Select
                  label="Cliente Committente *"
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  value={clients.find(c => c.id === newShipClientId)?.name || (clients[0]?.name || '')}
                  onChange={(e) => {
                    const found = clients.find(c => c.name === e.target.value || c.id === e.target.value);
                    if (found) setNewShipClientId(found.id);
                  }}
                  required
                />
                <Select
                  label="Vettore Assegnato *"
                  options={carriers.filter(c => c.status === 'APPROVATO').map(c => ({ value: c.id, label: c.name }))}
                  value={carriers.find(c => c.id === newShipCarrierId)?.name || (carriers.filter(c => c.status === 'APPROVATO')[0]?.name || '')}
                  onChange={(e) => {
                    const found = carriers.find(c => c.name === e.target.value || c.id === e.target.value);
                    if (found) setNewShipCarrierId(found.id);
                  }}
                  required
                />
                <Select
                  label="Stabilimento Plant *"
                  options={depots.map(d => ({ value: d.id, label: d.name }))}
                  value={depots.find(d => d.id === newShipDepotId)?.name || (depots[0]?.name || '')}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    if (found) setNewShipDepotId(found.id);
                  }}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Riferimento 1 (Ref 1) *"
                    placeholder="Es. ORD-2026-X"
                    value={newShipOrderNum}
                    onChange={(e) => setNewShipOrderNum(e.target.value)}
                    required
                  />
                  <Input
                    label="Riferimento 2 (Ref 2)"
                    placeholder="Es. REF-XYZ"
                    value={newShipOrderNum2}
                    onChange={(e) => setNewShipOrderNum2(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Data Prevista *"
                    type="date"
                    value={newShipExpectedDate}
                    onChange={(e) => setNewShipExpectedDate(e.target.value)}
                    required
                  />
                  <Input
                    label="Ora Prevista"
                    placeholder="Es. 09:30"
                    value={newShipExpectedTime}
                    onChange={(e) => setNewShipExpectedTime(e.target.value)}
                  />
                </div>
                <Input
                  label="Provenienza / Destinazione *"
                  placeholder="Es. Hub Milano / Client Location"
                  value={newShipOriginOrDestination}
                  onChange={(e) => setNewShipOriginOrDestination(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Tipologia Merce"
                    placeholder="Es. Alimentare"
                    value={newShipGoodsType}
                    onChange={(e) => setNewShipGoodsType(e.target.value)}
                  />
                  <Input
                    label="Posti Pallet Previsti *"
                    type="number"
                    value={newShipPalletPlaces}
                    onChange={(e) => setNewShipPalletPlaces(Number(e.target.value))}
                    required
                  />
                </div>
                <Select
                  label="Tipo Attività *"
                  options={[
                    { value: 'CARICO', label: 'Spedizione (Carico)' },
                    { value: 'SCARICO', label: 'Accettazione (Scarico)' },
                    { value: 'RESO', label: 'Reso Merce' },
                    { value: 'CONTAINER', label: 'Attività Container' }
                  ]}
                  value={newShipActivityType}
                  onChange={(e) => setNewShipActivityType(e.target.value as any)}
                  required
                />
                {newShipActivityType === 'CARICO' && (
                  <Input
                    label="Data Consegna Prevista"
                    type="date"
                    value={newShipExpectedDeliveryDate}
                    onChange={(e) => setNewShipExpectedDeliveryDate(e.target.value)}
                  />
                )}
                <Button type="submit" className="w-full">
                  Registra Spedizione
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Viaggi e Spedizioni Commissionati">
              <Table
                data={shipments}
                emptyMessage="Nessun viaggio commissionato."
                columns={[
                  {
                    header: 'Riferimenti',
                    accessor: (s) => (
                      <div className="font-mono text-xs">
                        <span className="font-bold text-ticket-accent block">{s.orderNumber}</span>
                        {s.orderNumber2 && <span className="text-gray-400 text-[10px] block">Ref 2: {s.orderNumber2}</span>}
                      </div>
                    )
                  },
                  {
                    header: 'Data / Ora Prev.',
                    accessor: (s) => (
                      <div className="text-xs font-mono">
                        <span>{s.expectedDate}</span>
                        {s.expectedTime && <span className="block text-ticket-accent">[{s.expectedTime}]</span>}
                      </div>
                    )
                  },
                  {
                    header: 'Cliente / Vettore',
                    accessor: (s) => {
                      const clientName = clients.find(c => c.id === s.clientId)?.name || 'Sconosciuto';
                      const carrierName = carriers.find(c => c.id === s.carrierId)?.name || 'Sconosciuto';
                      return (
                        <div className="text-xs font-sans">
                          <span className="font-bold block">{clientName}</span>
                          {s.subjectName && <span className="text-ticket-accent text-[10px] block">Sogg: {s.subjectName}</span>}
                          <span className="text-gray-500 text-[10px] block">Vettore: {carrierName}</span>
                        </div>
                      );
                    }
                  },
                  {
                    header: 'Tratta / Merce',
                    accessor: (s) => (
                      <div className="text-xs font-sans">
                        <span className="font-bold block">{s.city || s.originOrDestination || 'N/D'} {s.province && `(${s.province})`}</span>
                        {s.goodsType && <span className="text-gray-500 text-[10px] block">Merce: {s.goodsType}</span>}
                      </div>
                    )
                  },
                  {
                    header: 'Dettagli / Plt',
                    accessor: (s) => (
                      <div className="text-xs">
                        <Badge variant={s.activityType === 'CARICO' ? 'info' : 'primary'}>{s.activityType}</Badge>
                        <span className="block font-bold font-mono text-[10px] mt-0.5">{s.palletPlaces} PLT</span>
                      </div>
                    )
                  },
                  {
                    header: 'Viaggio Abbinato',
                    accessor: (s) => {
                      if (s.bookingId) {
                        const booking = bookings.find(b => b.id === s.bookingId);
                        return (
                          <div className="text-xs">
                            <span className="font-bold font-mono text-emerald-600 block">{booking?.ticketNumber || 'Abbinato'}</span>
                            {s.licensePlate && <span className="text-gray-400 text-[10px] font-mono block">Targa: {s.licensePlate}</span>}
                          </div>
                        );
                      }
                      return <span className="text-gray-400 italic text-[10px]">Non Abbinato</span>;
                    }
                  },
                  {
                    header: 'Stato',
                    accessor: (s) => (
                      <Badge variant={s.status === 'COMPLETATO' ? 'success' : s.status === 'PIANIFICATO' ? 'info' : 'warning'}>
                        {s.status.replace('_', ' ')}
                      </Badge>
                    )
                  },
                  {
                    header: 'Azioni',
                    accessor: (s) => (
                      <div className="flex gap-1">
                        {s.status === 'DA_PIANIFICARE' && (
                          <Button size="sm" variant="success" onClick={() => updateShipmentStatus(s.id, 'PIANIFICATO')}>
                            Pianificato
                          </Button>
                        )}
                        {s.status === 'PIANIFICATO' && (
                          <Button size="sm" variant="primary" onClick={() => updateShipmentStatus(s.id, 'COMPLETATO')}>
                            Completa
                          </Button>
                        )}
                        <Button size="sm" variant="danger" onClick={() => deleteShipment(s.id)}>
                          Rimuovi
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

      {/* MODAL RISOLUZIONE ANOMALIA */}
      {activeResolveAnomalyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-black/10 overflow-hidden">
            <div className="bg-rose-500 text-white p-4">
              <h3 className="font-bold text-sm uppercase">Risoluzione Anomalia Yard</h3>
            </div>
            <div className="p-4 space-y-3 font-sans text-xs">
              <p className="text-gray-600">Inserire le note o la giustificazione per marcare questa anomalia come risolta:</p>
              <textarea
                rows={3}
                placeholder="Es. Verificato cartaceo patente valida / Deroga approvata da direzione..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                className="w-full bg-gray-50 border border-black/10 rounded-lg p-2 text-xs focus:ring-0 focus:outline-none resize-none font-sans"
              />
            </div>
            <div className="flex gap-2 p-4 border-t border-black/5 bg-gray-50">
              <Button variant="secondary" className="flex-1 text-xs" onClick={() => setActiveResolveAnomalyId(null)}>Annulla</Button>
              <Button variant="success" className="flex-1 text-xs" onClick={() => {
                resolveAnomaly(activeResolveAnomalyId, resolveNotes);
                setActiveResolveAnomalyId(null);
                setResolveNotes('');
              }} disabled={!resolveNotes.trim()}>Conferma Risoluzione</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
