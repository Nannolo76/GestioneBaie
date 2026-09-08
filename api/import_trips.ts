import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseBuffer, SupportedFormat } from '../src/utils/parser';
import { aggregateTripsAndShipments, mapRawRowToSystem } from '../src/utils/normalization';
import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito. Usa POST.' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Manca token di autorizzazione (Bearer)' });
    }
    // In un sistema reale, validare il token
    const token = authHeader.split(' ')[1];
    
    // Identifica il template richiesto
    const templateId = req.query.templateId as string;
    if (!templateId) {
      return res.status(400).json({ error: 'Parametro query "templateId" obbligatorio.' });
    }

    // In a real app, fetch the template from Postgres
    // For now, simulate a template definition
    const mockMappingRules: Record<string, string> = {
      // Regole Esempio (saranno prelevate dal DB `import_templates`)
      'CodiceViaggio': 'booking.orderNumber',
      'DataPrevista': 'shipment.expectedDate',
      'Mittente': 'shipment.subjectName',
      'Indirizzo': 'shipment.address',
      'Citta': 'shipment.city',
      'CAP': 'shipment.cap',
      'Provincia': 'shipment.province',
      'Pallet': 'shipment.palletPlaces',
      'Attivita': 'booking.activityType'
    };

    // Identifica il formato dal Content-Type
    const contentType = req.headers['content-type'] || '';
    let format: SupportedFormat = 'JSON';
    
    if (contentType.includes('text/csv')) format = 'CSV';
    else if (contentType.includes('application/xml') || contentType.includes('text/xml')) format = 'XML';
    else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) format = 'XLSX';

    // Parse the payload buffer
    // Assuming Vercel processes JSON bodies automatically if Content-Type is application/json
    let parsedData: any[] = [];
    
    if (format === 'JSON') {
      parsedData = Array.isArray(req.body) ? req.body : [req.body];
    } else {
      // Per file binari o testuali (CSV, XML) 
      const rawBody = req.body; 
      const buffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
      const parseResult = await parseBuffer(buffer, format);
      parsedData = parseResult.data;
    }

    if (!parsedData || parsedData.length === 0) {
      return res.status(400).json({ error: 'Payload vuoto o non supportato.' });
    }

    // Map each raw row to the system Booking/Shipment format
    const mappedRows = parsedData.map((row: any) => mapRawRowToSystem(row, mockMappingRules));

    // Aggregazione e Normalizzazione (Simulando l'estrazione di Depots e Clients dal DB per l'arricchimento)
    // In prod: fetch depots and clients from database
    const mockDepots = [{ id: 'depot-milano', name: 'Milano Hub', city: 'Milano', province: 'MI' }];
    const mockClients: any[] = [];

    const result = aggregateTripsAndShipments(mappedRows, mockDepots as any[], mockClients);

    if (result.errors.length > 0) {
      return res.status(422).json({
        message: 'Il caricamento contiene anomalie bloccanti',
        errors: result.errors,
        warnings: result.warnings
      });
    }

    // Inserisci i dati nel DB (Simulato in questo file, in realtà chiameresti sql() o Vercel Postgres)
    // await sql('INSERT INTO bookings ...', [...])
    // await sql('INSERT INTO shipments ...', [...])

    return res.status(200).json({
      message: 'Importazione completata con successo',
      bookingsCreated: result.bookings.length,
      shipmentsCreated: result.shipments.length,
      warnings: result.warnings
    });

  } catch (err: any) {
    console.error('Errore import API:', err);
    return res.status(500).json({ error: 'Errore interno del server', details: err.message });
  }
}
