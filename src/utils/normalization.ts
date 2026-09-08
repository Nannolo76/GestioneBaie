import type { Booking, Shipment, Depot, Client } from '../types';
import { getHubForLocationDynamic, getHubByClientAndLocation, PROV_TO_REGION, CAP_PREFIX_TO_PROV } from './geo';

/**
 * Funzione di utilità per standardizzare date in YYYY-MM-DD
 */
export function normalizeDate(value: any): string {
  if (!value) return '';
  const dateStr = String(value).trim();
  
  // Se è già YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // DD/MM/YYYY o DD-MM-YYYY
  const matchEur = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (matchEur) {
    const day = matchEur[1].padStart(2, '0');
    const month = matchEur[2].padStart(2, '0');
    const year = matchEur[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback a JS Date parser
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return dateStr;
}

/**
 * Cerca di arricchire i dati geografici (Regione, Provincia) a partire da CAP o Provincia
 */
export function enrichGeographicData(row: Record<string, any>) {
  if (row.cap) {
    const cleanCap = String(row.cap).trim().replace(/\D/g, '');
    if (cleanCap.length >= 2) {
      const prefix = cleanCap.substring(0, 2);
      const province = CAP_PREFIX_TO_PROV[prefix];
      if (province) {
        if (!row.province) row.province = province;
        if (!row.region) row.region = PROV_TO_REGION[province] || '';
      }
    }
  } else if (row.province) {
    const prov = String(row.province).trim().toUpperCase();
    if (!row.region) row.region = PROV_TO_REGION[prov] || '';
  }
}

/**
 * Applica le regole di mappatura (Template) a una riga cruda
 */
export function mapRawRowToSystem(rawRow: Record<string, any>, mappingRules: Record<string, string>): Record<string, any> {
  const mappedRow: Record<string, any> = {
    booking: {},
    shipment: {}
  };

  for (const [rawCol, sysPath] of Object.entries(mappingRules)) {
    if (rawRow[rawCol] !== undefined && rawRow[rawCol] !== null && rawRow[rawCol] !== '') {
      if (sysPath.startsWith('booking.')) {
        const field = sysPath.replace('booking.', '');
        mappedRow.booking[field] = rawRow[rawCol];
      } else if (sysPath.startsWith('shipment.')) {
        const field = sysPath.replace('shipment.', '');
        mappedRow.shipment[field] = rawRow[rawCol];
      }
    }
  }

  return mappedRow;
}

export interface NormalizationResult {
  bookings: Partial<Booking>[];
  shipments: Partial<Shipment>[];
  errors: Array<{ row: number; error: string; raw: any }>;
  warnings: Array<{ row: number; warning: string; raw: any }>;
}

/**
 * Aggrega N righe piatte in M Bookings e P Shipments
 */
export function aggregateTripsAndShipments(
  mappedRows: Record<string, any>[],
  depots: Depot[],
  clients: Client[],
  defaultCarrierId: string = 'carrier-1'
): NormalizationResult {
  const result: NormalizationResult = {
    bookings: [],
    shipments: [],
    errors: [],
    warnings: []
  };

  // Group by Trip Reference (booking.orderNumber or similar unique trip key)
  const tripGroups: Record<string, typeof mappedRows> = {};
  let anonymousTrips = 0;

  mappedRows.forEach((row, idx) => {
    // Il viaggio è identificato da orderNumber. Se non c'è, ogni riga è un viaggio a sé?
    const tripKey = row.booking.orderNumber || `UNASSIGNED_TRIP_${++anonymousTrips}`;
    
    if (!tripGroups[tripKey]) tripGroups[tripKey] = [];
    tripGroups[tripKey].push({ ...row, originalIndex: idx + 1 });
  });

  // Costruisci gli oggetti
  for (const [tripKey, rows] of Object.entries(tripGroups)) {
    const isAnonymous = tripKey.startsWith('UNASSIGNED_TRIP_');
    const firstRow = rows[0];

    // Se mancano dati minimi, segnala errore (Dry Run)
    if (isAnonymous) {
      result.warnings.push({ row: firstRow.originalIndex, warning: 'Manca Riferimento Viaggio (booking.orderNumber), assegnato ID temporaneo', raw: firstRow });
    }

    // 1. Costruisci il Booking (Viaggio) basato sulla prima riga del gruppo
    const bookingId = `book-import-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const bData = firstRow.booking;
    
    // Fallbacks
    const date = normalizeDate(bData.date || new Date().toISOString().split('T')[0]);
    const carrierId = bData.carrierId || defaultCarrierId;
    
    // Geolocation for Booking (which Depot should manage this?)
    // This could be derived from the first shipment
    let depotId = bData.depotId;
    if (!depotId) {
       // Prova a dedurre dai dati geografici del primo stop
       const sData = firstRow.shipment;
       const geoQuery = { city: sData.city, cap: sData.cap, province: sData.province };
       const hubRes = getHubForLocationDynamic(geoQuery, depots);
       depotId = hubRes.hubId || depots[0]?.id || 'depot-milano';
    }

    const booking: Partial<Booking> = {
      id: bookingId,
      orderNumber: bData.orderNumber || tripKey,
      date,
      depotId,
      carrierId,
      activityType: bData.activityType || 'SCARICO', // Default scarico se non specificato
      status: 'PRENOTATO',
      licensePlate: String(bData.licensePlate || 'DA_ASSEGNARE').toUpperCase().replace(/\s/g, ''),
      driverName: bData.driverName || 'Non specificato',
      palletPlaces: 0, // Verrà calcolato dalle spedizioni
      notes: bData.notes || 'Importato automaticamente',
    };

    result.bookings.push(booking);

    // 2. Costruisci le Spedizioni
    let totalPallets = 0;

    rows.forEach((r, seqIdx) => {
      const sData = r.shipment;
      
      // Normalize dates
      if (sData.expectedDate) sData.expectedDate = normalizeDate(sData.expectedDate);
      if (sData.expectedDeliveryDate) sData.expectedDeliveryDate = normalizeDate(sData.expectedDeliveryDate);

      // Enrich Geo
      enrichGeographicData(sData);

      // Smart Routing
      const geoQuery = { city: sData.city, cap: sData.cap, province: sData.province };
      const clientId = sData.clientId || bData.clientId;
      const routingRes = getHubByClientAndLocation(clientId || '', geoQuery, depots, clients);

      const palletCount = parseInt(sData.palletPlaces) || 0;
      totalPallets += palletCount;

      const shipment: Partial<Shipment> = {
        id: `ship-import-${Date.now()}-${Math.floor(Math.random()*10000)}`,
        bookingId: bookingId,
        tripId: bookingId,
        orderNumber: sData.orderNumber || `SHIP-${Math.floor(Math.random()*100000)}`,
        activityType: sData.activityType || booking.activityType,
        palletPlaces: palletCount,
        status: 'PIANIFICATO',
        sequence: seqIdx + 1,
        
        // Geo Data
        city: sData.city,
        cap: sData.cap,
        province: sData.province,
        region: sData.region,
        address: sData.address,
        subjectName: sData.subjectName,
        grossWeight: parseFloat(sData.grossWeight) || 0,
        
        // Routing Data
        hubDestinazioneOperativo: routingRes.hubId || depotId,
        isAdr: !!sData.isAdr,
        requiresTailLift: !!sData.requiresTailLift,
        internalNotes: routingRes.routingNotes,
      };

      if (!shipment.city && !shipment.cap) {
        result.errors.push({ row: r.originalIndex, error: 'Manca Città o CAP per la spedizione', raw: r });
      }

      result.shipments.push(shipment);
    });

    booking.palletPlaces = totalPallets;
  }

  return result;
}
