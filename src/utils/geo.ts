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

export function getHubByClientAndLocation(
  clientId: string,
  loc: { city?: string; cap?: string; province?: string; name?: string }
): { hubId: string | null; isAmbiguous: boolean; routingNotes?: string } {
  const cleanClient = (clientId || '').toLowerCase();
  
  const isVeronaOppeano = (
    (loc.province && loc.province.toUpperCase() === 'VR') ||
    (loc.cap && loc.cap.startsWith('37')) ||
    (loc.city && (loc.city.toUpperCase().includes('OPPEANO') || loc.city.toUpperCase().includes('VERONA'))) ||
    (loc.name && (loc.name.toUpperCase().includes('OPPEANO') || loc.name.toUpperCase().includes('VERONA')))
  );

  if (isVeronaOppeano) {
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

export function calculateSmartRouting(
  origin: { city?: string; cap?: string; province?: string; name?: string },
  destination: { city?: string; cap?: string; province?: string; name?: string },
  activityType: 'CARICO' | 'SCARICO' | 'RESO' | 'CONTAINER' = 'SCARICO',
  clientId: string = ''
): SmartRoutingResult & { routingNotes: string } {
  const origResult = getHubByClientAndLocation(clientId, origin);
  const destResult = getHubByClientAndLocation(clientId, destination);

  const hubOrigineOperativo = origResult.hubId || 'depot-milano';
  const hubDestinazioneOperativo = destResult.hubId || 'depot-milano';
  const isAmbiguous = origResult.isAmbiguous || destResult.isAmbiguous;
  
  const routingNotes = origResult.routingNotes || destResult.routingNotes || 'Instradamento calcolato';

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
