import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';

import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TabHubs } from '../components/admin/TabHubs';
import { TabCarriers } from '../components/admin/TabCarriers';
import { TabActivities } from '../components/admin/TabActivities';
import { TabAnomalies } from '../components/admin/TabAnomalies';
import { TabReports } from '../components/admin/TabReports';
import { TabUsers } from '../components/admin/TabUsers';
import { TabClients } from '../components/admin/TabClients';
import { TabPalletTypes } from '../components/admin/TabPalletTypes';
import { TabComuni } from '../components/admin/TabComuni';

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
    deleteUser
  } = useApp();

  const [confirmDialogState, setConfirmDialogState] = useState<Omit<React.ComponentProps<typeof ConfirmDialog>, 'onCancel'>>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Conferma',
    isDanger: false,
    isAlert: false,
    onConfirm: () => {}
  });

  const [comuni, setComuni] = useState<any[]>([]);
  useEffect(() => {
    import('../data/territory.json').then((m) => {
      setComuni(m.default);
    }).catch(console.error);
  }, []);

  const [adminTab, setAdminTab] = useState<'hubs' | 'users' | 'carriers' | 'modules' | 'activities' | 'reports' | 'bayusages' | 'anomalies' | 'clients' | 'pallettypes' | 'shipments' | 'comuni'>(defaultTab);

  // Stato Modifica Generale (Edit Modal)
  const [editingItem, setEditingItem] = useState<{
    type: 'depot' | 'warehouseModule' | 'bay' | 'carrier' | 'activityType' | 'reportSchedule' | 'client' | 'palletType' | 'user' | 'comune';
    id: string;
    fields: any;
  } | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Stati Hub
  const [newHubName, setNewHubName] = useState('');
  const [newHubShortCode, setNewHubShortCode] = useState(''); // Sigla
  const [hubFormError, setHubFormError] = useState<string | null>(null);
  const [newHubCity, setNewHubCity] = useState(''); // Località
  const [newHubAddress, setNewHubAddress] = useState('');
  const [newHubCap, setNewHubCap] = useState('');
  const [newHubProvince, setNewHubProvince] = useState('');
  const [newHubCountry, setNewHubCountry] = useState('Italia');
  const [newHubType, setNewHubType] = useState<'HUB' | 'CORRISPONDENTE'>('HUB');

  // Stati Autocomplete
  const [filteredHubComuni, setFilteredHubComuni] = useState<any[]>([]);
  const [showHubSuggestions, setShowHubSuggestions] = useState(false);
  const [filteredEditHubComuni, setFilteredEditHubComuni] = useState<any[]>([]);
  const [showEditHubSuggestions, setShowEditHubSuggestions] = useState(false);

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


  useEffect(() => {
    if (depots.length > 0) {
      const hubs = depots.filter(d => d.type === 'HUB' || !d.type);
      if (!selectedHubForBay && hubs.length > 0) setSelectedHubForBay(hubs[0].id);
      if (!newModHubId && hubs.length > 0) setNewModHubId(hubs[0].id);
    }
  }, [depots, selectedHubForBay, newModHubId]);

  // Form Submits
  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName || !newHubCity || !newHubShortCode) {
      setHubFormError('Compila tutti i campi obbligatori (Nome, Località, Sigla).');
      return;
    }
    if (newHubType === 'CORRISPONDENTE' && (!newHubAddress || !newHubCap || !newHubProvince)) {
      setHubFormError('Per i Corrispondenti è obbligatorio inserire Indirizzo, CAP e Provincia completi.');
      return;
    }
    
    const normalizedShortCode = newHubShortCode.trim().toUpperCase();
    if (depots.some(d => d.shortCode?.toUpperCase() === normalizedShortCode)) {
      setHubFormError(`La sigla "${normalizedShortCode}" è già in uso. Inserisci una sigla univoca.`);
      return;
    }
    
    setHubFormError(null);
    addDepot(newHubName, newHubCity, newHubAddress, newHubCap, newHubProvince, newHubCountry, newHubType, normalizedShortCode);
    setNewHubName('');
    setNewHubShortCode('');
    setNewHubCity('');
    setNewHubAddress('');
    setNewHubCap('');
    setNewHubProvince('');
    setNewHubCountry('Italia');
    setNewHubType('HUB');
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
      setConfirmDialogState({
        isOpen: true,
        title: 'Attenzione',
        message: 'Si prega di inserire Username, Nome, Email e selezionare almeno un impianto logistico.',
        confirmLabel: 'OK',
        isDanger: true,
        onConfirm: () => setConfirmDialogState(prev => ({ ...prev, isOpen: false }))
      });
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
        setConfirmDialogState({ isOpen: true, title: 'Attenzione', message: `Impossibile eliminare lo stabilimento "${name}". Ci sono baie, moduli magazzino, prenotazioni o spedizioni collegate.`, confirmLabel: 'OK', isDanger: true, onConfirm: () => setConfirmDialogState(prev => ({ ...prev, isOpen: false })) });
        return;
      }
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare lo stabilimento "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deleteDepot(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
    }
    // 2. Modulo Magazzino
    if (type === 'warehouseModule') {
      const hasBays = bays.some(b => b.moduleId === id);
      if (hasBays) {
        setConfirmDialogState({ isOpen: true, title: 'Attenzione', message: `Impossibile eliminare il modulo "${name}". Ci sono baie associate.`, confirmLabel: 'OK', isDanger: true, onConfirm: () => setConfirmDialogState(prev => ({ ...prev, isOpen: false })) });
        return;
      }
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare il modulo magazzino "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deleteWarehouseModule(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
    }
    // 3. Baia
    if (type === 'bay') {
      const hasBookings = bookings.some(b => b.bayId === id);
      if (hasBookings) {
        setConfirmDialogState({ isOpen: true, title: 'Attenzione', message: `Impossibile eliminare la baia "${name}". Ci sono prenotazioni collegate.`, confirmLabel: 'OK', isDanger: true, onConfirm: () => setConfirmDialogState(prev => ({ ...prev, isOpen: false })) });
        return;
      }
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare la baia "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deleteBay(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
    }
    // 4. Vettore
    if (type === 'carrier') {
      const hasBookings = bookings.some(b => b.carrierId === id);
      const hasShipments = shipments.some(s => s.carrierId === id);
      if (hasBookings || hasShipments) {
        setConfirmDialogState({ isOpen: true, title: 'Attenzione', message: `Impossibile eliminare il vettore "${name}". Ci sono prenotazioni o spedizioni associate.`, confirmLabel: 'OK', isDanger: true, onConfirm: () => setConfirmDialogState(prev => ({ ...prev, isOpen: false })) });
        return;
      }
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare il vettore "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deleteCarrier(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
    }
    // 5. Tipo Attività
    if (type === 'activityType') {
      const isUsedInBooking = bookings.some(b => b.activityType === name || b.activityType === id);
      const isUsedInShipment = shipments.some(s => s.activityType === name || s.activityType === id);
      if (isUsedInBooking || isUsedInShipment) {
        setConfirmDialogState({ isOpen: true, title: 'Attenzione', message: `Impossibile eliminare l'attività "${name}". È utilizzata in prenotazioni o spedizioni.`, confirmLabel: 'OK', isDanger: true, onConfirm: () => setConfirmDialogState(prev => ({ ...prev, isOpen: false })) });
        return;
      }
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare l'attività "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deleteActivityType(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
    }
    // 6. Report Schedulatore
    if (type === 'reportSchedule') {
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare la pianificazione report "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deleteReportSchedule(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
    }
    // 7. Cliente
    if (type === 'client') {
      const hasBookings = bookings.some(b => b.clientId === id);
      const hasShipments = shipments.some(s => s.clientId === id);
      if (hasBookings || hasShipments) {
        setConfirmDialogState({ isOpen: true, title: 'Attenzione', message: `Impossibile eliminare il cliente "${name}". Ci sono prenotazioni o spedizioni associate.`, confirmLabel: 'OK', isDanger: true, onConfirm: () => setConfirmDialogState(prev => ({ ...prev, isOpen: false })) });
        return;
      }
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare il cliente "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deleteClient(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
    }
    // 8. Tipo Pallet
    if (type === 'palletType') {
      const hasReturns = bookings.some(b => b.palletReturns && b.palletReturns.some(r => r.palletType === name));
      if (hasReturns) {
        setConfirmDialogState({ isOpen: true, title: 'Attenzione', message: `Impossibile eliminare il tipo pallet "${name}". È utilizzato in resi pallet di prenotazioni registrate.`, confirmLabel: 'OK', isDanger: true, onConfirm: () => setConfirmDialogState(prev => ({ ...prev, isOpen: false })) });
        return;
      }
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare il tipo pallet "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deletePalletType(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
    }

    // 9. Utente
    if (type === 'user') {
      if (id === 'user-1' || id === 'user-2' || id === 'user-3') {
        // Prevenzione cancellazione utente sessione corrente se implementato
      }
      setConfirmDialogState({ isOpen: true, title: 'Conferma Eliminazione', message: `Sei sicuro di voler eliminare l'utente "${name}"?`, confirmLabel: 'Elimina', isDanger: true, onConfirm: () => { deleteUser(id); setConfirmDialogState(prev => ({ ...prev, isOpen: false })); } });
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
        <TabHubs
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
          comuni={comuni}
        />
      )}

      {/* --- TAB: VALIDAZIONE VETTORI --- */}
      {adminTab === 'carriers' && (
        <TabCarriers
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      {/* --- TAB: TIPOLOGIE ATTIVITÀ --- */}
      {adminTab === 'activities' && (
        <TabActivities
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      {/* --- TAB: GESTIONE ANOMALIE --- */}
      {adminTab === 'anomalies' && (
        <TabAnomalies
          setActiveResolveAnomalyId={setActiveResolveAnomalyId}
          setResolveNotes={setResolveNotes}
        />
      )}

      {/* --- TAB: SCHEDULATORE REPORT --- */}
      {adminTab === 'reports' && (
        <TabReports
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      {/* --- TAB: UTENTI E PERMESSI --- */}
      {adminTab === 'users' && (
        <TabUsers
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      {/* --- TAB: GESTIONE CLIENTI --- */}
      {adminTab === 'clients' && (
        <TabClients
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      {/* --- TAB: TIPOLOGIE PALLET --- */}
      {adminTab === 'pallettypes' && (
        <TabPalletTypes
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      {/* --- TAB: ANAGRAFICA COMUNI --- */}
      {adminTab === 'comuni' && (
        <TabComuni comuni={comuni} />
      )}

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
                if (!fields.name || !fields.city || !fields.shortCode) {
                  setEditFormError('Compila tutti i campi obbligatori (Nome, Località, Sigla).');
                  return;
                }
                if (fields.type === 'CORRISPONDENTE' && (!fields.address || !fields.cap || !fields.province)) {
                  setEditFormError('Per i Corrispondenti è obbligatorio inserire Indirizzo, CAP e Provincia completi.');
                  return;
                }
                const normalizedShortCode = fields.shortCode?.trim().toUpperCase();
                if (normalizedShortCode && depots.some(d => d.id !== id && d.shortCode?.toUpperCase() === normalizedShortCode)) {
                  setEditFormError(`Questa sigla (${normalizedShortCode}) è già utilizzata da un altro hub.`);
                  return;
                }
                setEditFormError(null);
                updateDepot(id, fields.name, fields.city, fields.address, fields.cap, fields.province, fields.country, fields.type, normalizedShortCode);
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Codice Breve (Sigla) *</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={editingItem.fields.shortCode || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          fields: { ...editingItem.fields, shortCode: e.target.value.toUpperCase() }
                        })}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">Tipologia Nodo *</label>
                      <select
                        value={editingItem.fields.type || 'HUB'}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          fields: { ...editingItem.fields, type: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#11BCEC]"
                        required
                      >
                        <option value="HUB">HUB Interno</option>
                        <option value="CORRISPONDENTE">Corrispondente Esterno</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">
                      Indirizzo{editingItem.fields.type === 'CORRISPONDENTE' ? ' *' : ''}
                    </label>
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
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">
                        CAP{editingItem.fields.type === 'CORRISPONDENTE' ? ' *' : ''}
                      </label>
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
                      <label className="block text-slate-300 font-bold uppercase font-mono tracking-wider text-[10px]">
                        Provincia{editingItem.fields.type === 'CORRISPONDENTE' ? ' *' : ''}
                      </label>
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
              
              {editFormError && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-xs font-bold border border-red-500/50 mt-2">
                  {editFormError}
                </div>
              )}

              <div className="flex gap-2 pt-2 bg-slate-950">
                <Button type="button" variant="secondary" className="flex-1 !bg-slate-800 hover:!bg-slate-700 !text-slate-200 !border-white/20" onClick={() => setEditingItem(null)}>Annulla</Button>
                <Button type="submit" className="flex-1 !text-slate-950 font-extrabold hover:!text-white">Salva Modifiche</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmDialog 
        {...confirmDialogState} 
        onCancel={() => setConfirmDialogState(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};
