import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Depot, Bay, Carrier, Booking, ActivityLog, WarehouseModule, ActivityType, ReportSchedule, User, BookingNote, QualityChecklist, ChecklistFailureAlert, BayUsage, AnomalyLog, Client, PalletType, Shipment, ComuneItaliano, SystemParameter } from '../types';

interface AppContextType {
  depots: Depot[];
  warehouseModules: WarehouseModule[];
  bays: Bay[];
  carriers: Carrier[];
  bookings: Booking[];
  activityLogs: ActivityLog[];
  activityTypes: ActivityType[];
  reportSchedules: ReportSchedule[];
  checklistAlerts: ChecklistFailureAlert[];
  bayUsages: BayUsage[];
  anomalies: AnomalyLog[];
  comuni: ComuneItaliano[];
  systemParameters: SystemParameter[];
  currentRole: 'ADMIN' | 'GUARDIA' | 'VETTORE' | 'PREPOSTO' | null;
  currentUser: User | null;
  currentCarrierId: string;
  selectedDepotId: string;
  addDepot: (name: string, city: string, address?: string, cap?: string, province?: string, country?: string, type?: 'HUB' | 'CORRISPONDENTE') => void;
  updateDepot: (id: string, name: string, city: string, address?: string, cap?: string, province?: string, country?: string, type?: 'HUB' | 'CORRISPONDENTE') => void;
  deleteDepot: (id: string) => void;
  addWarehouseModule: (depotId: string, name: string, description?: string) => void;
  updateWarehouseModule: (id: string, depotId: string, name: string, description?: string) => void;
  deleteWarehouseModule: (id: string) => void;
  addBay: (depotId: string, name: string, moduleId?: string, bayUsageId?: string) => void;
  updateBay: (id: string, name: string, moduleId?: string, bayUsageId?: string) => void;
  deleteBay: (id: string) => void;
  updateBayStatus: (bayId: string, status: 'DISPONIBILE' | 'OCCUPATA' | 'MANUTENZIONE') => void;
  updateBayUsage: (bayId: string, bayUsageId?: string) => void;
  addBayUsage: (name: string, description?: string) => void;
  deleteBayUsage: (id: string) => void;
  addCarrier: (name: string, email: string, vatNumber?: string, licensePlate?: string, licensePlateTrailer?: string) => void;
  registerCarrier: (name: string, email: string, vatNumber?: string, licensePlate?: string) => void;
  approveCarrier: (carrierId: string) => void;
  rejectCarrier: (carrierId: string) => void;
  updateCarrier: (id: string, name: string, email: string, vatNumber?: string, licensePlate?: string) => void;
  deleteCarrier: (id: string) => void;
  updateCarrierProfile: (id: string, email: string, licensePlate?: string, phone?: string, licensePlateTrailer?: string) => void;
  addBooking: (
    depotId: string,
    date: string,
    activityType: string,
    licensePlate: string,
    driverName: string,
    driverPhone?: string,
    notes?: string,
    palletPlaces?: number,
    driverLicense?: string,
    driverLicenseRelease?: string,
    orderNumber?: string,
    clientUsageId?: string,
    licensePlateTrailer?: string,
    driverLicenseExpiry?: string,
    orderNumber2?: string
  ) => string;
  updateBookingStatus: (
    bookingId: string,
    status: Booking['status'],
    bayId?: string,
    extra?: { driverPhone?: string; notes?: string; driverLicense?: string; driverLicenseRelease?: string; orderNumber?: string; clientUsageId?: string; licensePlateTrailer?: string; driverLicenseExpiry?: string; orderNumber2?: string }
  ) => void;
  updateBookingDetails: (
    bookingId: string,
    updates: { activityType?: string; notes?: string; driverPhone?: string; palletPlaces?: number; driverLicense?: string; driverLicenseRelease?: string; orderNumber?: string; clientUsageId?: string; licensePlateTrailer?: string; driverLicenseExpiry?: string; orderNumber2?: string }
  ) => void;
  relocateBookingBay: (bookingId: string, newBayId: string, reason: string) => void;
  addBookingNote: (bookingId: string, text: string) => void;
  saveQualityChecklist: (
    bookingId: string,
    checklistData: {
      pianaleSporco: boolean;
      presenzaInfestantiMezzo: boolean;
      odoriAnomali: boolean;
      puliziaPallet: boolean;
      integritaPallet: boolean;
      presenzaInfestantiProdotto: boolean;
      presenzaBio: boolean;
      noteLibere?: string;
      sigilloPresente: boolean;
      numeroSigillo?: string;
      corrispondenzaDdt: boolean;
      noteSigillo?: string;
    }
  ) => void;
  resolveChecklistAlert: (alertId: string, action: 'PROCEDI' | 'RESPINTO', reason?: string) => void;
  addActivityType: (name: string, code: string, baseDurationMinutes: number, minutesPerPallet: number) => void;
  updateActivityType: (id: string, name: string, code: string, baseDurationMinutes: number, minutesPerPallet: number) => void;
  deleteActivityType: (id: string) => void;
  addReportSchedule: (name: string, frequency: ReportSchedule['frequency'], recipients: string, reportType: string) => void;
  updateReportSchedule: (id: string, name: string, frequency: ReportSchedule['frequency'], recipients: string, reportType: string) => void;
  deleteReportSchedule: (id: string) => void;
  toggleReportSchedule: (id: string) => void;
  addAnomaly: (depotId: string, type: AnomalyLog['type'], message: string, bookingId?: string, ticketNumber?: string, licensePlate?: string) => void;
  resolveAnomaly: (anomalyId: string, notes: string) => void;
  addPalletReturn: (bookingId: string, palletType: string, quantity: number, condition: 'BUONO' | 'ROTTO') => void;
  removePalletReturn: (bookingId: string, returnId: string) => void;
  emitPalletVoucher: (bookingId: string) => void;
  setCurrentRole: (role: 'ADMIN' | 'GUARDIA' | 'VETTORE' | 'PREPOSTO' | null) => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentCarrierId: (carrierId: string) => void;
  setSelectedDepotId: (depotId: string) => void;
  resetState: () => void;
  clients: Client[];
  palletTypes: PalletType[];
  users: User[];
  shipments: Shipment[];
  addClient: (name: string, vatNumber?: string, email?: string, defaultDepotId?: string) => void;
  updateClient: (id: string, name: string, vatNumber?: string, email?: string, defaultDepotId?: string) => void;
  deleteClient: (id: string) => void;
  addComune: (comune: string, cap: string, provincia: string) => void;
  updateComune: (originalComune: string, originalCap: string, comune: string, cap: string, provincia: string) => void;
  deleteComune: (comune: string, cap: string) => void;
  addPalletType: (name: string, description?: string) => void;
  updatePalletType: (id: string, name: string, description?: string) => void;
  deletePalletType: (id: string) => void;
  addUser: (name: string, email: string, role: User['role'], depotIds: string[], username: string) => void;
  updateUser: (id: string, name: string, email: string, role: User['role'], depotIds: string[], username: string) => void;
  updateUserRole: (id: string, role: User['role']) => void;
  deleteUser: (id: string) => void;
  confirmUserEmail: (userId: string) => void;
  setUserPassword: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  simulatedEmails: { userId: string; userName: string; userEmail: string; confirmLink: string }[];
  clearSimulatedEmail: (userId: string) => void;
  addShipment: (shipment: Omit<Shipment, 'id' | 'status'>) => void;
  updateShipmentStatus: (id: string, status: Shipment['status']) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  deleteShipments: (ids: string[]) => void;
  bindShipmentsToBooking: (shipmentIds: string[], bookingId: string) => void;
  unbindShipmentFromBooking: (shipmentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yard_management_system_state_v6';

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- DATI DI DEFAULT ---
  const defaultDepots: Depot[] = [
    { id: 'depot-milano', name: 'Milano Logistics Plant', city: 'Milano (MI)', type: 'HUB', address: 'Via Roma 1', cap: '20100', province: 'MI' },
    { id: 'depot-roma', name: 'Roma Logistics Plant', city: 'Roma (RM)', type: 'HUB', address: 'Via del Corso 2', cap: '00100', province: 'RM' },
    { id: 'depot-bari', name: 'Bari Logistics Plant', city: 'Bari (BA)', type: 'HUB', address: 'Via Bari 3', cap: '70100', province: 'BA' },
    { id: 'corr-torino', name: 'Corrispondente Nord-Ovest SRL', city: 'Torino (TO)', type: 'CORRISPONDENTE', address: 'Strada del Drosso 4', cap: '10135', province: 'TO' },
    { id: 'corr-napoli', name: 'Partenope Trasporti', city: 'Napoli (NA)', type: 'CORRISPONDENTE', address: 'Via Galileo Ferraris 5', cap: '80142', province: 'NA' },
  ];

  const defaultWarehouseModules: WarehouseModule[] = [
    { id: 'module-m-1', depotId: 'depot-milano', name: 'Modulo A (Secco)' },
    { id: 'module-m-2', depotId: 'depot-milano', name: 'Modulo B (Fresco)' },
    { id: 'module-r-1', depotId: 'depot-roma', name: 'Modulo Unico' },
    { id: 'module-b-1', depotId: 'depot-bari', name: 'Modulo Est' },
  ];

  const defaultBayUsages: BayUsage[] = [
    { id: 'bu-1', name: 'Crossdocking', description: 'Transiti rapidi e smistamento' },
    { id: 'bu-2', name: 'Acqua / Bevande', description: 'Attracco preferenziale carichi pesanti di liquidi' },
    { id: 'bu-3', name: 'Pallet vuoti', description: 'Stoccaggio e scarico rulliere pallet vuoti' },
    { id: 'bu-4', name: 'Cliente Rossi', description: 'Rampa riservata spedizioni Cliente Rossi SpA' },
  ];

  const defaultBays: Bay[] = [
    // Milano
    { id: 'bay-m-01', depotId: 'depot-milano', moduleId: 'module-m-1', name: 'Baia M-01 (Dry)', status: 'DISPONIBILE', bayUsageId: 'bu-1' },
    { id: 'bay-m-02', depotId: 'depot-milano', moduleId: 'module-m-1', name: 'Baia M-02 (Dry)', status: 'DISPONIBILE', bayUsageId: 'bu-4' },
    { id: 'bay-m-03', depotId: 'depot-milano', moduleId: 'module-m-2', name: 'Baia M-03 (Cold)', status: 'DISPONIBILE', bayUsageId: 'bu-2' },
    { id: 'bay-m-04', depotId: 'depot-milano', moduleId: 'module-m-2', name: 'Baia M-04 (Cold)', status: 'DISPONIBILE', bayUsageId: 'bu-3' },
    // Roma
    { id: 'bay-r-01', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-01', status: 'OCCUPATA', currentBookingId: 'book-roma-active' },
    { id: 'bay-r-02', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-02', status: 'DISPONIBILE' },
    { id: 'bay-r-03', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-03', status: 'DISPONIBILE' },
    { id: 'bay-r-04', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-04', status: 'MANUTENZIONE' },
    // Bari
    { id: 'bay-b-01', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-01', status: 'DISPONIBILE' },
    { id: 'bay-b-02', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-02', status: 'DISPONIBILE' },
    { id: 'bay-b-03', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-03', status: 'DISPONIBILE' },
  ];

  const defaultCarriers: Carrier[] = [
    { id: 'carrier-1', name: 'Logistica Uno Europe', email: 'info@logisticauno.com', status: 'APPROVATO', licensePlate: 'AA123BB', vatNumber: 'IT12345678901' },
    { id: 'carrier-2', name: 'Freccia Rossa Trasporti', email: 'operations@frecciarossa.it', status: 'APPROVATO', licensePlate: 'CC456DD', vatNumber: 'IT98765432109' },
    { id: 'carrier-3', name: 'Adriatica Cargo Srl', email: 'logistic@adriaticacargo.it', status: 'ATTESA_APPROVAZIONE', licensePlate: 'EE789FF', vatNumber: 'IT11112222333' },
    { id: 'carrier-4', name: 'Euro Shipping Spedizioni', email: 'book@euroshipping.com', status: 'ATTESA_APPROVAZIONE', vatNumber: 'IT44445555666' },
  ];

  const defaultActivityTypes: ActivityType[] = [
    { id: 'act-1', name: 'Scarico Standard', code: 'SCARICO', baseDurationMinutes: 15, minutesPerPallet: 1.0 },
    { id: 'act-2', name: 'Carico Standard', code: 'CARICO', baseDurationMinutes: 20, minutesPerPallet: 1.5 },
    { id: 'act-3', name: 'Reso Fornitore', code: 'RESO', baseDurationMinutes: 10, minutesPerPallet: 1.0 },
  ];

  const defaultReportSchedules: ReportSchedule[] = [
    { id: 'rep-1', name: 'Saturazione Giornaliera Baie', frequency: 'GIORNALIERO', recipients: 'milano.ops@logisticauno.it', reportType: 'Saturazione Baie', active: true },
    { id: 'rep-2', name: 'Performance Tempi Turnaround Vettori', frequency: 'SETTIMANALE', recipients: 'direzione.logistica@logisticauno.it', reportType: 'Tempi Turnaround', active: true }
  ];

  const today = getTodayDateString();

  const defaultBookings: Booking[] = [
    {
      id: 'book-milano-1',
      carrierId: 'carrier-1',
      depotId: 'depot-milano',
      date: today,
      activityType: 'CARICO',
      status: 'PRENOTATO',
      licensePlate: 'AA123BB',
      licensePlateTrailer: 'AA777XX',
      driverName: 'Marco Rossi',
      driverPhone: '+39 347 1234567',
      palletPlaces: 24,
      ticketNumber: 'MIL-C-392',
      notes: 'Carico urgente merci secche',
      orderNumber: 'ORD-2026-9923',
      orderNumber2: 'ORD-2026-9924',
      driverLicense: 'U19283748A',
      driverLicenseRelease: '2024-05-12',
      driverLicenseExpiry: '2028-05-12', // Not expired
      clientUsageId: 'bu-4',
      notesHistory: [
        { id: 'n-init-1', timestamp: new Date(new Date().setHours(new Date().getHours() - 10)).toISOString(), author: 'Vettore Logistica', text: 'Carico urgente merci secche' }
      ]
    },
    {
      id: 'book-milano-2',
      carrierId: 'carrier-2',
      depotId: 'depot-milano',
      date: today,
      activityType: 'SCARICO',
      status: 'AL_CANCELLO',
      licensePlate: 'CC456DD',
      driverName: 'Giuseppe Bianchi',
      driverPhone: '+39 333 9876543',
      palletPlaces: 12,
      ticketNumber: 'MIL-S-712',
      notes: 'Carico fresco',
      orderNumber: 'ORD-2026-8811',
      driverLicense: 'Y99882233B',
      driverLicenseRelease: '2015-02-10',
      driverLicenseExpiry: '2025-02-10', // Expired!
      clientUsageId: 'bu-2',
      notesHistory: [
        { id: 'n-init-2', timestamp: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(), author: 'Autista', text: 'Carico fresco' }
      ],
      timeInGate: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(),
    },
    {
      id: 'book-roma-active',
      carrierId: 'carrier-1',
      depotId: 'depot-roma',
      date: today,
      activityType: 'SCARICO',
      status: 'IN_BAIA',
      bayId: 'bay-r-01',
      licensePlate: 'EE789FF',
      driverName: 'Luca Verdi',
      driverPhone: '+39 320 1122334',
      palletPlaces: 33,
      ticketNumber: 'ROM-S-209',
      orderNumber: 'ORD-2026-4433',
      notes: 'Richiesta sponda',
      notesHistory: [
        { id: 'n-init-3', timestamp: new Date(new Date().setHours(new Date().getHours() - 6)).toISOString(), author: 'Vettore', text: 'Richiesta sponda' }
      ],
      timeInGate: new Date(new Date().setHours(new Date().getHours() - 3)).toISOString(),
      timeInBay: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), // 2 hours docked! With 33 plt limit is 15 + 33*1 = 48 mins. Sforato!
    },
  ];

  const defaultUsers: User[] = [
    { id: 'user-1', name: 'Alessandro Neri', username: 'admin', email: 'a.neri@logisticauno.it', role: 'ADMIN', depotId: 'depot-milano', depotIds: ['depot-milano', 'depot-roma', 'depot-bari'], password: 'Password123!', status: 'ACTIVE' },
    { id: 'user-2', name: 'Fabio Gialli', username: 'f.gialli', email: 'f.gialli@logisticauno.it', role: 'GUARDIA_CANCELLO', depotId: 'depot-milano', depotIds: ['depot-milano'], password: 'Password123!', status: 'ACTIVE' },
    { id: 'user-3', name: 'Roberto Verdi', username: 'r.verdi', email: 'r.verdi@logisticauno.it', role: 'OPERATORE_YARD', depotId: 'depot-roma', depotIds: ['depot-roma'], password: 'Password123!', status: 'ACTIVE' },
    { id: 'user-4', name: 'Sara Rossi', username: 's.rossi', email: 's.rossi@logisticauno.it', role: 'GUARDIA_CANCELLO', depotId: 'depot-bari', depotIds: ['depot-bari'], password: 'Password123!', status: 'ACTIVE' },
    { id: 'user-5', name: 'Filippo Marroni', username: 'f.marroni', email: 'f.marroni@logisticauno.it', role: 'PREPOSTO', depotId: 'depot-milano', depotIds: ['depot-milano'], password: 'Password123!', status: 'ACTIVE' },
  ];

  const defaultClients: Client[] = [
    { id: 'client-rossi', name: 'Rossi SpA', vatNumber: 'IT01234567890', email: 'logistica@rossi.it' },
    { id: 'client-bianchi', name: 'Bianchi Srl', vatNumber: 'IT09876543210', email: 'ordini@bianchi.it' },
    { id: 'client-verdi', name: 'Verdi Group', vatNumber: 'IT05554443322', email: 'shipments@verdigroup.it' },
  ];

  const defaultPalletTypes: PalletType[] = [
    { id: 'plt-epal', name: 'EPAL', description: 'Pallet standard europeo (80x120)' },
    { id: 'plt-chep', name: 'CHEP', description: 'Pallet blu a noleggio (80x120)' },
    { id: 'plt-duss', name: 'DUSSELDORF', description: 'Mezzo pallet (60x80)' },
    { id: 'plt-miniduss', name: 'MINI-DUSS', description: 'Mini pallet plastificato o legno' },
    { id: 'plt-altro', name: 'ALTRO', description: 'Altre tipologie di legni' },
  ];

  const defaultLogs: ActivityLog[] = [
    { id: 'log-1', timestamp: new Date(new Date().setHours(new Date().getHours() - 5)).toISOString(), depotId: 'depot-milano', message: 'Sistema caricato con successo.', type: 'INFO' }
  ];

  // --- STATO INIZIALIZZATO CON FALLBACK DEFAULT ---
  const [depots, setDepots] = useState<Depot[]>(defaultDepots);
  const [warehouseModules, setWarehouseModules] = useState<WarehouseModule[]>(defaultWarehouseModules);
  const [bays, setBays] = useState<Bay[]>(defaultBays);
  const [carriers, setCarriers] = useState<Carrier[]>(defaultCarriers);
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(defaultLogs);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(defaultActivityTypes);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>(defaultReportSchedules);
  const [checklistAlerts, setChecklistAlerts] = useState<ChecklistFailureAlert[]>([]);
  const [bayUsages, setBayUsages] = useState<BayUsage[]>(defaultBayUsages);
  
  // Anomalie
  const [anomalies, setAnomalies] = useState<AnomalyLog[]>([]);
  const [clients, setClients] = useState<Client[]>(defaultClients);
  const [palletTypes, setPalletTypes] = useState<PalletType[]>(defaultPalletTypes);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [comuni, setComuni] = useState<ComuneItaliano[]>([]);
  const [systemParameters, setSystemParameters] = useState<SystemParameter[]>([]);
  const [simulatedEmails, setSimulatedEmails] = useState<{ userId: string; userName: string; userEmail: string; confirmLink: string }[]>([]);

  const clearSimulatedEmail = (userId: string) => {
    setSimulatedEmails((prev) => prev.filter((e) => e.userId !== userId));
  };

  // Stati di sessione
  const [currentRole, setCurrentRole] = useState<'ADMIN' | 'GUARDIA' | 'VETTORE' | 'PREPOSTO' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCarrierId, setCurrentCarrierId] = useState<string>('');
  const [selectedDepotId, setSelectedDepotId] = useState<string>('depot-milano');

  // Helper per inviare le modifiche al database serverless
  const saveAction = async (action: string, payload: any) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
    } catch (err) {
      console.error(`Errore invio azione ${action} al DB:`, err);
    }
  };

  // Caricamento iniziale dal Database Postgres di Vercel
  useEffect(() => {
    const loadDbData = async () => {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Database request failed');
        const data = await res.json();
        if (data.depots && data.depots.length > 0) setDepots(data.depots);
        if (data.warehouseModules && data.warehouseModules.length > 0) setWarehouseModules(data.warehouseModules);
        if (data.bayUsages && data.bayUsages.length > 0) setBayUsages(data.bayUsages);
        if (data.bays && data.bays.length > 0) setBays(data.bays);
        if (data.carriers && data.carriers.length > 0) setCarriers(data.carriers);
        if (data.bookings && data.bookings.length > 0) setBookings(data.bookings);
        if (data.anomalies) setAnomalies(data.anomalies);
        if (data.activityLogs && data.activityLogs.length > 0) setActivityLogs(data.activityLogs);
        if (data.activityTypes && data.activityTypes.length > 0) setActivityTypes(data.activityTypes);
        if (data.reportSchedules && data.reportSchedules.length > 0) setReportSchedules(data.reportSchedules);
        if (data.clients && data.clients.length > 0) setClients(data.clients);
        if (data.palletTypes && data.palletTypes.length > 0) setPalletTypes(data.palletTypes);
        if (data.users && data.users.length > 0) setUsers(data.users);
        if (data.shipments) setShipments(data.shipments);
        if (data.comuni) setComuni(data.comuni);
        if (data.systemParameters) setSystemParameters(data.systemParameters);
      } catch (err) {
        console.error('Errore durante il caricamento dal database:', err);
      }
    };
    loadDbData();

    // Carica le preferenze locali del browser da localStorage
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.currentRole !== undefined) setCurrentRole(parsed.currentRole);
        if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
        if (parsed.currentCarrierId !== undefined) setCurrentCarrierId(parsed.currentCarrierId);
        if (parsed.selectedDepotId !== undefined) setSelectedDepotId(parsed.selectedDepotId);
      } catch (e) {
        console.error('Errore nel caricamento delle preferenze locali', e);
      }
    }
  }, []);

  // Salvataggio preferenze locali su LocalStorage
  useEffect(() => {
    const stateToSave = {
      currentRole,
      currentUser,
      currentCarrierId,
      selectedDepotId,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [currentRole, currentUser, currentCarrierId, selectedDepotId]);

  // --- OPERAZIONI DI LOG ---
  const logActivity = (depotId: string, message: string, type: ActivityLog['type'] = 'INFO') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      depotId,
      message,
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    saveAction('ADD_LOG', newLog);
  };

  // --- GESTIONE ANOMALIE ---
  const addAnomaly = (
    depotId: string,
    type: AnomalyLog['type'],
    message: string,
    bookingId?: string,
    ticketNumber?: string,
    licensePlate?: string
  ) => {
    // Evitiamo duplicazione per lo stesso booking dello stesso tipo se già attiva
    const isAlreadyPresent = anomalies.some(
      (an) => an.bookingId === bookingId && an.type === type && !an.resolved
    );
    if (isAlreadyPresent && type !== 'SFORAMENTO_TEMPO') return; // Sforamento tempo ricalcola/aggiorna

    const newAnomaly: AnomalyLog = {
      id: `an-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      depotId,
      bookingId,
      ticketNumber,
      licensePlate,
      type,
      message,
      resolved: false,
    };

    setAnomalies((prev) => [newAnomaly, ...prev]);
    logActivity(depotId, `🚨 ANOMALIA REGISTRATA: [${type}] ${message}`, 'WARNING');
    saveAction('ADD_ANOMALY', newAnomaly);
  };

  const resolveAnomaly = (anomalyId: string, notes: string) => {
    const resolverName = currentUser?.name || (currentRole === 'GUARDIA' ? 'Guardiola' : 'Amministratore');
    setAnomalies((prev) =>
      prev.map((a) => {
        if (a.id === anomalyId) {
          return {
            ...a,
            resolved: true,
            resolutionNotes: notes,
            resolvedBy: resolverName,
            resolvedAt: new Date().toISOString(),
          };
        }
        return a;
      })
    );
    
    const anomaly = anomalies.find((a) => a.id === anomalyId);
    if (anomaly) {
      logActivity(anomaly.depotId, `Risolta anomalia ${anomaly.type} per targa ${anomaly.licensePlate || 'N/D'} da ${resolverName}. Note: ${notes}`, 'SUCCESS');
    }
    saveAction('RESOLVE_ANOMALY', { id: anomalyId, resolutionNotes: notes, resolvedBy: resolverName, resolvedAt: new Date().toISOString() });
  };

  const addPalletReturn = (
    bookingId: string,
    palletType: string,
    quantity: number,
    condition: 'BUONO' | 'ROTTO'
  ) => {
    const newReturn = {
      id: `return-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      palletType,
      quantity,
      condition,
    };

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const returns = b.palletReturns ? [...b.palletReturns, newReturn] : [newReturn];
          return {
            ...b,
            palletReturns: returns,
          };
        }
        return b;
      })
    );

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      logActivity(
        booking.depotId,
        `Registrato reso pallet vuoto su veicolo ${booking.licensePlate}: ${quantity} ${palletType} (${condition}).`,
        'INFO'
      );
      // Trova l'array aggiornato per inviarlo
      const currentB = bookings.find(b => b.id === bookingId);
      if (currentB) {
        const updatedReturns = currentB.palletReturns ? [...currentB.palletReturns, newReturn] : [newReturn];
        saveAction('ADD_PALLET_RETURN', { bookingId, palletReturns: updatedReturns });
      } else {
        saveAction('ADD_PALLET_RETURN', { bookingId, palletReturns: [newReturn] });
      }
    }
  };

  const removePalletReturn = (bookingId: string, returnId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            palletReturns: b.palletReturns ? b.palletReturns.filter((r) => r.id !== returnId) : [],
          };
        }
        return b;
      })
    );

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      logActivity(
        booking.depotId,
        `Rimosso reso pallet vuoto (ID: ${returnId}) per veicolo ${booking.licensePlate}.`,
        'INFO'
      );
      const currentB = bookings.find(b => b.id === bookingId);
      if (currentB) {
        const updatedReturns = currentB.palletReturns ? currentB.palletReturns.filter(r => r.id !== returnId) : [];
        saveAction('ADD_PALLET_RETURN', { bookingId, palletReturns: updatedReturns });
      }
    }
  };

  const emitPalletVoucher = (bookingId: string) => {
    const randomVoucherNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = depots.find((d) => d.id === selectedDepotId)?.name?.substring(0, 3).toUpperCase() || 'PLT';
    const voucherNumber = `BPA-${prefix}-${randomVoucherNum}`;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            palletVoucherNumber: voucherNumber,
          };
        }
        return b;
      })
    );

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      logActivity(
        booking.depotId,
        `Emesso Buono Pallet n. ${voucherNumber} per veicolo ${booking.licensePlate}.`,
        'SUCCESS'
      );
      saveAction('EMIT_PALLET_VOUCHER', { bookingId, palletVoucherNumber: voucherNumber });
    }
  };

  // --- AZIONI CONFIGURAZIONE / ADMIN ---
  const addDepot = (name: string, city: string, address?: string, cap?: string, province?: string, country?: string, type: 'HUB' | 'CORRISPONDENTE' = 'HUB') => {
    const id = `depot-${Date.now()}`;
    const newDepot: Depot = { id, name, city, address, cap, province, country, type };
    setDepots((prev) => [...prev, newDepot]);
    logActivity(id, `Creato nuovo stabilimento/nodo: ${name} (${city})`, 'SUCCESS');
    saveAction('ADD_DEPOT', newDepot);
  };

  const updateDepot = (id: string, name: string, city: string, address?: string, cap?: string, province?: string, country?: string, type: 'HUB' | 'CORRISPONDENTE' = 'HUB') => {
    setDepots((prev) => prev.map((d) => (d.id === id ? { ...d, name, city, address, cap, province, country, type } : d)));
    logActivity(selectedDepotId, `Aggiornato nodo: ${name} (${city})`, 'INFO');
    saveAction('UPDATE_DEPOT', { id, name, city, address, cap, province, country });
  };

  const deleteDepot = (id: string) => {
    setDepots((prev) => prev.filter((d) => d.id !== id));
    logActivity(selectedDepotId, `Eliminato stabilimento con ID: ${id}`, 'WARNING');
    saveAction('DELETE_DEPOT', { id });
  };

  const addWarehouseModule = (depotId: string, name: string, description?: string) => {
    const id = `module-${Date.now()}`;
    const newModule: WarehouseModule = { id, depotId, name, description };
    setWarehouseModules((prev) => [...prev, newModule]);
    logActivity(depotId, `Creato nuovo modulo di magazzino: ${name}`, 'SUCCESS');
    saveAction('ADD_WAREHOUSE_MODULE', newModule);
  };

  const updateWarehouseModule = (id: string, depotId: string, name: string, description?: string) => {
    setWarehouseModules((prev) => prev.map((m) => (m.id === id ? { ...m, depotId, name, description } : m)));
    logActivity(depotId, `Aggiornato modulo magazzino: ${name}`, 'INFO');
    saveAction('UPDATE_WAREHOUSE_MODULE', { id, depotId, name, description });
  };

  const deleteWarehouseModule = (id: string) => {
    setWarehouseModules((prev) => prev.filter((m) => m.id !== id));
    logActivity(selectedDepotId, `Eliminato modulo magazzino con ID: ${id}`, 'WARNING');
    saveAction('DELETE_WAREHOUSE_MODULE', { id });
  };

  const addBay = (depotId: string, name: string, moduleId?: string, bayUsageId?: string) => {
    const id = `bay-${Date.now()}`;
    const newBay: Bay = { id, depotId, moduleId, name, status: 'DISPONIBILE', bayUsageId };
    setBays((prev) => [...prev, newBay]);
    logActivity(depotId, `Aggiunta nuova baia: ${name}`, 'SUCCESS');
    saveAction('ADD_BAY', newBay);
  };

  const updateBay = (id: string, name: string, moduleId?: string, bayUsageId?: string) => {
    setBays((prev) => prev.map((b) => (b.id === id ? { ...b, name, moduleId, bayUsageId } : b)));
    logActivity(selectedDepotId, `Aggiornata baia: ${name}`, 'INFO');
    saveAction('UPDATE_BAY', { id, name, moduleId, bayUsageId });
  };

  const deleteBay = (id: string) => {
    setBays((prev) => prev.filter((b) => b.id !== id));
    logActivity(selectedDepotId, `Eliminata baia con ID: ${id}`, 'WARNING');
    saveAction('DELETE_BAY', { id });
  };

  const updateBayStatus = (bayId: string, status: Bay['status']) => {
    setBays((prev) =>
      prev.map((b) => {
        const updatedBay = { ...b, status };
        if (b.id === bayId) {
          if (status === 'MANUTENZIONE') {
            updatedBay.currentBookingId = undefined;
          }
          return updatedBay;
        }
        return b;
      })
    );
    const targetBay = bays.find((b) => b.id === bayId);
    if (targetBay) {
      logActivity(targetBay.depotId, `Stato della baia ${targetBay.name} modificato in: ${status}`, status === 'MANUTENZIONE' ? 'WARNING' : 'INFO');
    }
    const currentBookingId = status === 'MANUTENZIONE' ? null : (bays.find(b => b.id === bayId)?.currentBookingId);
    saveAction('UPDATE_BAY_STATUS', { id: bayId, status, currentBookingId });
  };

  const updateBayUsage = (bayId: string, bayUsageId?: string) => {
    setBays((prev) =>
      prev.map((b) => (b.id === bayId ? { ...b, bayUsageId } : b))
    );
    const targetBay = bays.find((b) => b.id === bayId);
    if (targetBay) {
      logActivity(targetBay.depotId, `Aggiornato uso baia per ${targetBay.name}`, 'INFO');
    }
    saveAction('UPDATE_BAY_USAGE', { id: bayId, usageId: bayUsageId });
  };

  const addBayUsage = (name: string, description?: string) => {
    const id = `bu-${Date.now()}`;
    const newUsage: BayUsage = { id, name, description };
    setBayUsages((prev) => [...prev, newUsage]);
    logActivity(selectedDepotId, `Creato nuovo Uso Baia: ${name}`, 'SUCCESS');
    saveAction('ADD_BAY_USAGE', newUsage);
  };

  const deleteBayUsage = (id: string) => {
    setBayUsages((prev) => prev.filter((bu) => bu.id !== id));
    setBays((prevBays) =>
      prevBays.map((b) => (b.bayUsageId === id ? { ...b, bayUsageId: undefined } : b))
    );
    setBookings((prevBookings) =>
      prevBookings.map((b) => (b.clientUsageId === id ? { ...b, clientUsageId: undefined } : b))
    );
    logActivity(selectedDepotId, `Eliminato Uso Baia: ${id}`, 'WARNING');
    saveAction('DELETE_BAY_USAGE', { id });
  };

  // --- AZIONI VETTORI ---
  const addCarrier = (name: string, email: string, vatNumber?: string, licensePlate?: string, licensePlateTrailer?: string) => {
    const id = `carrier-${Date.now()}`;
    const cleanPlate = licensePlate ? licensePlate.replace(/\s+/g, '').toUpperCase() : undefined;
    const cleanTrailer = licensePlateTrailer ? licensePlateTrailer.replace(/\s+/g, '').toUpperCase() : undefined;
    
    const newCarrier: Carrier = {
      id,
      name,
      email,
      status: 'APPROVATO',
      vatNumber,
      licensePlate: cleanPlate,
      licensePlateTrailer: cleanTrailer,
    };
    setCarriers((prev) => [...prev, newCarrier]);
    logActivity(selectedDepotId, `Creato anagrafica vettore da Admin: ${name}`, 'SUCCESS');
    saveAction('ADD_CARRIER', newCarrier);
  };

  const registerCarrier = (name: string, email: string, vatNumber?: string, licensePlate?: string) => {
    const id = `carrier-${Date.now()}`;
    const cleanPlate = licensePlate ? licensePlate.replace(/\s+/g, '').toUpperCase() : undefined;
    
    const newCarrier: Carrier = {
      id,
      name,
      email,
      status: 'ATTESA_APPROVAZIONE',
      vatNumber,
      licensePlate: cleanPlate,
    };
    setCarriers((prev) => [...prev, newCarrier]);
    saveAction('ADD_CARRIER', newCarrier);
  };

  const approveCarrier = (carrierId: string) => {
    setCarriers((prev) =>
      prev.map((c) => (c.id === carrierId ? { ...c, status: 'APPROVATO' as const } : c))
    );
    const carrier = carriers.find((c) => c.id === carrierId);
    if (carrier) {
      logActivity(selectedDepotId, `Approvato vettore: ${carrier.name}. Generata abilitazione all'accesso.`, 'SUCCESS');
    }
    saveAction('APPROVE_CARRIER', { id: carrierId });
  };

  const rejectCarrier = (carrierId: string) => {
    setCarriers((prev) =>
      prev.map((c) => (c.id === carrierId ? { ...c, status: 'RIFIUTATO' as const } : c))
    );
    const carrier = carriers.find((c) => c.id === carrierId);
    if (carrier) {
      logActivity(selectedDepotId, `Richiesta vettore rifiutata: ${carrier.name}`, 'WARNING');
    }
    saveAction('REJECT_CARRIER', { id: carrierId });
  };

  const updateCarrierProfile = (id: string, email: string, licensePlate?: string, phone?: string, licensePlateTrailer?: string) => {
    const cleanPlate = licensePlate ? licensePlate.replace(/\s+/g, '').toUpperCase() : undefined;
    const cleanTrailer = licensePlateTrailer ? licensePlateTrailer.replace(/\s+/g, '').toUpperCase() : undefined;

    setCarriers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, email, licensePlate: cleanPlate, phone, licensePlateTrailer: cleanTrailer } : c))
    );
    logActivity(selectedDepotId, `Vettore ${id} ha aggiornato il proprio profilo anagrafico.`, 'INFO');
    const updatedCarrier = carriers.find(c => c.id === id);
    if (updatedCarrier) {
      saveAction('UPDATE_CARRIER_PROFILE', { id, email, licensePlate: cleanPlate, phone, licensePlateTrailer: cleanTrailer, name: updatedCarrier.name, vatNumber: updatedCarrier.vatNumber });
    } else {
      saveAction('UPDATE_CARRIER_PROFILE', { id, email, licensePlate: cleanPlate, phone, licensePlateTrailer: cleanTrailer });
    }
  };

  const updateCarrier = (id: string, name: string, email: string, vatNumber?: string, licensePlate?: string) => {
    const cleanPlate = licensePlate ? licensePlate.replace(/\s+/g, '').toUpperCase() : undefined;
    setCarriers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, email, vatNumber, licensePlate: cleanPlate } : c))
    );
    logActivity(selectedDepotId, `Aggiornata anagrafica vettore da Admin: ${name}`, 'INFO');
    saveAction('UPDATE_CARRIER', { id, name, email, vatNumber, licensePlate: cleanPlate });
  };

  const deleteCarrier = (id: string) => {
    setCarriers((prev) => prev.filter((c) => c.id !== id));
    logActivity(selectedDepotId, `Eliminato vettore con ID: ${id}`, 'WARNING');
    saveAction('DELETE_CARRIER', { id });
  };

  // --- AZIONI PRENOTAZIONI ---
  const addBooking = (
    depotId: string,
    date: string,
    activityType: string,
    licensePlate: string,
    driverName: string,
    driverPhone?: string,
    notes?: string,
    palletPlaces?: number,
    driverLicense?: string,
    driverLicenseRelease?: string,
    orderNumber?: string,
    clientUsageId?: string,
    licensePlateTrailer?: string,
    driverLicenseExpiry?: string,
    orderNumber2?: string,
    clientId?: string
  ) => {
    const id = `book-${Date.now()}`;
    const carrierId = currentRole === 'VETTORE' ? currentCarrierId : 'carrier-1';
    
    // Generazione codice Ticket con prefisso Plant
    const plantObj = depots.find(d => d.id === depotId);
    const plantCode = plantObj ? plantObj.name.substring(0, 3).toUpperCase() : 'PLT';
    const prefix = activityType.substring(0, 1).toUpperCase() || 'T';
    const randNum = Math.floor(100 + Math.random() * 900);
    const ticketNumber = `${plantCode}-${prefix}-${randNum}`;

    // Pulizia e normalizzazione targhe
    const cleanPlate = licensePlate.replace(/\s+/g, '').toUpperCase();
    const cleanTrailer = licensePlateTrailer ? licensePlateTrailer.replace(/\s+/g, '').toUpperCase() : undefined;

    const newNote: BookingNote[] = [];
    if (notes) {
      newNote.push({
        id: `note-init-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: currentRole === 'VETTORE' ? 'Vettore' : 'Sistema',
        text: notes,
      });
    }

    const newBooking: Booking = {
      id,
      carrierId,
      depotId,
      date,
      activityType,
      status: 'PRENOTATO',
      licensePlate: cleanPlate,
      licensePlateTrailer: cleanTrailer,
      driverName,
      driverPhone,
      notes,
      notesHistory: newNote,
      palletPlaces: palletPlaces ? Number(palletPlaces) : undefined,
      ticketNumber,
      isEditedInBay: false,
      driverLicense,
      driverLicenseRelease,
      driverLicenseExpiry,
      orderNumber,
      orderNumber2,
      clientUsageId,
      clientId,
    };

    setBookings((prev) => [...prev, newBooking]);
    const carrier = carriers.find((c) => c.id === carrierId);
    logActivity(
      depotId,
      `Prenotazione [Ticket: ${ticketNumber}] registrata da ${carrier?.name || 'Vettore'} per il ${date}`,
      'INFO'
    );

    // CONTROLLI ANOMALIE ALL'ATTO DELLA CREAZIONE (PATENTE E TARGA DUPLICATA)
    // 1. Patente Scaduta
    if (driverLicenseExpiry && new Date(driverLicenseExpiry) < new Date()) {
      addAnomaly(
        depotId,
        'PATENTE_SCADUTA',
        `L'autista ${driverName} ha la patente scaduta (Scadenza: ${driverLicenseExpiry})`,
        id,
        ticketNumber,
        cleanPlate
      );
    }

    // 2. Targa Duplicata tra Vettori
    const hasPlateConflict = carriers.some(
      (c) => c.id !== carrierId && c.licensePlate?.replace(/\s+/g, '').toUpperCase() === cleanPlate
    );
    if (hasPlateConflict) {
      const conflictingCarrierName = carriers.find(c => c.licensePlate?.replace(/\s+/g, '').toUpperCase() === cleanPlate)?.name || 'Altro Vettore';
      addAnomaly(
        depotId,
        'TARGA_DUPLICATA',
        `La targa trattore ${cleanPlate} è già associata di default ad un altro vettore (${conflictingCarrierName})`,
        id,
        ticketNumber,
        cleanPlate
      );
    }
    return id;
  };

  const updateBookingStatus = (
    bookingId: string,
    status: Booking['status'],
    bayId?: string,
    extra?: { driverPhone?: string; notes?: string; driverLicense?: string; driverLicenseRelease?: string; orderNumber?: string; clientUsageId?: string; licensePlateTrailer?: string; driverLicenseExpiry?: string; orderNumber2?: string }
  ) => {
    let oldBooking: Booking | undefined;
    let targetDepotId = selectedDepotId;

    setBookings((prevBookings) =>
      prevBookings.map((b) => {
        if (b.id === bookingId) {
          oldBooking = b;
          targetDepotId = b.depotId;

          const updated = { ...b, status };

          // Aggiungi dati extra
          if (extra) {
            if (extra.driverPhone !== undefined) updated.driverPhone = extra.driverPhone;
            if (extra.driverLicense !== undefined) updated.driverLicense = extra.driverLicense;
            if (extra.driverLicenseRelease !== undefined) updated.driverLicenseRelease = extra.driverLicenseRelease;
            if (extra.driverLicenseExpiry !== undefined) updated.driverLicenseExpiry = extra.driverLicenseExpiry;
            if (extra.orderNumber !== undefined) updated.orderNumber = extra.orderNumber;
            if (extra.orderNumber2 !== undefined) updated.orderNumber2 = extra.orderNumber2;
            if (extra.clientUsageId !== undefined) updated.clientUsageId = extra.clientUsageId;
            if (extra.licensePlateTrailer !== undefined) {
              updated.licensePlateTrailer = extra.licensePlateTrailer ? extra.licensePlateTrailer.replace(/\s+/g, '').toUpperCase() : undefined;
            }
            if (extra.notes !== undefined) {
              updated.notes = extra.notes;
              const authorName = currentUser?.name || 'Guardiola';
              const newNote: BookingNote = {
                id: `note-checkin-${Date.now()}`,
                timestamp: new Date().toISOString(),
                author: authorName,
                text: extra.notes,
              };
              updated.notesHistory = updated.notesHistory ? [...updated.notesHistory, newNote] : [newNote];
            }
          }

          if (status === 'AL_CANCELLO' && !b.timeInGate) {
            updated.timeInGate = new Date().toISOString();
          } else if (status === 'IN_BAIA') {
            if (!b.timeInBay) {
              updated.timeInBay = new Date().toISOString();
            }
            if (bayId) {
              updated.bayId = bayId;
            }
          } else if (status === 'COMPLETATO') {
            updated.timeOutBay = new Date().toISOString();
            updated.timeOutGate = new Date().toISOString();
          } else if (status === 'PRENOTATO') {
            updated.bayId = undefined;
            updated.timeInGate = undefined;
            updated.timeInBay = undefined;
            updated.timeOutBay = undefined;
            updated.timeOutGate = undefined;
            updated.isEditedInBay = false;
          }

          return updated;
        }
        return b;
      })
    );

    // Controlli anomalie al check-in
    if (oldBooking) {
      const ticketText = oldBooking.ticketNumber || oldBooking.id;
      const cleanPlate = oldBooking.licensePlate;

      if (status === 'AL_CANCELLO' && extra) {
        // Verifica patente scaduta
        if (extra.driverLicenseExpiry && new Date(extra.driverLicenseExpiry) < new Date()) {
          addAnomaly(
            targetDepotId,
            'PATENTE_SCADUTA',
            `Autista ${oldBooking.driverName} rilevato al check-in con patente scaduta in data ${extra.driverLicenseExpiry}`,
            bookingId,
            ticketText,
            cleanPlate
          );
        }

        // Verifica targa duplicata
        const hasPlateConflict = carriers.some(
          (c) => c.id !== oldBooking?.carrierId && c.licensePlate?.replace(/\s+/g, '').toUpperCase() === cleanPlate
        );
        if (hasPlateConflict) {
          const conflictingCarrierName = carriers.find(c => c.licensePlate?.replace(/\s+/g, '').toUpperCase() === cleanPlate)?.name || 'Altro Vettore';
          addAnomaly(
            targetDepotId,
            'TARGA_DUPLICATA',
            `Mezzo al check-in con targa ${cleanPlate} associata ad altro vettore (${conflictingCarrierName})`,
            bookingId,
            ticketText,
            cleanPlate
          );
        }
      }

      if (oldBooking.bayId) {
        setBays((prevBays) =>
          prevBays.map((b) =>
            b.id === oldBooking?.bayId
              ? { ...b, status: 'DISPONIBILE' as const, currentBookingId: undefined }
              : b
          )
        );
      }

      if (status === 'IN_BAIA' && bayId) {
        setBays((prevBays) =>
          prevBays.map((b) =>
            b.id === bayId
              ? { ...b, status: 'OCCUPATA' as const, currentBookingId: bookingId }
              : b
          )
        );
        const targetBayName = bays.find((b) => b.id === bayId)?.name || 'Baia';
        logActivity(
          targetDepotId,
          `Mezzo ${oldBooking.licensePlate} [${ticketText}] in baia ${targetBayName}.`,
          'SUCCESS'
        );
      }
      // Aggiorna sul DB
      const timeInGate = status === 'AL_CANCELLO' ? new Date().toISOString() : (oldBooking.timeInGate || null);
      const timeInBay = status === 'IN_BAIA' ? new Date().toISOString() : (oldBooking.timeInBay || null);
      const timeOutBay = status === 'COMPLETATO' ? new Date().toISOString() : (oldBooking.timeOutBay || null);
      const timeOutGate = status === 'COMPLETATO' ? new Date().toISOString() : (oldBooking.timeOutGate || null);
      saveAction('UPDATE_BOOKING_STATUS', {
        id: bookingId,
        status,
        bayId: status === 'IN_BAIA' ? bayId : (status === 'PRENOTATO' ? null : (oldBooking.bayId || null)),
        timeInGate,
        timeInBay,
        timeOutBay,
        timeOutGate
      });
      if (oldBooking.bayId) {
        saveAction('UPDATE_BAY_STATUS', { id: oldBooking.bayId, status: 'DISPONIBILE', currentBookingId: null });
      }
      if (status === 'IN_BAIA' && bayId) {
        saveAction('UPDATE_BAY_STATUS', { id: bayId, status: 'OCCUPATA', currentBookingId: bookingId });
      } else if (status === 'AL_CANCELLO') {
        logActivity(
          targetDepotId,
          `Check-In per veicolo ${oldBooking.licensePlate} [${ticketText}].`,
          'INFO'
        );
      } else if (status === 'COMPLETATO') {
        const targetBayName = bays.find((b) => b.id === oldBooking?.bayId)?.name || 'Baia';
        logActivity(
          targetDepotId,
          `Attività conclusa per veicolo ${oldBooking.licensePlate} [${ticketText}] presso ${targetBayName}.`,
          'SUCCESS'
        );
      } else if (status === 'ANNULLATO') {
        logActivity(targetDepotId, `Prenotazione slot per ${oldBooking.licensePlate} [${ticketText}] annullata.`, 'WARNING');
      }
    }
  };

  const addBookingNote = (bookingId: string, text: string) => {
    const authorName = currentUser?.name || (currentRole === 'GUARDIA' ? `Guardiola ${selectedDepotId}` : 'Preposto');
    const newNote: BookingNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      author: authorName,
      text,
    };

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const notesHistory = b.notesHistory ? [...b.notesHistory, newNote] : [newNote];
          return {
            ...b,
            notes: text,
            notesHistory,
            isEditedInBay: b.status === 'IN_BAIA' ? true : b.isEditedInBay,
          };
        }
        return b;
      })
    );

    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      logActivity(booking.depotId, `Aggiunta nota a veicolo ${booking.licensePlate} da ${authorName}.`, 'INFO');
    }
  };

  const saveQualityChecklist = (
    bookingId: string,
    checklistData: {
      pianaleSporco: boolean;
      presenzaInfestantiMezzo: boolean;
      odoriAnomali: boolean;
      puliziaPallet: boolean;
      integritaPallet: boolean;
      presenzaInfestantiProdotto: boolean;
      presenzaBio: boolean;
      noteLibere?: string;
      sigilloPresente: boolean;
      numeroSigillo?: string;
      corrispondenzaDdt: boolean;
      noteSigillo?: string;
    }
  ) => {
    const prepostoName = currentUser?.name || 'Preposto Magazzino';
    const isFailed =
      checklistData.pianaleSporco ||
      checklistData.presenzaInfestantiMezzo ||
      checklistData.odoriAnomali ||
      !checklistData.puliziaPallet ||
      !checklistData.integritaPallet ||
      checklistData.presenzaInfestantiProdotto ||
      (checklistData.sigilloPresente && !checklistData.corrispondenzaDdt);

    const checklist: QualityChecklist = {
      ...checklistData,
      dataOraCheck: new Date().toISOString(),
      compilataDa: prepostoName,
      isFailed,
    };

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            checklist,
            isEditedInBay: true,
          };
        }
        return b;
      })
    );

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      logActivity(
        booking.depotId,
        `Compilata checklist conformità veicolo ${booking.licensePlate} da preposto ${prepostoName}. Esito: ${isFailed ? 'FALLITO' : 'CONFORME'}.`,
        isFailed ? 'WARNING' : 'SUCCESS'
      );

      if (isFailed) {
        const failedList: string[] = [];
        if (checklistData.pianaleSporco) failedList.push('Pianale sporco');
        if (checklistData.presenzaInfestantiMezzo) failedList.push('Infestanti mezzo');
        if (checklistData.odoriAnomali) failedList.push('Odori anomali');
        if (!checklistData.puliziaPallet) failedList.push('Pallet non puliti');
        if (!checklistData.integritaPallet) failedList.push('Pallet non integri');
        if (checklistData.presenzaInfestantiProdotto) failedList.push('Infestanti prodotto');
        if (checklistData.sigilloPresente && !checklistData.corrispondenzaDdt) failedList.push('Sigillo non conforme');

        const newAlert: ChecklistFailureAlert = {
          id: `alert-${Date.now()}`,
          bookingId,
          depotId: booking.depotId,
          bayId: booking.bayId || '',
          prepostoName,
          failedChecks: failedList,
          timestamp: new Date().toISOString(),
          status: 'ATTESA_DECISIONE',
        };

        setChecklistAlerts((prev) => [newAlert, ...prev]);

        // Aggiungi anomalia anche nel registro anomalie
        addAnomaly(
          booking.depotId,
          'CHECKLIST_FALLITA',
          `Checklist qualità fallita per rampa ${bays.find(b=>b.id === booking.bayId)?.name || 'N/D'} da preposto ${prepostoName}`,
          bookingId,
          booking.ticketNumber,
          booking.licensePlate
        );
      }
    }
  };

  const resolveChecklistAlert = (alertId: string, action: 'PROCEDI' | 'RESPINTO', reason?: string) => {
    let alertObj: ChecklistFailureAlert | undefined;

    setChecklistAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          alertObj = a;
          return { ...a, status: action, resolutionReason: reason };
        }
        return a;
      })
    );

    if (alertObj) {
      const { bookingId, bayId, depotId } = alertObj;

      if (action === 'PROCEDI') {
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id === bookingId) {
              const resNote: BookingNote = {
                id: `note-res-${Date.now()}`,
                timestamp: new Date().toISOString(),
                author: currentUser?.name || 'Guardiola',
                text: `SBLOCCATA ALLERTA CHECKLIST FALLITA: ${reason || 'Autorizzato a procedere.'}`,
              };
              return {
                ...b,
                isEditedInBay: false,
                notesHistory: b.notesHistory ? [...b.notesHistory, resNote] : [resNote],
              };
            }
            return b;
          })
        );
        logActivity(depotId, `Allerta checklist sbloccata da guardiola. Attività procede.`, 'SUCCESS');
      } else if (action === 'RESPINTO') {
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id === bookingId) {
              const rejNote: BookingNote = {
                id: `note-rej-${Date.now()}`,
                timestamp: new Date().toISOString(),
                author: currentUser?.name || 'Guardiola',
                text: `MEZZO RESPINTO PER CHECKLIST FALLITA. Motivazione: ${reason || 'Non specificato'}`,
              };
              return {
                ...b,
                status: 'ANNULLATO',
                bayId: undefined,
                timeOutGate: new Date().toISOString(),
                notesHistory: b.notesHistory ? [...b.notesHistory, rejNote] : [rejNote],
              };
            }
            return b;
          })
        );

        if (bayId) {
          setBays((prev) =>
            prev.map((bay) =>
              bay.id === bayId
                ? { ...bay, status: 'DISPONIBILE', currentBookingId: undefined }
                : bay
            )
          );
        }
        logActivity(depotId, `Mezzo respinto per checklist fallita. Baia liberata. Motivo: ${reason}`, 'WARNING');
      }
    }
  };

  const updateBookingDetails = (
    bookingId: string,
    updates: { activityType?: string; notes?: string; driverPhone?: string; palletPlaces?: number; driverLicense?: string; driverLicenseRelease?: string; orderNumber?: string; clientUsageId?: string; licensePlateTrailer?: string; driverLicenseExpiry?: string; orderNumber2?: string; clientId?: string }
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const updated = {
            ...b,
            ...updates,
          };
          if (b.status === 'IN_BAIA') {
            updated.isEditedInBay = true;
          }
          if (updates.licensePlateTrailer) {
            updated.licensePlateTrailer = updates.licensePlateTrailer.replace(/\s+/g, '').toUpperCase();
          }
          if (updates.notes) {
            const author = currentUser?.name || 'Sistema';
            const newNote: BookingNote = {
              id: `note-det-${Date.now()}`,
              timestamp: new Date().toISOString(),
              author,
              text: updates.notes,
            };
            updated.notesHistory = updated.notesHistory ? [...updated.notesHistory, newNote] : [newNote];
          }
          return updated;
        }
        return b;
      })
    );

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      logActivity(booking.depotId, `Aggiornati dettagli operativi prenotazione.`, 'INFO');
    }
  };

  const relocateBookingBay = (bookingId: string, newBayId: string, reason: string) => {
    let targetDepotId = selectedDepotId;
    let oldBayId: string | undefined;

    setBookings((prevBookings) =>
      prevBookings.map((b) => {
        if (b.id === bookingId) {
          targetDepotId = b.depotId;
          oldBayId = b.bayId;
          const relocateNote: BookingNote = {
            id: `note-reloc-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: currentUser?.name || 'Operatore',
            text: `CAMBIO BAIA: spostato da ${bays.find(x => x.id === oldBayId)?.name || 'N/D'} a ${bays.find(x => x.id === newBayId)?.name || 'N/D'}. Motivazione: ${reason}`,
          };
          return {
            ...b,
            bayId: newBayId,
            bayChangeReason: reason,
            isEditedInBay: true,
            notesHistory: b.notesHistory ? [...b.notesHistory, relocateNote] : [relocateNote],
          };
        }
        return b;
      })
    );

    setBays((prevBays) =>
      prevBays.map((b) => {
        if (oldBayId && b.id === oldBayId) {
          return { ...b, status: 'DISPONIBILE' as const, currentBookingId: undefined };
        }
        if (b.id === newBayId) {
          return { ...b, status: 'OCCUPATA' as const, currentBookingId: bookingId };
        }
        return b;
      })
    );

    const bNameOld = bays.find((b) => b.id === oldBayId)?.name || 'Vecchia Baia';
    const bNameNew = bays.find((b) => b.id === newBayId)?.name || 'Nuova Baia';
    logActivity(
      targetDepotId,
      `Riassegnazione baia: spostato da ${bNameOld} a ${bNameNew}. Motivazione: ${reason}`,
      'WARNING'
    );
  };

  // --- ATTIVITA' E SCHEDULATORI ---
  const addActivityType = (name: string, code: string, baseDurationMinutes: number, minutesPerPallet: number) => {
    const id = `act-${Date.now()}`;
    const newAct: ActivityType = { id, name, code: code.toUpperCase(), baseDurationMinutes, minutesPerPallet };
    setActivityTypes((prev) => [...prev, newAct]);
    saveAction('ADD_ACTIVITY_TYPE', newAct);
  };

  const updateActivityType = (id: string, name: string, code: string, baseDurationMinutes: number, minutesPerPallet: number) => {
    setActivityTypes((prev) => prev.map((a) => (a.id === id ? { ...a, name, code: code.toUpperCase(), baseDurationMinutes, minutesPerPallet } : a)));
    logActivity(selectedDepotId, `Aggiornato tipo attività: ${name}`, 'INFO');
    saveAction('UPDATE_ACTIVITY_TYPE', { id, name, code, baseDurationMinutes, minutesPerPallet });
  };

  const deleteActivityType = (id: string) => {
    setActivityTypes((prev) => prev.filter((a) => a.id !== id));
    logActivity(selectedDepotId, `Eliminato tipo attività con ID: ${id}`, 'WARNING');
    saveAction('DELETE_ACTIVITY_TYPE', { id });
  };

  const addReportSchedule = (name: string, frequency: ReportSchedule['frequency'], recipients: string, reportType: string) => {
    const id = `rep-${Date.now()}`;
    const newRep: ReportSchedule = { id, name, frequency, recipients, reportType, active: true };
    setReportSchedules((prev) => [...prev, newRep]);
    saveAction('ADD_REPORT_SCHEDULE', newRep);
  };

  const updateReportSchedule = (id: string, name: string, frequency: ReportSchedule['frequency'], recipients: string, reportType: string) => {
    setReportSchedules((prev) => prev.map((r) => (r.id === id ? { ...r, name, frequency, recipients, reportType } : r)));
    logActivity(selectedDepotId, `Aggiornata pianificazione report: ${name}`, 'INFO');
    saveAction('UPDATE_REPORT_SCHEDULE', { id, name, frequency, recipients, reportType });
  };

  const deleteReportSchedule = (id: string) => {
    setReportSchedules((prev) => prev.filter((r) => r.id !== id));
    logActivity(selectedDepotId, `Eliminata pianificazione report con ID: ${id}`, 'WARNING');
    saveAction('DELETE_REPORT_SCHEDULE', { id });
  };

  const toggleReportSchedule = (id: string) => {
    setReportSchedules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    const rs = reportSchedules.find(r => r.id === id);
    if (rs) {
      saveAction('TOGGLE_REPORT_SCHEDULE', { id, active: !rs.active });
    }
  };

  // --- GESTIONE CLIENTI ---
  const addClient = (name: string, vatNumber?: string, email?: string, defaultDepotId?: string) => {
    const id = `client-${Date.now()}`;
    const newClient: Client = { id, name, vatNumber, email, defaultDepotId };
    setClients((prev) => [...prev, newClient]);
    saveAction('ADD_CLIENT', newClient);
    logActivity(selectedDepotId, `Aggiunto cliente: ${name}`, 'SUCCESS');
  };

  const updateClient = (id: string, name: string, vatNumber?: string, email?: string, defaultDepotId?: string) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, name, vatNumber, email, defaultDepotId } : c)));
    logActivity(selectedDepotId, `Aggiornato cliente: ${name}`, 'INFO');
    saveAction('UPDATE_CLIENT', { id, name, vatNumber, email, defaultDepotId });
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    saveAction('DELETE_CLIENT', { id });
    logActivity(selectedDepotId, `Eliminato cliente con ID: ${id}`, 'WARNING');
  };

  // --- GESTIONE COMUNI ---
  const addComune = (comune: string, cap: string, provincia: string) => {
    const newComune = { comune, cap, provincia };
    setComuni((prev) => [...prev, newComune]);
    saveAction('ADD_COMUNE', newComune);
    logActivity(selectedDepotId, `Aggiunto comune: ${comune} (${provincia})`, 'SUCCESS');
  };

  const updateComune = (originalComune: string, originalCap: string, comune: string, cap: string, provincia: string) => {
    setComuni((prev) => prev.map((c) => (c.comune === originalComune && c.cap === originalCap ? { comune, cap, provincia } : c)));
    logActivity(selectedDepotId, `Aggiornato comune: ${comune} (${provincia})`, 'INFO');
    saveAction('UPDATE_COMUNE', { oldComune: originalComune, oldCap: originalCap, comune, cap, provincia });
  };

  const deleteComune = (comune: string, cap: string) => {
    setComuni((prev) => prev.filter((c) => !(c.comune === comune && c.cap === cap)));
    saveAction('DELETE_COMUNE', { comune, cap });
    logActivity(selectedDepotId, `Eliminato comune: ${comune} - ${cap}`, 'WARNING');
  };

  // --- GESTIONE TIPI PALLET ---
  const addPalletType = (name: string, description?: string) => {
    const id = `plt-${Date.now()}`;
    const newPallet: PalletType = { id, name, description };
    setPalletTypes((prev) => [...prev, newPallet]);
    saveAction('ADD_PALLET_TYPE', newPallet);
    logActivity(selectedDepotId, `Configurato tipo pallet: ${name}`, 'SUCCESS');
  };

  const updatePalletType = (id: string, name: string, description?: string) => {
    setPalletTypes((prev) => prev.map((p) => (p.id === id ? { ...p, name, description } : p)));
    logActivity(selectedDepotId, `Aggiornato tipo pallet: ${name}`, 'INFO');
    saveAction('UPDATE_PALLET_TYPE', { id, name, description });
  };

  const deletePalletType = (id: string) => {
    setPalletTypes((prev) => prev.filter((p) => p.id !== id));
    saveAction('DELETE_PALLET_TYPE', { id });
    logActivity(selectedDepotId, `Eliminato tipo pallet con ID: ${id}`, 'WARNING');
  };

  // --- GESTIONE UTENZE ---
  const addUser = (name: string, email: string, role: User['role'], depotIds: string[], username: string) => {
    const id = `user-${Date.now()}`;
    const newUser: User = {
      id,
      name,
      username,
      email,
      role,
      depotId: depotIds[0] || '',
      depotIds,
      status: 'PENDING_CONFIRMATION'
    };
    setUsers((prev) => [...prev, newUser]);
    saveAction('ADD_USER', newUser);
    logActivity(depotIds[0] || selectedDepotId, `Creata utenza interna per: ${name} (${role}) in attesa di conferma email`, 'SUCCESS');

    // Aggiungi e-mail simulata in coda per la conferma
    const confirmLink = `http://localhost:5173/conferma-email?id=${id}`;
    setSimulatedEmails((prev) => [
      ...prev,
      { userId: id, userName: name, userEmail: email, confirmLink }
    ]);
  };

  const updateUser = (id: string, name: string, email: string, role: User['role'], depotIds: string[], username: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, name, email, role, depotIds, username, depotId: depotIds[0] || '' } : u)));
    logActivity(selectedDepotId, `Aggiornata utenza interna: ${name} (${username})`, 'INFO');
    saveAction('UPDATE_USER', { id, name, email, role, depotIds, username });
    
    // Aggiorna anche l'utente di sessione se si sta auto-modificando
    setCurrentUser((prev) =>
      prev && prev.id === id ? { ...prev, name, email, role, depotIds, username, depotId: depotIds[0] || '' } : prev
    );
  };

  const confirmUserEmail = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'FIRST_ACCESS' as const } : u))
    );
    saveAction('CONFIRM_USER_EMAIL', { id: userId });
    logActivity(selectedDepotId, `Email confermata per l'utente ${userId}. Stato aggiornato a: Primo Accesso`, 'SUCCESS');
    clearSimulatedEmail(userId);
  };

  const setUserPassword = async (userId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength) return { success: false, error: 'La password deve avere almeno 8 caratteri.' };
    if (!hasUppercase) return { success: false, error: 'La password deve contenere almeno una lettera maiuscola.' };
    if (!hasNumber) return { success: false, error: 'La password deve contenere almeno un numero.' };
    if (!hasSpecial) return { success: false, error: 'La password deve contenere almeno un carattere speciale (es. !, @, #, $, %).' };

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password, status: 'ACTIVE' as const } : u))
    );
    logActivity(selectedDepotId, `Nuova password impostata con successo per l'utente ${userId}.`, 'SUCCESS');
    await saveAction('SET_USER_PASSWORD', { id: userId, password });

    // Aggiorna anche l'utente di sessione se si sta auto-impostando
    setCurrentUser((prev) =>
      prev && prev.id === userId ? { ...prev, password, status: 'ACTIVE' as const } : prev
    );

    return { success: true };
  };

  const updateUserRole = (id: string, role: User['role']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
    saveAction('UPDATE_USER_ROLE', { id, role });
    logActivity(selectedDepotId, `Modificato ruolo utente ${id} in: ${role}`, 'INFO');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    saveAction('DELETE_USER', { id });
    logActivity(selectedDepotId, `Eliminato utente con ID: ${id}`, 'WARNING');
  };

  // --- GESTIONE SPEDIZIONI ---
  const addShipment = (shipmentInput: Omit<Shipment, 'id' | 'status'>) => {
    const id = `ship-${Date.now()}`;
    const newShipment: Shipment = {
      ...shipmentInput,
      id,
      status: 'DA_PIANIFICARE'
    };
    setShipments((prev) => [...prev, newShipment]);
    saveAction('ADD_SHIPMENT', newShipment);
    logActivity(shipmentInput.depotId, `Creata spedizione per ordine ${shipmentInput.orderNumber} (${shipmentInput.activityType})`, 'SUCCESS');
  };

  const updateShipmentStatus = (id: string, status: Shipment['status']) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    saveAction('UPDATE_SHIPMENT_STATUS', { id, status });
  };

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    saveAction('UPDATE_SHIPMENT', { id, ...updates });
    logActivity(selectedDepotId, `Modificata spedizione ${updates.orderNumber || id}`, 'INFO');
  };

  const deleteShipment = (id: string) => {
    setShipments((prev) => prev.filter((s) => s.id !== id));
    saveAction('DELETE_SHIPMENT', { id });
  };

  const deleteShipments = (ids: string[]) => {
    setShipments((prev) => prev.filter((s) => !ids.includes(s.id)));
    saveAction('DELETE_SHIPMENTS', { ids });
    logActivity(selectedDepotId, `Eliminate massivamente ${ids.length} spedizioni`, 'WARNING');
  };

  const bindShipmentsToBooking = (shipmentIds: string[], bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const plate = booking ? booking.licensePlate : '';
    setShipments((prev) =>
      prev.map((s) =>
        shipmentIds.includes(s.id)
          ? { ...s, bookingId, licensePlate: plate, status: 'PIANIFICATO' as const }
          : s
      )
    );
    saveAction('BIND_SHIPMENTS_TO_BOOKING', { shipmentIds, bookingId, licensePlate: plate });
    logActivity(selectedDepotId, `Abbinate ${shipmentIds.length} spedizioni al viaggio ${booking?.ticketNumber || bookingId}`, 'INFO');
  };

  const unbindShipmentFromBooking = (shipmentId: string) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId
          ? { ...s, bookingId: undefined, licensePlate: undefined, status: 'DA_PIANIFICARE' }
          : s
      )
    );
    saveAction('UNBIND_SHIPMENT_FROM_BOOKING', { shipmentId });
    logActivity(selectedDepotId, `Scollegata spedizione ${shipmentId} dal viaggio`, 'INFO');
  };

  // --- RIPRISTINO STATO ---
  const resetState = () => {
    setDepots(defaultDepots);
    setWarehouseModules(defaultWarehouseModules);
    setBays(defaultBays);
    setCarriers(defaultCarriers);
    setBookings(defaultBookings);
    setActivityLogs(defaultLogs);
    setActivityTypes(defaultActivityTypes);
    setReportSchedules(defaultReportSchedules);
    setChecklistAlerts([]);
    setBayUsages(defaultBayUsages);
    setAnomalies([]);
    setCurrentRole(null);
    setCurrentUser(null);
    setCurrentCarrierId('');
    setSelectedDepotId('depot-milano');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    logActivity('depot-milano', 'Database ripristinato.', 'WARNING');
  };

  return (
    <AppContext.Provider
      value={{
        depots,
        warehouseModules,
        bays,
        carriers,
        bookings,
        activityLogs,
        activityTypes,
        reportSchedules,
        checklistAlerts,
        bayUsages,
        anomalies,
        comuni,
        systemParameters,
        currentRole,
        currentUser,
        currentCarrierId,
        selectedDepotId,
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
        addCarrier,
        registerCarrier,
        approveCarrier,
        rejectCarrier,
        updateCarrier,
        deleteCarrier,
        updateCarrierProfile,
        addBooking,
        updateBookingStatus,
        updateBookingDetails,
        relocateBookingBay,
        addBookingNote,
        saveQualityChecklist,
        resolveChecklistAlert,
        addActivityType,
        updateActivityType,
        deleteActivityType,
        addReportSchedule,
        updateReportSchedule,
        deleteReportSchedule,
        toggleReportSchedule,
        addAnomaly,
        resolveAnomaly,
        addPalletReturn,
        removePalletReturn,
        emitPalletVoucher,
        setCurrentRole,
        setCurrentUser,
        setCurrentCarrierId,
        setSelectedDepotId,
        resetState,
        clients,
        palletTypes,
        users,
        shipments,
        addClient,
        updateClient,
        deleteClient,
        addComune,
        updateComune,
        deleteComune,
        addPalletType,
        updatePalletType,
        deletePalletType,
        addUser,
        updateUser,
        updateUserRole,
        deleteUser,
        confirmUserEmail,
        setUserPassword,
        simulatedEmails,
        clearSimulatedEmail,
        addShipment,
        updateShipmentStatus,
        updateShipment,
        deleteShipment,
        deleteShipments,
        bindShipmentsToBooking,
        unbindShipmentFromBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve essere utilizzato all\'interno di un AppProvider');
  }
  return context;
};
