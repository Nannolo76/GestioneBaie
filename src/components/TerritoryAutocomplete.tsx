import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface TerritoryRecord {
  regione: string;
  provincia: string;
  provincia_sigla: string;
  comune: string;
  cap: string;
  istat_code: string;
}

interface TerritoryAutocompleteProps {
  value: string;
  onChange: (value: string, record?: TerritoryRecord) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function TerritoryAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Cerca Comune, Provincia o CAP...", 
  className = "",
  error = false
}: TerritoryAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Aggiorna il search term se il valore esterno cambia
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Gestione click fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [territoryData, setTerritoryData] = useState<TerritoryRecord[]>([]);

  useEffect(() => {
    // Dynamic import to avoid blocking the main thread during initial load
    import('../data/territory.json').then((module) => {
      setTerritoryData(module.default as TerritoryRecord[]);
    }).catch(console.error);
  }, []);

  // Combina i dati statici con quelli inseriti manualmente e salvati nel localStorage
  const allTerritories = useMemo(() => {
    const customStr = localStorage.getItem('custom_territories');
    let custom: TerritoryRecord[] = [];
    if (customStr) {
      try { custom = JSON.parse(customStr); } catch (e) {}
    }
    return [...custom, ...territoryData];
  }, [territoryData]);

  // Filtra i record in base alla ricerca (massimo 50 per performance)
  const filteredRecords = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const term = searchTerm.toLowerCase();
    
    return allTerritories.filter(record => {
      const matchComune = record.comune.toLowerCase().includes(term);
      const matchProvincia = record.provincia.toLowerCase().includes(term);
      const matchSigla = record.provincia_sigla.toLowerCase() === term;
      const matchCap = record.cap === term;
      
      return matchComune || matchProvincia || matchSigla || matchCap;
    }).slice(0, 50);
  }, [searchTerm, allTerritories]);

  const handleSelect = (record: TerritoryRecord) => {
    const displayValue = `${record.comune} (${record.provincia_sigla}) - ${record.cap}`;
    setSearchTerm(displayValue);
    onChange(displayValue, record);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onChange(e.target.value, undefined);
    setIsOpen(true);
  };

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [newProv, setNewProv] = useState('');
  const [newCap, setNewCap] = useState('');

  const handleAddNew = () => {
    if (!newCity || !newProv || !newCap) return;
    const newRecord: TerritoryRecord = {
      comune: newCity,
      provincia: newProv,
      provincia_sigla: newProv.substring(0, 2).toUpperCase(),
      cap: newCap,
      regione: 'Custom',
      istat_code: `custom-${Date.now()}`
    };
    
    const customStr = localStorage.getItem('custom_territories');
    let custom: TerritoryRecord[] = [];
    if (customStr) {
      try { custom = JSON.parse(customStr); } catch (e) {}
    }
    custom.push(newRecord);
    localStorage.setItem('custom_territories', JSON.stringify(custom));
    
    handleSelect(newRecord);
    setIsAddingNew(false);
    setNewCity('');
    setNewProv('');
    setNewCap('');
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        autoComplete="off"
      />
      
      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {filteredRecords.length > 0 ? (
            <ul className="py-1">
              {filteredRecords.map((record) => (
                <li 
                  key={record.istat_code}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex flex-col"
                  onClick={() => handleSelect(record)}
                >
                  <span className="font-medium text-gray-900">{record.comune}</span>
                  <span className="text-sm text-gray-500">
                    {record.provincia} ({record.provincia_sigla}) - CAP {record.cap} - {record.regione}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3">
              {!isAddingNew ? (
                <div className="flex flex-col gap-2">
                  <div className="text-gray-500 text-sm">
                    Nessun comune trovato.
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setNewCity(searchTerm);
                      setIsAddingNew(true);
                    }}
                    className="w-full bg-blue-100 text-blue-700 py-1.5 rounded text-xs font-bold hover:bg-blue-200 transition-colors"
                  >
                    + AGGIUNGI COMUNE AL DATABASE
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-xs">
                  <span className="font-bold text-gray-700">Nuovo Comune:</span>
                  <input type="text" placeholder="Nome Comune" className="border p-1.5 rounded" value={newCity} onChange={e => setNewCity(e.target.value)} />
                  <input type="text" placeholder="Sigla Provincia (Es. MI)" className="border p-1.5 rounded uppercase" maxLength={2} value={newProv} onChange={e => setNewProv(e.target.value.toUpperCase())} />
                  <input type="text" placeholder="CAP" className="border p-1.5 rounded" value={newCap} onChange={e => setNewCap(e.target.value)} />
                  <div className="flex gap-2 mt-1">
                    <button type="button" onClick={() => setIsAddingNew(false)} className="flex-1 bg-gray-200 py-1.5 rounded text-gray-700 font-bold">Annulla</button>
                    <button type="button" onClick={handleAddNew} className="flex-1 bg-emerald-500 py-1.5 rounded text-white font-bold">Salva e Usa</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
