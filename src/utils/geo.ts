import type { Depot, Client } from '../types';

// Mapping province -> regione in Italia
export const PROV_TO_REGION: Record<string, string> = {
  AO: 'Valle d\'Aosta',
  TO: 'Piemonte', AL: 'Piemonte', AT: 'Piemonte', BI: 'Piemonte', CN: 'Piemonte', NO: 'Piemonte', VB: 'Piemonte', VC: 'Piemonte',
  GE: 'Liguria', IM: 'Liguria', SP: 'Liguria', SV: 'Liguria',
  MI: 'Lombardia', BG: 'Lombardia', BS: 'Lombardia', CO: 'Lombardia', CR: 'Lombardia', LC: 'Lombardia', LO: 'Lombardia', MB: 'Lombardia', MN: 'Lombardia', PV: 'Lombardia', SO: 'Lombardia', VA: 'Lombardia',
  TN: 'Trentino-Alto Adige', BZ: 'Trentino-Alto Adige',
  VR: 'Veneto', BL: 'Veneto', PD: 'Veneto', RO: 'Veneto', TV: 'Veneto', VE: 'Veneto', VI: 'Veneto',
  UD: 'Friuli-Venezia Giulia', GO: 'Friuli-Venezia Giulia', PN: 'Friuli-Venezia Giulia', TS: 'Friuli-Venezia Giulia',
  BO: 'Emilia-Romagna', FE: 'Emilia-Romagna', FC: 'Emilia-Romagna', MO: 'Emilia-Romagna', PR: 'Emilia-Romagna', PC: 'Emilia-Romagna', RA: 'Emilia-Romagna', RE: 'Emilia-Romagna', RN: 'Emilia-Romagna',
  FI: 'Toscana', AR: 'Toscana', GR: 'Toscana', LI: 'Toscana', LU: 'Toscana', MS: 'Toscana', PI: 'Toscana', PT: 'Toscana', PO: 'Toscana', SI: 'Toscana',
  PG: 'Umbria', TR: 'Umbria',
  AN: 'Marche', AP: 'Marche', FM: 'Marche', MC: 'Marche', PU: 'Marche',
  RM: 'Lazio', FR: 'Lazio', LT: 'Lazio', RI: 'Lazio', VT: 'Lazio',
  AQ: 'Abruzzo', CH: 'Abruzzo', PE: 'Abruzzo', TE: 'Abruzzo',
  CB: 'Molise', IS: 'Molise',
  NA: 'Campania', AV: 'Campania', BN: 'Campania', CE: 'Campania', SA: 'Campania',
  BA: 'Puglia', BT: 'Puglia', BR: 'Puglia', FG: 'Puglia', LE: 'Puglia', TA: 'Puglia',
  PZ: 'Basilicata', MT: 'Basilicata',
  CZ: 'Calabria', CS: 'Calabria', KR: 'Calabria', RC: 'Calabria', VV: 'Calabria',
  PA: 'Sicilia', AG: 'Sicilia', CL: 'Sicilia', CT: 'Sicilia', EN: 'Sicilia', ME: 'Sicilia', RG: 'Sicilia', SR: 'Sicilia', TP: 'Sicilia',
  CA: 'Sardegna', NU: 'Sardegna', OR: 'Sardegna', SS: 'Sardegna', SU: 'Sardegna'
};

// Mapping primi 2 caratteri CAP -> Provincia
export const CAP_PREFIX_TO_PROV: Record<string, string> = {
  '00': 'RM', '01': 'VT', '02': 'RI', '03': 'FR', '04': 'LT',
  '05': 'TR', '06': 'PG', '07': 'SS', '08': 'NU', '09': 'CA',
  '10': 'TO', '11': 'AO', '12': 'CN', '13': 'VC', '14': 'AT', '15': 'AL',
  '16': 'GE', '17': 'SV', '18': 'IM', '19': 'SP',
  '20': 'MI', '21': 'VA', '22': 'CO', '23': 'SO', '24': 'BG', '25': 'BS', '26': 'CR', '27': 'PV', '28': 'NO', '29': 'PC',
  '30': 'VE', '31': 'TV', '32': 'BL', '33': 'UD', '34': 'TS', '35': 'PD', '36': 'VI', '37': 'VR', '38': 'TN', '39': 'BZ',
  '40': 'BO', '41': 'MO', '42': 'RE', '43': 'PR', '44': 'FE', '45': 'RO', '46': 'MN', '47': 'FC', '48': 'RA',
  '50': 'FI', '51': 'PT', '52': 'AR', '53': 'SI', '54': 'MS', '55': 'LU', '56': 'PI', '57': 'LI', '58': 'GR', '59': 'PO',
  '60': 'AN', '61': 'PU', '62': 'MC', '63': 'AP', '64': 'TE', '65': 'PE', '66': 'CH', '67': 'AQ',
  '70': 'BA', '71': 'FG', '72': 'BR', '73': 'LE', '74': 'TA', '75': 'MT',
  '80': 'NA', '81': 'CE', '82': 'BN', '83': 'AV', '84': 'SA', '85': 'PZ', '86': 'CB', '87': 'CS', '88': 'CZ', '89': 'RC',
  '90': 'PA', '91': 'TP', '92': 'AG', '93': 'CL', '94': 'EN', '95': 'CT', '96': 'SR', '97': 'RG', '98': 'ME', '99': 'TP'
};

export interface GeoDetails {
  province: string;
  region: string;
  country: string;
}

export function getGeoDetailsByCap(cap: string): GeoDetails | null {
  const cleanCap = cap.trim().replace(/\D/g, '');
  if (cleanCap.length < 2) return null;
  const prefix = cleanCap.substring(0, 2);
  const province = CAP_PREFIX_TO_PROV[prefix];
  if (!province) return null;
  const region = PROV_TO_REGION[province] || '';
  return {
    province,
    region,
    country: 'Italia'
  };
}

export function getGeoDetailsByProv(prov: string): GeoDetails | null {
  const cleanProv = prov.trim().toUpperCase();
  const region = PROV_TO_REGION[cleanProv];
  if (!region) return null;
  return {
    province: cleanProv,
    region,
    country: 'Italia'
  };
}

export interface SmartRoutingResult {
  hubOrigineOperativo: string;
  hubDestinazioneOperativo: string;
  tipoOperazioneHub: 'INBOUND' | 'OUTBOUND' | 'TRANSITO';
  isAmbiguous: boolean;
}

export function getHubByProvince(prov: string): string | null {
  const cleanProv = prov.trim().toUpperCase();
  if (cleanProv === 'PC') return 'depot-monticelli';
  
  const region = PROV_TO_REGION[cleanProv];
  if (!region) return null;

  const northRegions = [
    'Valle d\'Aosta', 'Piemonte', 'Liguria', 'Lombardia',
    'Trentino-Alto Adige', 'Veneto', 'Friuli-Venezia Giulia', 'Emilia-Romagna'
  ];
  const centerRegions = [
    'Toscana', 'Umbria', 'Marche', 'Lazio', 'Abruzzo', 'Sardegna'
  ];
  const southRegions = [
    'Molise', 'Campania', 'Puglia', 'Basilicata', 'Calabria', 'Sicilia'
  ];

  if (northRegions.includes(region)) return 'depot-milano';
  if (centerRegions.includes(region)) return 'depot-roma';
  if (southRegions.includes(region)) return 'depot-bari';

  return null;
}

export function getHubForLocation(loc: { city?: string; cap?: string; province?: string; name?: string }): { hubId: string | null; isAmbiguous: boolean } {
  // 1. Cerca per CAP
  if (loc.cap) {
    const geo = getGeoDetailsByCap(loc.cap);
    if (geo?.province) {
      const hub = getHubByProvince(geo.province);
      if (hub) return { hubId: hub, isAmbiguous: false };
    }
  }

  // 2. Cerca per Provincia
  if (loc.province) {
    const hub = getHubByProvince(loc.province);
    if (hub) return { hubId: hub, isAmbiguous: false };
  }

  // 3. Cerca per parole chiave nel Comune (Città)
  if (loc.city) {
    const cityUpper = loc.city.toUpperCase();
    if (cityUpper.includes('MILANO') || cityUpper.includes('TORINO') || cityUpper.includes('GENOVA') || cityUpper.includes('BOLOGNA') || cityUpper.includes('VENEZIA') || cityUpper.includes('BRESCIA') || cityUpper.includes('BERGAMO')) {
      return { hubId: 'depot-milano', isAmbiguous: false };
    }
    if (cityUpper.includes('ROMA') || cityUpper.includes('FIRENZE') || cityUpper.includes('PERUGIA') || cityUpper.includes('ANCONA') || cityUpper.includes('SASSARI') || cityUpper.includes('CAGLIARI')) {
      return { hubId: 'depot-roma', isAmbiguous: false };
    }
    if (cityUpper.includes('BARI') || cityUpper.includes('NAPOLI') || cityUpper.includes('PALERMO') || cityUpper.includes('CATANIA') || cityUpper.includes('FOGGIA') || cityUpper.includes('TARANTO') || cityUpper.includes('LECCE')) {
      return { hubId: 'depot-bari', isAmbiguous: false };
    }
  }

  // 4. Cerca per parole chiave nel Nome/Ragione Sociale
  if (loc.name) {
    const nameUpper = loc.name.toUpperCase();
    if (nameUpper.includes('MILANO') || nameUpper.includes('NORD') || nameUpper.includes('NORTH')) {
      return { hubId: 'depot-milano', isAmbiguous: false };
    }
    if (nameUpper.includes('ROMA') || nameUpper.includes('CENTRO') || nameUpper.includes('CENTER')) {
      return { hubId: 'depot-roma', isAmbiguous: false };
    }
    if (nameUpper.includes('BARI') || nameUpper.includes('SUD') || nameUpper.includes('SOUTH')) {
      return { hubId: 'depot-bari', isAmbiguous: false };
    }
  }

  return { hubId: null, isAmbiguous: true };
}

export function getHubForLocationDynamic(
  loc: { city?: string; cap?: string; province?: string; name?: string },
  depots: Depot[]
): { hubId: string | null; isAmbiguous: boolean } {
  if (!depots || depots.length === 0) return { hubId: null, isAmbiguous: true };

  // Determina la provincia cercata
  let targetProvince: string | null = null;
  if (loc.cap) {
    const geo = getGeoDetailsByCap(loc.cap);
    if (geo?.province) targetProvince = geo.province.toUpperCase();
  }
  if (!targetProvince && loc.province) {
    targetProvince = loc.province.trim().toUpperCase();
  }
  
  // Se non abbiamo una provincia, proviamo a cercarla nel nome del comune
  if (!targetProvince && loc.city) {
    const cityUpper = loc.city.toUpperCase();
    for (const [prov] of Object.entries(PROV_TO_REGION)) {
      if (cityUpper.includes(prov)) {
        targetProvince = prov;
        break;
      }
    }
  }

  // Se abbiamo trovato la provincia
  if (targetProvince) {
    // Match Livello 1: Stessa Provincia
    const sameProvDepots = depots.filter(d => {
      const dProv = d.province ? d.province.trim().toUpperCase() : '';
      if (dProv === targetProvince) return true;
      
      const dCityUpper = d.city.toUpperCase();
      if (dCityUpper.includes(`(${targetProvince})`)) return true;
      
      return false;
    });

    if (sameProvDepots.length === 1) {
      return { hubId: sameProvDepots[0].id, isAmbiguous: false };
    }
    if (sameProvDepots.length > 1) {
      return { hubId: sameProvDepots[0].id, isAmbiguous: true };
    }

    // Match Livello 2: Stessa Regione
    const targetRegion = PROV_TO_REGION[targetProvince];
    if (targetRegion) {
      const sameRegionDepots = depots.filter(d => {
        const dProv = d.province ? d.province.trim().toUpperCase() : '';
        const dRegion = dProv ? PROV_TO_REGION[dProv] : '';
        if (dRegion === targetRegion) return true;
        
        if (d.city) {
          const match = d.city.match(/\(([A-Z]{2})\)/);
          if (match) {
            const extractedProv = match[1];
            if (PROV_TO_REGION[extractedProv] === targetRegion) return true;
          }
        }
        return false;
      });

      if (sameRegionDepots.length === 1) {
        return { hubId: sameRegionDepots[0].id, isAmbiguous: false };
      }
      if (sameRegionDepots.length > 1) {
        return { hubId: sameRegionDepots[0].id, isAmbiguous: true };
      }
    }
  }

  // Match Livello 3: Macro-regione (Nord, Centro, Sud)
  let targetMacro: 'NORTH' | 'CENTER' | 'SOUTH' | null = null;
  if (targetProvince) {
    const targetRegion = PROV_TO_REGION[targetProvince];
    if (targetRegion) {
      const northRegions = [
        'Valle d\'Aosta', 'Piemonte', 'Liguria', 'Lombardia',
        'Trentino-Alto Adige', 'Veneto', 'Friuli-Venezia Giulia', 'Emilia-Romagna'
      ];
      const centerRegions = [
        'Toscana', 'Umbria', 'Marche', 'Lazio', 'Abruzzo', 'Sardegna'
      ];
      
      if (northRegions.includes(targetRegion)) targetMacro = 'NORTH';
      else if (centerRegions.includes(targetRegion)) targetMacro = 'CENTER';
      else targetMacro = 'SOUTH';
    }
  }

  if (targetMacro) {
    const northRegions = [
      'Valle d\'Aosta', 'Piemonte', 'Liguria', 'Lombardia',
      'Trentino-Alto Adige', 'Veneto', 'Friuli-Venezia Giulia', 'Emilia-Romagna'
    ];
    const centerRegions = [
      'Toscana', 'Umbria', 'Marche', 'Lazio', 'Abruzzo', 'Sardegna'
    ];

    const sameMacroDepots = depots.filter(d => {
      const dProv = d.province ? d.province.trim().toUpperCase() : '';
      let dRegion = dProv ? PROV_TO_REGION[dProv] : '';
      if (!dRegion && d.city) {
        const match = d.city.match(/\(([A-Z]{2})\)/);
        if (match) dRegion = PROV_TO_REGION[match[1]] || '';
      }
      if (!dRegion) return false;

      let dMacro: 'NORTH' | 'CENTER' | 'SOUTH' = 'SOUTH';
      if (northRegions.includes(dRegion)) dMacro = 'NORTH';
      else if (centerRegions.includes(dRegion)) dMacro = 'CENTER';
      
      return dMacro === targetMacro;
    });

    if (sameMacroDepots.length === 1) {
      return { hubId: sameMacroDepots[0].id, isAmbiguous: false };
    }
    if (sameMacroDepots.length > 1) {
      const keywordMatch = sameMacroDepots.find(d => {
        const nameUpper = d.name.toUpperCase();
        if (targetMacro === 'NORTH' && (nameUpper.includes('MILANO') || nameUpper.includes('MILAN'))) return true;
        if (targetMacro === 'CENTER' && (nameUpper.includes('ROMA') || nameUpper.includes('ROME'))) return true;
        if (targetMacro === 'SOUTH' && (nameUpper.includes('BARI'))) return true;
        return false;
      });
      if (keywordMatch) return { hubId: keywordMatch.id, isAmbiguous: false };

      return { hubId: sameMacroDepots[0].id, isAmbiguous: true };
    }
  }

  return { hubId: depots[0]?.id || null, isAmbiguous: true };
}

export function getHubByClientAndLocation(
  clientId: string,
  loc: { city?: string; cap?: string; province?: string; name?: string },
  depots?: Depot[],
  clients?: Client[]
): { hubId: string | null; isAmbiguous: boolean; routingNotes?: string } {
  const cleanClient = (clientId || '').toLowerCase();
  
  // 1. Controlla regole client su database
  if (clients && clientId) {
    const matchedClient = clients.find(c => c.id === clientId || c.name.toLowerCase() === cleanClient);
    if (matchedClient?.defaultDepotId) {
      const depotName = depots?.find(d => d.id === matchedClient.defaultDepotId)?.name || matchedClient.defaultDepotId;
      return {
        hubId: matchedClient.defaultDepotId,
        isAmbiguous: false,
        routingNotes: `Regola Cliente: Assegnato ${depotName}`
      };
    }
  }

  // 2. Se abbiamo i plant a database, usa l'auto-routing dinamico
  if (depots && depots.length > 0) {
    // Gestione regole di esempio specifiche per Verona se inseriti plant nel database
    const isVeronaOppeano = (
      (loc.province && loc.province.toUpperCase() === 'VR') ||
      (loc.cap && loc.cap.startsWith('37')) ||
      (loc.city && (loc.city.toUpperCase().includes('OPPEANO') || loc.city.toUpperCase().includes('VERONA'))) ||
      (loc.name && (loc.name.toUpperCase().includes('OPPEANO') || loc.name.toUpperCase().includes('VERONA')))
    );

    if (isVeronaOppeano) {
      const vrDepots = depots.filter(d => {
        const dProv = d.province ? d.province.toUpperCase() : '';
        return dProv === 'VR' || d.city.toUpperCase().includes('OPPEANO') || d.city.toUpperCase().includes('VERONA') || d.name.toUpperCase().includes('OPPEANO');
      });

      if (vrDepots.length > 0) {
        if (cleanClient.includes('rossi') || cleanClient.includes('bauli')) {
          const d1 = vrDepots.find(d => d.name.includes('1') || d.id.includes('1'));
          if (d1) return { hubId: d1.id, isAmbiguous: false, routingNotes: `Oppeano 1 (Regola ${cleanClient.includes('rossi') ? 'Rossi SpA' : 'Bauli'})` };
        }
        if (cleanClient.includes('bianchi')) {
          const d2 = vrDepots.find(d => d.name.includes('2') || d.id.includes('2'));
          if (d2) return { hubId: d2.id, isAmbiguous: false, routingNotes: 'Oppeano 2 (Regola Bianchi Srl)' };
        }
        
        if (vrDepots.length > 1) {
          return {
            hubId: vrDepots[0].id,
            isAmbiguous: true,
            routingNotes: 'Ambivalenza Hub Verona: Rilevati più plant nel cluster (Da confermare)'
          };
        }
        return { hubId: vrDepots[0].id, isAmbiguous: false };
      }
    }

    const dynamicResult = getHubForLocationDynamic(loc, depots);
    let routingNotes = undefined;

    if (dynamicResult.isAmbiguous && dynamicResult.hubId) {
      const matchedDepot = depots.find(d => d.id === dynamicResult.hubId);
      if (matchedDepot) {
        const prov = matchedDepot.province || '';
        const sameProvCount = depots.filter(d => d.province === prov).length;
        if (sameProvCount > 1) {
          routingNotes = `Ambivalenza Hub: Rilevati più stabilimenti in provincia di ${prov} (Da confermare)`;
        } else {
          routingNotes = 'Instradamento provvisorio per macro-area (Da confermare)';
        }
      }
    }

    return {
      hubId: dynamicResult.hubId,
      isAmbiguous: dynamicResult.isAmbiguous,
      routingNotes
    };
  }

  // 3. Fallback statico per compatibilità retroattiva
  const isVeronaOppeanoStatic = (
    (loc.province && loc.province.toUpperCase() === 'VR') ||
    (loc.cap && loc.cap.startsWith('37')) ||
    (loc.city && (loc.city.toUpperCase().includes('OPPEANO') || loc.city.toUpperCase().includes('VERONA'))) ||
    (loc.name && (loc.name.toUpperCase().includes('OPPEANO') || loc.name.toUpperCase().includes('VERONA')))
  );

  if (isVeronaOppeanoStatic) {
    if (cleanClient === 'client-rossi' || cleanClient.includes('rossi')) {
      return { hubId: 'depot-oppeano1', isAmbiguous: false, routingNotes: 'Oppeano 1 (Regola Rossi SpA)' };
    }
    if (cleanClient === 'client-bianchi' || cleanClient.includes('bianchi')) {
      return { hubId: 'depot-oppeano2', isAmbiguous: false, routingNotes: 'Oppeano 2 (Regola Bianchi Srl)' };
    }
    if (cleanClient === 'client-bauli' || cleanClient.includes('bauli')) {
      return { hubId: 'depot-oppeano1', isAmbiguous: false, routingNotes: 'Oppeano 1 (Regola Bauli)' };
    }

    return {
      hubId: 'depot-oppeano1',
      isAmbiguous: true,
      routingNotes: 'Ambivalenza Hub: Oppeano 1 vs Oppeano 2 (Da confermare)'
    };
  }

  if (cleanClient === 'client-rossi') {
    return { hubId: 'depot-oppeano1', isAmbiguous: false, routingNotes: 'Default Rossi SpA' };
  }
  if (cleanClient === 'client-bianchi') {
    return { hubId: 'depot-oppeano2', isAmbiguous: false, routingNotes: 'Default Bianchi Srl' };
  }
  if (cleanClient === 'client-verdi') {
    return { hubId: 'depot-milano', isAmbiguous: false, routingNotes: 'Default Verdi Corp' };
  }

  const standardGeoResult = getHubForLocation(loc);
  return {
    hubId: standardGeoResult.hubId,
    isAmbiguous: standardGeoResult.isAmbiguous,
    routingNotes: standardGeoResult.isAmbiguous ? 'Instradamento ambiguo per dati geografici generici' : undefined
  };
}

function findMatchingHub(
  loc: { city?: string; cap?: string; province?: string; name?: string },
  depots: Depot[]
): Depot | null {
  if (!depots || depots.length === 0) return null;
  
  const locName = (loc.name || '').trim().toLowerCase();
  const locCity = (loc.city || '').trim().toLowerCase();
  const locProv = (loc.province || '').trim().toLowerCase();
  
  for (const d of depots) {
    const dName = d.name.trim().toLowerCase();
    const dCity = d.city.trim().toLowerCase();
    const dProv = (d.province || '').trim().toLowerCase();
    
    if (locName && (dName === locName || dName.includes(locName) || locName.includes(dName))) {
      return d;
    }
    if (locCity && locProv && dCity.includes(locCity) && dProv === locProv) {
      return d;
    }
  }
  return null;
}

export function calculateSmartRouting(
  origin: { city?: string; cap?: string; province?: string; name?: string },
  destination: { city?: string; cap?: string; province?: string; name?: string },
  activityType: 'CARICO' | 'SCARICO' | 'RESO' | 'CONTAINER' = 'SCARICO',
  clientId: string = '',
  depots?: Depot[],
  clients?: Client[]
): SmartRoutingResult & { routingNotes: string } {
  const defaultHub = depots && depots.length > 0 ? depots[0].id : 'depot-milano';

  // 1. Applica prima le regole del cliente se configurate a database
  if (clients && clientId) {
    const cleanClient = clientId.toLowerCase();
    const matchedClient = clients.find(c => c.id === clientId || c.name.toLowerCase() === cleanClient);
    if (matchedClient?.defaultDepotId) {
      const depotName = depots?.find(d => d.id === matchedClient.defaultDepotId)?.name || matchedClient.defaultDepotId;
      return {
        hubOrigineOperativo: matchedClient.defaultDepotId,
        hubDestinazioneOperativo: matchedClient.defaultDepotId,
        tipoOperazioneHub: ['SCARICO', 'RESO'].includes(activityType) ? 'INBOUND' : 'OUTBOUND',
        isAmbiguous: false,
        routingNotes: `Regola Cliente: Assegnato a ${depotName}`
      };
    }
  }

  // 2. Classificazione dei Nodi (Hub vs Esterno)
  const matchedOriginHub = depots ? findMatchingHub(origin, depots) : null;
  const matchedDestHub = depots ? findMatchingHub(destination, depots) : null;

  const isOriginHub = !!matchedOriginHub;
  const isDestHub = !!matchedDestHub;

  if (isOriginHub && !isDestHub) {
    // Caso 1: Mittente = HUB, Destinatario = CLIENTE ESTERNO
    return {
      hubOrigineOperativo: matchedOriginHub.id,
      hubDestinazioneOperativo: matchedOriginHub.id,
      tipoOperazioneHub: 'OUTBOUND',
      isAmbiguous: false,
      routingNotes: `Spedizione OUTBOUND (Carico) da Hub: ${matchedOriginHub.name}`
    };
  } else if (!isOriginHub && isDestHub) {
    // Caso 2: Mittente = CLIENTE ESTERNO, Destinatario = HUB
    return {
      hubOrigineOperativo: matchedDestHub.id,
      hubDestinazioneOperativo: matchedDestHub.id,
      tipoOperazioneHub: 'INBOUND',
      isAmbiguous: false,
      routingNotes: `Spedizione INBOUND (Scarico) presso Hub: ${matchedDestHub.name}`
    };
  } else if (isOriginHub && isDestHub) {
    // Caso 3: Mittente = HUB, Destinatario = HUB (Transito interno)
    return {
      hubOrigineOperativo: matchedOriginHub.id,
      hubDestinazioneOperativo: matchedDestHub.id,
      tipoOperazioneHub: 'TRANSITO',
      isAmbiguous: false,
      routingNotes: `Transito Interno: ${matchedOriginHub.name} ➡️ ${matchedDestHub.name}`
    };
  }

  // Caso 4: Entrambi Esterni -> Fallback standard geografico
  const origResult = getHubByClientAndLocation(clientId, origin, depots, clients);
  const destResult = getHubByClientAndLocation(clientId, destination, depots, clients);

  const hubOrigineOperativo = origResult.hubId || defaultHub;
  const hubDestinazioneOperativo = destResult.hubId || defaultHub;
  const isAmbiguous = origResult.isAmbiguous || destResult.isAmbiguous;
  
  const routingNotes = origResult.routingNotes || destResult.routingNotes || 'Instradamento calcolato per vicinanza geografica';

  let tipoOperazioneHub: 'INBOUND' | 'OUTBOUND' | 'TRANSITO' = 'TRANSITO';
  if (hubOrigineOperativo === hubDestinazioneOperativo) {
    tipoOperazioneHub = ['SCARICO', 'RESO'].includes(activityType) ? 'INBOUND' : 'OUTBOUND';
  } else {
    tipoOperazioneHub = 'TRANSITO';
  }

  return {
    hubOrigineOperativo,
    hubDestinazioneOperativo,
    tipoOperazioneHub,
    isAmbiguous,
    routingNotes
  };
}
