import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type SupportedFormat = 'CSV' | 'XLSX' | 'JSON' | 'XML';

/**
 * Legge un file (File Object da browser) e restituisce un array di record piatti
 */
export async function parseFile(file: File): Promise<{ data: Record<string, any>[]; format: SupportedFormat; columns: string[] }> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return parseCsvFile(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseXlsxFile(file);
  } else if (extension === 'json') {
    return parseJsonFile(file);
  } else if (extension === 'xml') {
    return parseXmlFile(file);
  }

  throw new Error(`Formato file non supportato: .${extension}`);
}

/**
 * Parsing payload per API (Node/Serverless context)
 */
export async function parseBuffer(buffer: Buffer, format: SupportedFormat): Promise<{ data: Record<string, any>[]; columns: string[] }> {
  if (format === 'CSV') {
    return parseCsvString(buffer.toString('utf-8'));
  } else if (format === 'XLSX') {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheet]);
    return { data, columns: Object.keys(data[0] || {}) };
  } else if (format === 'JSON') {
    const jsonStr = buffer.toString('utf-8');
    const data = JSON.parse(jsonStr);
    const arr = Array.isArray(data) ? data : [data];
    return { data: arr, columns: Object.keys(arr[0] || {}) };
  } else if (format === 'XML') {
    // Basic implementation per XML via API
    throw new Error('Parsing XML buffer non ancora implementato nativamente, richiede xml2js o simile lato server.');
  }
  
  throw new Error(`Formato non supportato API: ${format}`);
}

// Implementazioni Browser (File)

async function parseCsvFile(file: File): Promise<{ data: Record<string, any>[]; format: SupportedFormat; columns: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data as Record<string, any>[],
          format: 'CSV',
          columns: results.meta.fields || Object.keys(results.data[0] || {})
        });
      },
      error: (error) => reject(error)
    });
  });
}

function parseCsvString(content: string): { data: Record<string, any>[]; columns: string[] } {
  const results = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });
  return {
    data: results.data as Record<string, any>[],
    columns: results.meta.fields || Object.keys(results.data[0] || {})
  };
}

async function parseXlsxFile(file: File): Promise<{ data: Record<string, any>[]; format: SupportedFormat; columns: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        resolve({
          data: json,
          format: 'XLSX',
          columns: Object.keys(json[0] || {})
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

async function parseJsonFile(file: File): Promise<{ data: Record<string, any>[]; format: SupportedFormat; columns: string[] }> {
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    return {
      data: arr,
      format: 'JSON',
      columns: Object.keys(arr[0] || {})
    };
  } catch (err) {
    throw new Error('File JSON non valido');
  }
}

async function parseXmlFile(file: File): Promise<{ data: Record<string, any>[]; format: SupportedFormat; columns: string[] }> {
  const text = await file.text();
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    // Assumiamo una struttura piatta tipo <records><record><field1>val</field1></record></records>
    const recordNodes = xmlDoc.documentElement.children;
    const arr: Record<string, any>[] = [];
    
    for (let i = 0; i < recordNodes.length; i++) {
      const node = recordNodes[i];
      const obj: Record<string, any> = {};
      for (let j = 0; j < node.children.length; j++) {
        const field = node.children[j];
        obj[field.tagName] = field.textContent;
      }
      if (Object.keys(obj).length > 0) arr.push(obj);
    }

    return {
      data: arr,
      format: 'XML',
      columns: Object.keys(arr[0] || {})
    };
  } catch (err) {
    throw new Error('File XML non valido o struttura non supportata');
  }
}
