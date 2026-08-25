export interface Depot {
  id: string;
  name: string;
  city: string;
  address?: string;
  cap?: string;
  province?: string;
  country?: string;
}

export interface WarehouseModule {
  id: string;
  depotId: string; // Plant ID
  name: string; // e.g., "Modulo A", "Modulo B"
  description?: string;
}

export interface BayUsage {
  id: string;
  name: string; // e.g., "Pallet vuoti", "Acqua", "Crossdocking", "Cliente Rossi"
  description?: string;
}

export interface Bay {
  id: string;
  depotId: string;
  moduleId?: string; // Links to WarehouseModule
  name: string; // e.g., "Baia A1", "Baia A2"
  status: 'DISPONIBILE' | 'OCCUPATA' | 'MANUTENZIONE';
  currentBookingId?: string; // Links to the booking currently occupying the bay
  bayUsageId?: string; // Links to BayUsage (Uso Baia)
}

export interface Carrier {
  id: string;
  name: string;
  email: string;
  status: 'ATTESA_APPROVAZIONE' | 'APPROVATO' | 'RIFIUTATO';
  licensePlate?: string; // Default license plate (Tractor)
  licensePlateTrailer?: string; // Default trailer license plate
  phone?: string;
  vatNumber?: string; // Partita IVA
}

export interface BookingNote {
  id: string;
  timestamp: string; // ISO string
  author: string; // e.g. "Guardiola Milano" or "Preposto"
  text: string;
}

export interface QualityChecklist {
  // Verifiche Idoneità Mezzo
  pianaleSporco: boolean;
  presenzaInfestantiMezzo: boolean;
  odoriAnomali: boolean;
  
  // Verifiche Idoneità Prodotto
  puliziaPallet: boolean;
  integritaPallet: boolean;
  presenzaInfestantiProdotto: boolean;
  presenzaBio: boolean;
  noteLibere?: string;
  dataOraCheck: string;
  compilataDa: string; // Preposto Name

  // Controllo Sigillo
  sigilloPresente: boolean;
  numeroSigillo?: string;
  corrispondenzaDdt: boolean;
  noteSigillo?: string;

  // Esito
  isFailed: boolean; // True if critically failed
}

export interface ChecklistFailureAlert {
  id: string;
  bookingId: string;
  depotId: string;
  bayId: string;
  prepostoName: string;
  failedChecks: string[];
  timestamp: string; // ISO string
  status: 'ATTESA_DECISIONE' | 'PROCEDI' | 'RESPINTO';
  resolutionReason?: string;
}

export interface AnomalyLog {
  id: string;
  timestamp: string; // ISO string
  depotId: string;
  bookingId?: string;
  ticketNumber?: string;
  licensePlate?: string;
  type: 'PATENTE_SCADUTA' | 'TARGA_DUPLICATA' | 'SFORAMENTO_TEMPO' | 'CHECKLIST_FALLITA';
  message: string;
  resolved: boolean;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Booking {
  id: string;
  carrierId: string;
  depotId: string;
  date: string; // YYYY-MM-DD
  activityType: string; // e.g. "CARICO", "SCARICO", "RESO" (dynamically managed)
  status: 'PRENOTATO' | 'AL_CANCELLO' | 'IN_BAIA' | 'COMPLETATO' | 'ANNULLATO';
  bayId?: string; // Assigned during gate check-in
  licensePlate: string; // Tractor
  licensePlateTrailer?: string; // Trailer
  driverName: string;
  driverPhone?: string;
  notes?: string; // Standard notes
  notesHistory?: BookingNote[]; // Tabular notes history
  checklist?: QualityChecklist; // Quality conformation check
  palletPlaces?: number;
  ticketNumber?: string;
  isEditedInBay?: boolean;
  bayChangeReason?: string;
  timeInGate?: string; // ISO string when truck arrived at gate
  timeInBay?: string;  // ISO string when loading/unloading started
  timeOutBay?: string; // ISO string when activity finished
  timeOutGate?: string; // ISO string when truck departed
  
  // Patente e Ordine Cliente
  driverLicense?: string;
  driverLicenseRelease?: string;
  driverLicenseExpiry?: string;
  orderNumber?: string; // Required reference
  orderNumber2?: string; // Optional reference
  clientUsageId?: string; // Links to BayUsage (Uso Baia / Cliente)
  clientId?: string; // Links to Client table dynamically

  // Reso Pallet Vuoti & Buono Pallet
  palletReturns?: PalletReturn[];
  palletVoucherNumber?: string;
}

export interface Client {
  id: string;
  name: string;
  vatNumber?: string;
  email?: string;
  defaultDepotId?: string;
}

export interface PalletType {
  id: string;
  name: string; // e.g. "EPAL", "CHEP", "DUSSELDORF"
  description?: string;
}

export interface Shipment {
  id: string;
  clientId: string; // Links to Client
  carrierId: string; // Links to Carrier
  depotId: string; // Links to Depot
  orderNumber: string; // Riferimento 1
  orderNumber2?: string; // Riferimento 2
  tripId?: string; // Numero viaggio interno univoco
  clientTripNumber?: string; // Numero viaggio del committente
  activityType: 'CARICO' | 'SCARICO' | 'RESO' | 'CONTAINER';
  palletPlaces: number;
  status: 'DA_PIANIFICARE' | 'PIANIFICATO' | 'COMPLETATO';

  // Campi TMS estesi
  expectedDate: string; // Data prevista (YYYY-MM-DD)
  expectedTime?: string; // Ora prevista (non vincolante, es. "09:30")
  originOrDestination: string; // Provenienza (arrivi) o Destinazione (partenze)
  goodsType?: string; // Tipologia merce
  licensePlate?: string; // Targa associata (se abbinata)
  expectedDeliveryDate?: string; // Data prevista consegna (solo per partenze)
  bookingId?: string; // ID del viaggio/booking abbinato (se associato)

  // Nuovi campi per anagrafica geografica strutturata reale e routing del network
  realOriginName?: string;
  realOriginAddress?: string;
  realOriginCity?: string;
  realOriginCap?: string;
  realOriginProvince?: string;
  realOriginCountry?: string;
  realDestinationName?: string;
  realDestinationAddress?: string;
  realDestinationCity?: string;
  realDestinationCap?: string;
  realDestinationProvince?: string;
  realDestinationCountry?: string;
  hubOrigineOperativo?: string;
  hubDestinazioneOperativo?: string;
  tipoOperazioneHub?: 'INBOUND' | 'OUTBOUND' | 'TRANSITO';
  routingStatus?: 'CONFERMATO' | 'DA_CONFERMARE';
  routingNotes?: string;
  sequence?: number; // Sequenza di carico/scarico nel Viaggio
  justificationNote?: string; // Nota giustificativa per sforamento limiti (es. peso/pallet)

  // Nuovi campi per anagrafica geografica e dettagli spedizione (legacy)
  subjectName?: string; // Nome (Mittente o Destinatario)
  address?: string; // Indirizzo (di carico o consegna)
  city?: string; // Località (di carico o consegna)
  cap?: string; // CAP (di carico o consegna)
  province?: string; // Provincia (di carico o consegna)
  region?: string; // Regione
  country?: string; // Nazione
  grossWeight?: number; // Peso lordo in kg
  deliveryNotes?: string; // Note per la consegna
  internalNotes?: string; // Note interne di gestione
  tripId?: string; // Identificativo del Viaggio (Trip) che raggruppa più spedizioni
  isAdr?: boolean; // Merce pericolosa
  requiresTailLift?: boolean; // Richiede sponda idraulica
  noteVarie?: string; // Informazioni varie aggiuntive
}

export interface PalletReturn {
  id: string;
  palletType: string; // Links to PalletType name dynamically
  quantity: number;
  condition: 'BUONO' | 'ROTTO';
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  depotId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
}

export interface ActivityType {
  id: string;
  name: string; // e.g., "Carico", "Scarico", "Reso Cliente"
  code: string; // e.g., "CARICO", "SCARICO", "RESO"
  baseDurationMinutes: number; // Base processing time (setup/docs)
  minutesPerPallet: number;    // Processing time per pallet place
}

export interface ReportSchedule {
  id: string;
  name: string;
  frequency: 'GIORNALIERO' | 'SETTIMANALE' | 'MENSILE';
  recipients: string; // e.g. "email1@logisticauno.it, email2@..."
  reportType: string; // e.g. "Tempi Turnaround", "Saturazione Baie"
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'GUARDIA_CANCELLO' | 'OPERATORE_YARD' | 'PREPOSTO';
  depotId?: string; // Optional: legacy single plant id
  depotIds: string[]; // Active and visible warehouses (can select multiple)
  password?: string;
  status: 'PENDING_CONFIRMATION' | 'FIRST_ACCESS' | 'ACTIVE';
}

export interface SystemParameter {
  key: string;
  value: string;
  description?: string;
  type: 'NUMBER' | 'STRING' | 'BOOLEAN';
}

export interface ComuneItaliano {
  comune: string;
  cap: string;
  provincia: string;
}

