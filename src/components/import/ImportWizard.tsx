import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { parseFile, SupportedFormat } from '../../utils/parser';
import { aggregateTripsAndShipments, mapRawRowToSystem, NormalizationResult } from '../../utils/normalization';
import { ImportTemplate } from '../../types';
import { Upload, FileText, CheckCircle, AlertTriangle, ChevronRight, X, Save } from 'lucide-react';
import Button from '../ui/Button';

interface ImportWizardProps {
  onClose: () => void;
}

export default function ImportWizard({ onClose }: ImportWizardProps) {
  const { addBooking, addShipment, state } = useApp();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<SupportedFormat | null>(null);
  const [rawColumns, setRawColumns] = useState<string[]>([]);
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<ImportTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('import_templates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dryRunResult, setDryRunResult] = useState<NormalizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // System Fields per la mappatura
  const systemFields = [
    { value: 'booking.orderNumber', label: 'Viaggio: Codice / Riferimento' },
    { value: 'booking.date', label: 'Viaggio: Data' },
    { value: 'booking.activityType', label: 'Viaggio: Tipo (CARICO/SCARICO)' },
    { value: 'booking.licensePlate', label: 'Viaggio: Targa' },
    { value: 'booking.driverName', label: 'Viaggio: Nome Autista' },
    { value: 'shipment.orderNumber', label: 'Spedizione: Riferimento' },
    { value: 'shipment.subjectName', label: 'Spedizione: Mittente/Destinatario' },
    { value: 'shipment.address', label: 'Spedizione: Indirizzo' },
    { value: 'shipment.city', label: 'Spedizione: Città' },
    { value: 'shipment.cap', label: 'Spedizione: CAP' },
    { value: 'shipment.province', label: 'Spedizione: Provincia' },
    { value: 'shipment.palletPlaces', label: 'Spedizione: N. Pallet' },
    { value: 'shipment.grossWeight', label: 'Spedizione: Peso (KG)' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setIsProcessing(true);
    try {
      const parsed = await parseFile(selected);
      setFile(selected);
      setFormat(parsed.format);
      setRawColumns(parsed.columns);
      setRawRecords(parsed.data);
      
      // Auto-detect template if columns match perfectly
      const matchedTemplate = savedTemplates.find(t => {
        const tCols = Object.keys(t.mappingRules);
        return tCols.length > 0 && tCols.every(c => parsed.columns.includes(c));
      });

      if (matchedTemplate) {
        setMapping(matchedTemplate.mappingRules);
        setTemplateName(matchedTemplate.name);
      } else {
        setMapping({});
        setTemplateName('');
      }

      setStep(2);
    } catch (err: any) {
      alert(err.message || 'Errore durante la lettura del file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Inserisci un nome per il template');
      return;
    }
    const newTemplate: ImportTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateName,
      mappingRules: mapping,
      createdAt: new Date().toISOString()
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('import_templates', JSON.stringify(updated));
    alert('Template salvato con successo!');
  };

  const runDryRun = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const mappedRows = rawRecords.map(r => mapRawRowToSystem(r, mapping));
        const result = aggregateTripsAndShipments(mappedRows, state.depots || [], state.clients || []);
        setDryRunResult(result);
        setStep(3);
      } catch (err: any) {
        alert('Errore durante la normalizzazione: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    }, 500); // Simulate processing time
  };

  const commitData = () => {
    if (!dryRunResult) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      // Inserimento effettivo
      dryRunResult.bookings.forEach(b => {
        addBooking(b as any);
      });
      dryRunResult.shipments.forEach(s => {
        addShipment(s as any);
      });
      
      setStep(4);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Importazione Dati Universale</h2>
            <p className="text-sm text-slate-500 mt-1">Carica file Excel, CSV, JSON o XML per creare Viaggi e Spedizioni</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-12 h-1 ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-12">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv, .xlsx, .xls, .json, .xml" 
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-2xl border-2 border-dashed border-slate-300 rounded-xl bg-white p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="mx-auto w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Trascina qui il file o clicca per caricare</h3>
                <p className="text-slate-500">Supportati: CSV, XLSX, JSON, XML</p>
                {isProcessing && <p className="mt-4 text-blue-600 font-medium animate-pulse">Analisi file in corso...</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Mapping */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-bold text-slate-800">{file?.name}</h3>
                    <p className="text-sm text-slate-500">{rawRecords.length} record rilevati ({format})</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input 
                    type="text" 
                    placeholder="Nome Profilo Template..." 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-48"
                  />
                  <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
                    <Save className="w-4 h-4 mr-2" />
                    Salva Template
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-semibold text-slate-700 w-1/2">Colonna File Rilevata</th>
                      <th className="p-3 font-semibold text-slate-700 w-1/2">Campo di Sistema (Destinazione)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawColumns.map(col => (
                      <tr key={col} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 text-slate-800 font-medium bg-slate-50 border-r border-slate-100">
                          {col}
                        </td>
                        <td className="p-3">
                          <select 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={mapping[col] || ''}
                            onChange={(e) => {
                              const newMap = { ...mapping };
                              if (e.target.value) newMap[col] = e.target.value;
                              else delete newMap[col];
                              setMapping(newMap);
                            }}
                          >
                            <option value="">-- Ignora questa colonna --</option>
                            <optgroup label="Dati Viaggio">
                              {systemFields.filter(f => f.value.startsWith('booking.')).map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Dati Spedizione">
                              {systemFields.filter(f => f.value.startsWith('shipment.')).map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))}
                            </optgroup>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={runDryRun} isLoading={isProcessing}>
                  Procedi all'Analisi Dati <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Dry Run Report */}
          {step === 3 && dryRunResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><FileText className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Viaggi Rilevati</p>
                    <p className="text-2xl font-bold text-slate-800">{dryRunResult.bookings.length}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="bg-green-100 text-green-600 p-3 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Spedizioni Rilevate</p>
                    <p className="text-2xl font-bold text-slate-800">{dryRunResult.shipments.length}</p>
                  </div>
                </div>
                <div className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 ${dryRunResult.errors.length > 0 ? 'ring-2 ring-red-500' : ''}`}>
                  <div className={`p-3 rounded-lg ${dryRunResult.errors.length > 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Anomalie (Errori / Warning)</p>
                    <p className="text-2xl font-bold text-slate-800">
                      <span className={dryRunResult.errors.length > 0 ? 'text-red-600' : ''}>{dryRunResult.errors.length}</span> 
                      <span className="text-slate-400 mx-1">/</span> 
                      {dryRunResult.warnings.length}
                    </p>
                  </div>
                </div>
              </div>

              {dryRunResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-bold text-red-800 flex items-center mb-2"><AlertTriangle className="w-5 h-5 mr-2" /> Errori Bloccanti ({dryRunResult.errors.length})</h4>
                  <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                    {dryRunResult.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>Riga {e.row}: {e.error}</li>
                    ))}
                    {dryRunResult.errors.length > 5 && <li>... e altri {dryRunResult.errors.length - 5} errori</li>}
                  </ul>
                  <p className="text-xs text-red-500 mt-2 font-medium">I record con errori non verranno importati. Puoi procedere bypassandoli o annullare per correggere il file.</p>
                </div>
              )}

              {dryRunResult.warnings.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h4 className="font-bold text-orange-800 flex items-center mb-2"><AlertTriangle className="w-5 h-5 mr-2" /> Avvisi ({dryRunResult.warnings.length})</h4>
                  <ul className="list-disc pl-5 text-sm text-orange-700 space-y-1">
                    {dryRunResult.warnings.slice(0, 5).map((e, i) => (
                      <li key={i}>Riga {e.row}: {e.warning}</li>
                    ))}
                    {dryRunResult.warnings.length > 5 && <li>... e altri {dryRunResult.warnings.length - 5} avvisi</li>}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-700">Anteprima Viaggi</div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <th className="p-3 font-semibold text-slate-600">Viaggio</th>
                        <th className="p-3 font-semibold text-slate-600">Data</th>
                        <th className="p-3 font-semibold text-slate-600">Destinazione (Plant)</th>
                        <th className="p-3 font-semibold text-slate-600">Targa</th>
                        <th className="p-3 font-semibold text-slate-600">Spedizioni associate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dryRunResult.bookings.slice(0, 50).map((b, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-800">{b.orderNumber}</td>
                          <td className="p-3 text-slate-600">{b.date}</td>
                          <td className="p-3 text-slate-600">{b.depotId}</td>
                          <td className="p-3 text-slate-600">{b.licensePlate}</td>
                          <td className="p-3 text-slate-600">{dryRunResult.shipments.filter(s => s.tripId === b.id).length} stop</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>Torna Indietro</Button>
                <Button 
                  onClick={commitData} 
                  isLoading={isProcessing} 
                  className={dryRunResult.errors.length > 0 ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {dryRunResult.errors.length > 0 ? "Bypassa Errori e Importa Dati Validi" : "Conferma e Importa Dati"} 
                  <CheckCircle className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Importazione Completata!</h2>
              <p className="text-slate-600 text-lg max-w-lg mx-auto mb-8">
                Sono stati importati con successo <strong className="text-slate-800">{dryRunResult?.bookings.length}</strong> nuovi viaggi e <strong className="text-slate-800">{dryRunResult?.shipments.length}</strong> spedizioni nel sistema.
              </p>
              <div className="flex space-x-4">
                <Button onClick={onClose} size="lg">Torna al Gestionale</Button>
                <Button variant="outline" onClick={() => {
                  setStep(1);
                  setFile(null);
                  setRawRecords([]);
                }} size="lg">Importa Nuovo File</Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
