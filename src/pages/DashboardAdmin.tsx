import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import territoryData from '../data/territory.json';



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
    updateDepot,
    deleteDepot,
    addWarehouseModule,
    updateWarehouseModule,
    deleteWarehouseModule,
    addBay,
    updateBay,
    deleteBay,
    updateBayStatus,
    updateBayUsage,
    addBayUsage,
    deleteBayUsage,
    approveCarrier,
    rejectCarrier,
    updateCarrier,
    deleteCarrier,
    addActivityType,
    updateActivityType,
    deleteActivityType,
    addReportSchedule,
    updateReportSchedule,
    deleteReportSchedule,
    toggleReportSchedule,
    resolveAnomaly,
    bookings,
    clients,
    palletTypes,
    users,
    shipments,
    addClient,
    updateClient,
    deleteClient,
    addPalletType,
    updatePalletType,
    deletePalletType,
    addUser,
    updateUser,
    deleteUser,
    addShipment,
    updateShipmentStatus,
    deleteShipment
  } = useApp();

  const comuni = territoryData;

  const [adminTab, setAdminTab] = useState<'hubs' | 'users' | 'carriers' | 'modules' | 'activities' | 'reports' | 'bayusages' | 'anomalies' | 'clients' | 'pallettypes' | 'shipments' | 'comuni'>(defaultTab);

  // Stato Modifica Generale (Edit Modal)
  const [editingItem, setEditingItem] = useState<{
    type: 'depot' | 'warehouseModule' | 'bay' | 'carrier' | 'activityType' | 'reportSchedule' | 'client' | 'palletType' | 'user' | 'comune';
    id: string;
    fields: any;
  } | null>(null);

  // Stati Hub
  const [newHubName, setNewHubName] = useState('');
  const [newHubCity, setNewHubCity] = useState(''); // Località
  const [newHubAddress, setNewHubAddress] = useState('');
  const [newHubCap, setNewHubCap] = useState('');
  const [newHubProvince, setNewHubProvince] = useState('');
  const [newHubCountry, setNewHubCountry] = useState('Italia');

  // Stati Autocomplete
  const [filteredHubComuni, setFilteredHubComuni] = useState<any[]>([]);
  const [showHubSuggestions, setShowHubSuggestions] = useState(false);
  const [filteredEditHubComuni, setFilteredEditHubComuni] = useState<any[]>([]);
  const [showEditHubSuggestions, setShowEditHubSuggestions] = useState(false);
  const [filteredShipComuni, setFilteredShipComuni] = useState<any[]>([]);
  const [showShipSuggestions, setShowShipSuggestions] = useState(false);

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
  const [newClientDefaultDepotId, setNewClientDefaultDepotId] = useState('');

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
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO' | 'PREPOSTO'>('GUARDIA_CANCELLO');
  const [newUserDepotIds, setNewUserDepotIds] = useState<string[]>([]);
  const [comuniSearch, setComuniSearch] = useState('');

  // Autocomplete Nuovo Hub
  const handleHubCityChange = (val: string) => {
    setNewHubCity(val);
    if (!val) {
      setFilteredHubComuni([]);
      return;
    }
    const filtered = (comuni || []).filter(c => 
      c.comune.toLowerCase().includes(val.toLowerCase()) ||
      c.provincia.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredHubComuni(filtered.slice(0, 6));
    setShowHubSuggestions(true);
  };

  const handleHubCapChange = (val: string) => {
    setNewHubCap(val);
    if (!val) {
      setFilteredHubComuni([]);
      return;
    }
    const filtered = (comuni || []).filter(c => 
      c.cap.startsWith(val)
    );
    setFilteredHubComuni(filtered.slice(0, 6));
    setShowHubSuggestions(true);
  };

  const handleSelectHubComune = (c: { comune: string; cap: string; provincia: string }) => {
    setNewHubCity(c.comune);
    setNewHubCap(c.cap);
    setNewHubProvince(c.provincia);
    setNewHubCountry('Italia');
    setFilteredHubComuni([]);
    setShowHubSuggestions(false);
  };

  // Autocomplete Modifica Hub
  const handleEditHubCityChange = (val: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      fields: { ...editingItem.fields, city: val }
    });
    if (!val) {
      setFilteredEditHubComuni([]);
      return;
    }
    const filtered = (comuni || []).filter(c => 
      c.comune.toLowerCase().includes(val.toLowerCase()) ||
      c.provincia.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredEditHubComuni(filtered.slice(0, 6));
    setShowEditHubSuggestions(true);
  };

  const handleEditHubCapChange = (val: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      fields: { ...editingItem.fields, cap: val }
    });
    if (!val) {
      setFilteredEditHubComuni([]);
      return;
    }
    const filtered = (comuni || []).filter(c => 
      c.cap.startsWith(val)
    );
    setFilteredEditHubComuni(filtered.slice(0, 6));
    setShowEditHubSuggestions(true);
  };

  const handleSelectEditHubComune = (c: { comune: string; cap: string; provincia: string }) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      fields: {
        ...editingItem.fields,
        city: c.comune,
        cap: c.cap,
        province: c.provincia,
        country: 'Italia'
      }
    });
    setFilteredEditHubComuni([]);
    setShowEditHubSuggestions(false);
  };

  const handleShipOriginOrDestChange = (val: string) => {
    setNewShipOriginOrDestination(val);
    if (!val) {
      setFilteredShipComuni([]);
      return;
    }
    const filtered = (comuni || []).filter(c => 
      c.comune.toLowerCase().includes(val.toLowerCase()) ||
      c.provincia.toLowerCase().includes(val.toLowerCase()) ||
      c.cap.startsWith(val)
    );
    setFilteredShipComuni(filtered.slice(0, 6));
    setShowShipSuggestions(true);
  };

  const handleSelectShipComune = (c: { comune: string; cap: string; provincia: string }) => {
    setNewShipOriginOrDestination(`${c.comune} (${c.provincia}) - ${c.cap}`);
    setFilteredShipComuni([]);
    setShowShipSuggestions(false);
  };

  useEffect(() => {
    if (depots.length > 0) {
      if (!selectedHubForBay) setSelectedHubForBay(depots[0].id);
      if (!newModHubId) setNewModHubId(depots[0].id);
      if (!newShipDepotId) setNewShipDepotId(depots[0].id);
    }
  }, [depots, selectedHubForBay, newModHubId, newShipDepotId]);

  // Form Submits
  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName || !newHubCity) return;
    addDepot(newHubName, newHubCity, newHubAddress, newHubCap, newHubProvince, newHubCountry);
    setNewHubName('');
    setNewHubCity('');
    setNewHubAddress('');
    setNewHubCap('');
    setNewHubProvince('');
    setNewHubCountry('Italia');
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
    if (!newUserName || !newUserEmail || !newUserUsername || newUserDepotIds.length === 0) {
      alert("Si prega di inserire Username, Nome, Email e selezionare almeno un impianto logistico.");
      return;
    }
    addUser(newUserName, newUserEmail, newUserRole, newUserDepotIds, newUserUsername);
    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserDepotIds([]);
  };



  const handleDelete = (type: string, id: string, name: string) => {
    // 1. Hub
    if (type === 'depot') {
      const hasBays = bays.some(b => b.depotId === id);
      const hasModules = warehouseModules.some(m => m.depotId === id);
      const hasBookings = bookings.some(b => b.depotId === id);
      const hasShipments = shipments.some(s => s.depotId === id);
      if (hasBays || hasModules || hasBookings || hasShipments) {
        alert(`Impossibile eliminare lo stabilimento "${name}". Ci sono baie, moduli magazzino, prenotazioni o spedizioni collegate.`);
        return;
      }
      if (confirm(`Sei sicuro di voler eliminare lo stabilimento "${name}"?`)) {
        deleteDepot(id);
      }
    }
    // 2. Modulo Magazzino
    if (type === 'warehouseModule') {
      const hasBays = bays.some(b => b.moduleId === id);
      if (hasBays) {
        alert(`Impossibile eliminare il modulo "${name}". Ci sono baie associate.`);
        return;
      }
      if (confirm(`Sei sicuro di voler eliminare il modulo magazzino "${name}"?`)) {
        deleteWarehouseModule(id);
      }
    }
    // 3. Baia
    if (type === 'bay') {
      const hasBookings = bookings.some(b => b.bayId === id);
      if (hasBookings) {
        alert(`Impossibile eliminare la baia "${name}". Ci sono prenotazioni collegate.`);
        return;
      }
      if (confirm(`Sei sicuro di voler eliminare la baia "${name}"?`)) {
        deleteBay(id);
      }
    }
    // 4. Vettore
    if (type === 'carrier') {
      const hasBookings = bookings.some(b => b.carrierId === id);
      const hasShipments = shipments.some(s => s.carrierId === id);
      if (hasBookings || hasShipments) {
        alert(`Impossibile eliminare il vettore "${name}". Ci sono prenotazioni o spedizioni associate.`);
        return;
      }
      if (confirm(`Sei sicuro di voler eliminare il vettore "${name}"?`)) {
        deleteCarrier(id);
      }
    }
    // 5. Tipo Attività
    if (type === 'activityType') {
      const isUsedInBooking = bookings.some(b => b.activityType === name || b.activityType === id);
      const isUsedInShipment = shipments.some(s => s.activityType === name || s.activityType === id);
      if (isUsedInBooking || isUsedInShipment) {
        alert(`Impossibile eliminare l'attività "${name}". È utilizzata in prenotazioni o spedizioni.`);
        return;
      }
      if (confirm(`Sei sicuro di voler eliminare l'attività "${name}"?`)) {
        deleteActivityType(id);
      }
    }
    // 6. Report Schedulatore
    if (type === 'reportSchedule') {
      if (confirm(`Sei sicuro di voler eliminare la pianificazione report "${name}"?`)) {
        deleteReportSchedule(id);
      }
    }
    // 7. Cliente
    if (type === 'client') {
      const hasBookings = bookings.some(b => b.clientId === id);
      const hasShipments = shipments.some(s => s.clientId === id);
      if (hasBookings || hasShipments) {
        alert(`Impossibile eliminare il cliente "${name}". Ci sono prenotazioni o spedizioni associate.`);
        return;
      }
      if (confirm(`Sei sicuro di voler eliminare il cliente "${name}"?`)) {
        deleteClient(id);
      }
    }
    // 8. Tipo Pallet
    if (type === 'palletType') {
      const hasReturns = bookings.some(b => b.palletReturns && b.palletReturns.some(r => r.palletType === name));
      if (hasReturns) {
        alert(`Impossibile eliminare il tipo pallet "${name}". È utilizzato in resi pallet di prenotazioni registrate.`);
        return;
      }
      if (confirm(`Sei sicuro di voler eliminare il tipo pallet "${name}"?`)) {
        deletePalletType(id);
      }
    }
    // 9. Utente
    if (type === 'user') {
      if (id === 'user-1' || id === 'user-2' || id === 'user-3') {
        // Prevenzione cancellazione utente sessione corrente se implementato
      }
      if (confirm(`Sei sicuro di voler eliminare l'utente "${name}"?`)) {
        deleteUser(id);
      }
    }
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    addClient(newClientName, newClientVat || undefined, newClientEmail || undefined, newClientDefaultDepotId || undefined);
    setNewClientName('');
    setNewClientVat('');
    setNewClientEmail('');
    setNewClientDefaultDepotId('');
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
    addShipment({
      clientId: cId,
      carrierId: carrId,
      depotId: dId,
      orderNumber: newShipOrderNum,
      orderNumber2: newShipOrderNum2 || undefined,
      activityType: newShipActivityType,
      palletPlaces: newShipPalletPlaces,
      expectedDate: newShipExpectedDate,
      expectedTime: newShipExpectedTime || undefined,
      originOrDestination: newShipOriginOrDestination,
      goodsType: newShipGoodsType || undefined,
      expectedDeliveryDate: newShipExpectedDeliveryDate || undefined,
      hubOrigineOperativo: newShipActivityType === 'SCARICO' ? dId : undefined,
      hubDestinazioneOperativo: newShipActivityType === 'CARICO' ? dId : undefined,
      tipoOperazioneHub: newShipActivityType === 'SCARICO' ? 'INBOUND' : 'OUTBOUND'
    });
    setNewShipOrderNum('');
    setNewShipOrderNum2('');
    setNewShipPalletPlaces(24);
    setNewShipExpectedTime('');
    setNewShipOriginOrDestination('');
    setNewShipGoodsType('');
    setNewShipExpectedDeliveryDate('');
  };

  const activeHubModules = warehouseModules.filter((m) => m.depotId === selectedHubForBay);

  const filteredComuniTable = (comuni || []).filter(c => 
    c.comune.toLowerCase().includes(comuniSearch.toLowerCase()) ||
    c.cap.includes(comuniSearch) ||
    c.provincia.toLowerCase().includes(comuniSearch.toLowerCase())
  );

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
        <button
          onClick={() => setAdminTab('comuni')}
          className={`px-3 py-2 font-bold uppercase transition-all border-b-2 rounded-t-lg cursor-pointer ${
            adminTab === 'comuni' ? 'border-ticket-accent text-ticket-accent bg-white/50' : 'border-transparent text-gray-400 hover:text-black hover:bg-white/20'
          }`}
        >
          🗺️ Anagrafica Comuni ({(comuni || []).length})
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
                  label="Indirizzo"
                  placeholder="Es. Via dell'Artigianato, 10"
                  value={newHubAddress}
                  onChange={(e) => setNewHubAddress(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="CAP"
                      placeholder="Es. 20020"
                      value={newHubCap}
                      onChange={(e) => handleHubCapChange(e.target.value)}
                      onFocus={() => setShowHubSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowHubSuggestions(false), 200)}
                    />
                  </div>
                  <Input
                    label="Provincia"
                    placeholder="Es. MI"
                    value={newHubProvince}
                    onChange={(e) => setNewHubProvince(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Località"
                    placeholder="Es. Lainate"
                    value={newHubCity}
                    onChange={(e) => handleHubCityChange(e.target.value)}
                    onFocus={() => setShowHubSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowHubSuggestions(false), 200)}
                    required
                  />
                  {showHubSuggestions && filteredHubComuni.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto font-sans text-xs">
                      {filteredHubComuni.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectHubComune(c)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-b-0 flex justify-between items-center"
                        >
                          <span className="font-bold text-slate-800">{c.comune}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.cap} ({c.provincia})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  label="Nazione"
                  placeholder="Es. Italia"
                  value={newHubCountry}
                  onChange={(e) => setNewHubCountry(e.target.value)}
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
                    header: 'Indirizzo e Località',
                    accessor: (d) => (
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-700">{d.address || '-'}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {d.cap || ''} {d.city || ''} {d.province ? `(${d.province.toUpperCase()})` : ''} {d.country ? `- ${d.country}` : ''}
                        </span>
                      </div>
                    ),
                  },
                  {
                    header: 'Conteggio Baie',
                    accessor: (d) => (
                      <Badge variant="primary">
                        {bays.filter((b) => b.depotId === d.id).length} Baie
                      </Badge>
                    ),
                  },
                  {
                    header: 'Azioni',
                    accessor: (d) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'depot',
                            id: d.id,
                            fields: { name: d.name, city: d.city, address: d.address || '', cap: d.cap || '', province: d.province || '', country: d.country || 'Italia' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('depot', d.id, d.name)}
                        >
                          Elimina
                        </Button>
                      </div>
                    )
                  }
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
                  },
                  {
                    header: 'Azioni',
                    accessor: (b) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'bay',
                            id: b.id,
                            fields: { name: b.name, moduleId: b.moduleId || '', bayUsageId: b.bayUsageId || '' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('bay', b.id, b.name)}
                        >
                          Elimina
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
                  },
                  {
                    header: 'Azioni',
                    accessor: (m) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'warehouseModule',
                            id: m.id,
                            fields: { depotId: m.depotId, name: m.name, description: m.description || '' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('warehouseModule', m.id, m.name)}
                        >
                          Elimina
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
                {
                  header: 'Azioni',
                  accessor: (c) => (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingItem({
                          type: 'carrier',
                          id: c.id,
                          fields: { name: c.name, email: c.email, vatNumber: c.vatNumber || '', licensePlate: c.licensePlate || '' }
                        })}
                      >
                        Modifica
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete('carrier', c.id, c.name)}
                      >
                        Elimina
                      </Button>
                    </div>
                  )
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
                  },
                  {
                    header: 'Azioni',
                    accessor: (a) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'activityType',
                            id: a.id,
                            fields: { name: a.name, code: a.code, baseDurationMinutes: a.baseDurationMinutes, minutesPerPallet: a.minutesPerPallet }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('activityType', a.id, a.name)}
                        >
                          Elimina
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
                    header: 'Azioni',
                    accessor: (r) => (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant={r.active ? 'warning' : 'success'}
                          onClick={() => toggleReportSchedule(r.id)}
                        >
                          {r.active ? 'Disattiva' : 'Attiva'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'reportSchedule',
                            id: r.id,
                            fields: { name: r.name, frequency: r.frequency, recipients: r.recipients, reportType: r.reportType }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('reportSchedule', r.id, r.name)}
                        >
                          Elimina
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
                  label="Username di Accesso *"
                  placeholder="Es. f.neri"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
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
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase">Stabilimenti Attivi e Visibili *</label>
                  <div className="bg-white border border-black/10 rounded-md p-3 space-y-2 max-h-[150px] overflow-y-auto">
                    {depots.map((d) => {
                      const checked = newUserDepotIds.includes(d.id);
                      return (
                        <label key={d.id} className="flex items-center space-x-2 text-xs font-medium text-black cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (checked) {
                                setNewUserDepotIds((prev) => prev.filter((id) => id !== d.id));
                              } else {
                                setNewUserDepotIds((prev) => [...prev, d.id]);
                              }
                            }}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                          />
                          <span>{d.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
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
                        <div className="text-[10px] text-ticket-muted font-mono uppercase">User: {u.username}</div>
                        <div className="text-[10px] text-ticket-muted font-normal lowercase">{u.email}</div>
                      </div>
                    ),
                  },
                  {
                    header: 'Stabilimenti Assegnati',
                    accessor: (u) => {
                      const depotNames = u.depotIds && u.depotIds.length > 0 
                        ? u.depotIds.map((id: string) => depots.find((d) => d.id === id)?.name || id).join(', ') 
                        : (depots.find((d) => d.id === u.depotId)?.name || 'Nessuno');
                      return <span className="text-xs uppercase break-words block max-w-[180px]">{depotNames}</span>;
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
                    header: 'Stato Attivazione',
                    accessor: (u) => {
                      const statusColors = {
                        PENDING_CONFIRMATION: 'danger' as const,
                        FIRST_ACCESS: 'warning' as const,
                        ACTIVE: 'success' as const
                      };
                      const statusLabels = {
                        PENDING_CONFIRMATION: 'In attesa conferma mail',
                        FIRST_ACCESS: 'Primo accesso (creazione password)',
                        ACTIVE: 'Attivo / Pronto'
                      };
                      return (
                        <Badge variant={statusColors[u.status] || 'info'}>
                          {statusLabels[u.status] || u.status || 'ATTIVO'}
                        </Badge>
                      );
                    }
                  },
                  {
                    header: 'Azioni',
                    accessor: (u) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'user',
                            id: u.id,
                            fields: {
                              name: u.name,
                              username: u.username || '',
                              email: u.email,
                              role: u.role,
                              depotIds: u.depotIds || (u.depotId ? [u.depotId] : [])
                            }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('user', u.id, u.name)}
                          disabled={u.id === useApp().currentUser?.id}
                        >
                          Elimina
                        </Button>
                      </div>
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
                <Select
                  label="Hub di Default (Opzionale)"
                  options={[
                    { value: '', label: 'Nessun hub di default' },
                    ...depots.map(d => ({ value: d.id, label: d.name }))
                  ]}
                  value={depots.find(d => d.id === newClientDefaultDepotId)?.name || newClientDefaultDepotId}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    setNewClientDefaultDepotId(found ? found.id : e.target.value);
                  }}
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
                    header: 'Hub di Default',
                    accessor: (c) => {
                      const matchedDepot = depots.find(d => d.id === c.defaultDepotId);
                      return <span className="font-semibold text-xs text-gray-700">{matchedDepot ? matchedDepot.name : '-'}</span>;
                    }
                  },
                  {
                    header: 'Azioni',
                    accessor: (c) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'client',
                            id: c.id,
                            fields: { name: c.name, vatNumber: c.vatNumber || '', email: c.email || '', defaultDepotId: c.defaultDepotId || '' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('client', c.id, c.name)}
                        >
                          Elimina
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'palletType',
                            id: p.id,
                            fields: { name: p.name, description: p.description || '' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('palletType', p.id, p.name)}
                        >
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
                <div className="relative">
                  <Input
                    label="Provenienza / Destinazione *"
                    placeholder="Es. Hub Milano / Client Location"
                    value={newShipOriginOrDestination}
                    onChange={(e) => handleShipOriginOrDestChange(e.target.value)}
                    onFocus={() => setShowShipSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowShipSuggestions(false), 200)}
                    required
                  />
                  {showShipSuggestions && filteredShipComuni.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto font-sans text-xs text-black">
                      {filteredShipComuni.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectShipComune(c)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-b-0 flex justify-between items-center"
                        >
                          <span className="font-bold text-slate-800">{c.comune}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.cap} ({c.provincia})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* --- TAB: ANAGRAFICA COMUNI --- */}
      {adminTab === 'comuni' && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 animate-fade-in text-black font-sans">
          <div className="space-y-4">
            <Card title="Database Comuni Italiani (ISTAT - 7904 Record Ufficiali)">
              <div className="mb-4">
                <Input
                  placeholder="Cerca comune per nome, cap o provincia..."
                  value={comuniSearch}
                  onChange={(e) => setComuniSearch(e.target.value)}
                />
              </div>
              <Table
                data={filteredComuniTable}
                emptyMessage="Nessun comune trovato per i criteri specificati."
                columns={[
                  {
                    header: 'Comune',
                    accessor: (c) => <span className="font-bold text-black">{c.comune}</span>
                  },
                  {
                    header: 'CAP',
                    accessor: (c) => <span className="font-mono text-xs">{c.cap}</span>
                  },
                  {
                    header: 'Provincia',
                    accessor: (c) => <span className="font-mono font-bold text-xs uppercase text-[#004B97]">{c.provincia}</span>
                  },
                  {
                    header: 'Nazione',
                    accessor: () => <span className="text-xs text-gray-500">Italia</span>
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

      {/* MODAL DI MODIFICA RECORD */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-slate-950 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-white">
            <div className="bg-slate-900 border-b border-white/5 p-4 flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#11BCEC] flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#11BCEC] animate-pulse"></span>
                [ MODIFICA ELEMENTO ]
              </h3>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold bg-transparent border-none"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const { type, id, fields } = editingItem;
              if (type === 'depot') {
                updateDepot(id, fields.name, fields.city, fields.address, fields.cap, fields.province, fields.country);
              } else if (type === 'warehouseModule') {
                updateWarehouseModule(id, fields.depotId, fields.name, fields.description);
              } else if (type === 'bay') {
                updateBay(id, fields.name, fields.moduleId || undefined, fields.bayUsageId || undefined);
              } else if (type === 'carrier') {
                updateCarrier(id, fields.name, fields.email, fields.vatNumber || undefined, fields.licensePlate || undefined);
              } else if (type === 'activityType') {
                updateActivityType(id, fields.name, fields.code, fields.baseDurationMinutes, fields.minutesPerPallet);
              } else if (type === 'reportSchedule') {
                updateReportSchedule(id, fields.name, fields.frequency, fields.recipients, fields.reportType);
              } else if (type === 'client') {
                updateClient(id, fields.name, fields.vatNumber || undefined, fields.email || undefined, fields.defaultDepotId || undefined);
              } else if (type === 'palletType') {
                updatePalletType(id, fields.name, fields.description || undefined);
              } else if (type === 'user') {
                updateUser(id, fields.name, fields.email, fields.role, fields.depotIds, fields.username);
              }
              setEditingItem(null);
            }} className="p-5 space-y-4 text-xs">
              
              {editingItem.type === 'depot' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Nome Plant *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Indirizzo</label>
                    <input
                      type="text"
                      value={editingItem.fields.address || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, address: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 relative">
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">CAP</label>
                      <input
                        type="text"
                        value={editingItem.fields.cap || ''}
                        onChange={(e) => handleEditHubCapChange(e.target.value)}
                        onFocus={() => setShowEditHubSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowEditHubSuggestions(false), 200)}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      />
                    </div>
                    <div className="space-y-1 relative">
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Località *</label>
                      <input
                        type="text"
                        value={editingItem.fields.city}
                        onChange={(e) => handleEditHubCityChange(e.target.value)}
                        onFocus={() => setShowEditHubSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowEditHubSuggestions(false), 200)}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                        required
                      />
                      {showEditHubSuggestions && filteredEditHubComuni.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto font-sans text-xs text-white">
                          {filteredEditHubComuni.map((c, i) => (
                            <div
                              key={i}
                              onClick={() => handleSelectEditHubComune(c)}
                              className="px-3 py-2 hover:bg-[#11BCEC]/20 cursor-pointer border-b border-white/5 last:border-b-0 flex justify-between items-center"
                            >
                              <span className="font-bold text-white">{c.comune}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{c.cap} ({c.provincia})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Provincia</label>
                      <input
                        type="text"
                        value={editingItem.fields.province || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          fields: { ...editingItem.fields, province: e.target.value.toUpperCase() }
                        })}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Nazione</label>
                    <input
                      type="text"
                      value={editingItem.fields.country || 'Italia'}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, country: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'warehouseModule' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Plant Stabilimento *</label>
                    <select
                      value={editingItem.fields.depotId}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, depotId: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 text-xs rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    >
                      {depots.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Nome Modulo *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Descrizione Modulo</label>
                    <input
                      type="text"
                      value={editingItem.fields.description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, description: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'bay' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Nome Identificativo Baia *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Modulo Magazzino</label>
                    <select
                      value={editingItem.fields.moduleId || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, moduleId: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 text-xs rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    >
                      <option value="">Nessuno modulo specifico</option>
                      {warehouseModules.filter(m => m.depotId === bays.find(x => x.id === editingItem.id)?.depotId).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Uso Baia / Cliente Ass.</label>
                    <select
                      value={editingItem.fields.bayUsageId || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, bayUsageId: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 text-xs rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    >
                      <option value="">Generico (Nessuno)</option>
                      {bayUsages.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {editingItem.type === 'carrier' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Ragione Sociale Vettore *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">E-mail Contatto *</label>
                    <input
                      type="email"
                      value={editingItem.fields.email}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Partita IVA</label>
                    <input
                      type="text"
                      value={editingItem.fields.vatNumber || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, vatNumber: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Targa Default</label>
                    <input
                      type="text"
                      value={editingItem.fields.licensePlate || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, licensePlate: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'activityType' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Nome Attività *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Codice Identificativo *</label>
                    <input
                      type="text"
                      value={editingItem.fields.code}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, code: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Tempo Base (min) *</label>
                      <input
                        type="number"
                        value={editingItem.fields.baseDurationMinutes}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          fields: { ...editingItem.fields, baseDurationMinutes: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Tempo/Pallet (min) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingItem.fields.minutesPerPallet}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          fields: { ...editingItem.fields, minutesPerPallet: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {editingItem.type === 'reportSchedule' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Nome Pianificazione *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Frequenza Invio *</label>
                    <select
                      value={editingItem.fields.frequency}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, frequency: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 text-xs rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    >
                      <option value="GIORNALIERO">Ogni Giorno alle 22:00</option>
                      <option value="SETTIMANALE">Ogni Lunedì alle 06:00</option>
                      <option value="MENSILE">Il 1° giorno del Mese alle 06:00</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Destinatari Email *</label>
                    <input
                      type="text"
                      value={editingItem.fields.recipients}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, recipients: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Tipo di Report *</label>
                    <select
                      value={editingItem.fields.reportType}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, reportType: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 text-xs rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    >
                      <option value="Saturazione Baie">Report di Saturazione Rampa</option>
                      <option value="Tempi Turnaround">Report Tempi di Permanenza Camion</option>
                      <option value="Esiti Checklist">Report Anomalie & Checklist Fallite</option>
                    </select>
                  </div>
                </>
              )}

              {editingItem.type === 'client' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Ragione Sociale Cliente *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Partita IVA</label>
                    <input
                      type="text"
                      value={editingItem.fields.vatNumber || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, vatNumber: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Email Referente</label>
                    <input
                      type="email"
                      value={editingItem.fields.email || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Hub di Default</label>
                    <select
                      value={editingItem.fields.defaultDepotId || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, defaultDepotId: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    >
                      <option value="">Nessun hub di default</option>
                      {depots.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {editingItem.type === 'palletType' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Sigla / Codice Pallet *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Descrizione</label>
                    <input
                      type="text"
                      value={editingItem.fields.description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, description: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'user' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Nome Completo *</label>
                    <input
                      type="text"
                      value={editingItem.fields.name}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Username *</label>
                    <input
                      type="text"
                      value={editingItem.fields.username}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, username: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">E-mail *</label>
                    <input
                      type="email"
                      value={editingItem.fields.email}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Ruolo *</label>
                    <select
                      value={editingItem.fields.role}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, role: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/20 text-xs rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                      required
                    >
                      <option value="ADMIN">Amministratore</option>
                      <option value="OPERATORE_YARD">Operatore Yard</option>
                      <option value="GUARDIA_CANCELLO">Guardia Cancello</option>
                      <option value="PREPOSTO">Preposto Magazzino</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Stabilimenti Attivi *</label>
                    <div className="bg-slate-900 border border-white/20 rounded-lg p-3 space-y-2 max-h-[120px] overflow-y-auto">
                      {depots.map((d) => {
                        const checked = editingItem.fields.depotIds.includes(d.id);
                        return (
                          <label key={d.id} className="flex items-center space-x-2 text-xs text-white cursor-pointer font-medium">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const newDepotIds = checked
                                  ? editingItem.fields.depotIds.filter((id: string) => id !== d.id)
                                  : [...editingItem.fields.depotIds, d.id];
                                setEditingItem({
                                  ...editingItem,
                                  fields: { ...editingItem.fields, depotIds: newDepotIds }
                                });
                              }}
                              className="rounded border-white/20 text-[#11BCEC] focus:ring-[#11BCEC] cursor-pointer"
                            />
                            <span>{d.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2 bg-slate-950">
                <Button type="button" variant="secondary" className="flex-1 !bg-slate-800 hover:!bg-slate-700 !text-slate-200 !border-white/20" onClick={() => setEditingItem(null)}>Annulla</Button>
                <Button type="submit" className="flex-1 !text-slate-950 font-extrabold hover:!text-white">Salva Modifiche</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
