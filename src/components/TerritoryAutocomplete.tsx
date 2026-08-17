import React, { useState, useEffect, useRef, useMemo } from 'react';
import territoryData from '../data/territory.json';

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

  // Filtra i record in base alla ricerca (massimo 50 per performance)
  const filteredRecords = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const term = searchTerm.toLowerCase();
    
    return territoryData.filter(record => {
      const matchComune = record.comune.toLowerCase().includes(term);
      const matchProvincia = record.provincia.toLowerCase().includes(term);
      const matchSigla = record.provincia_sigla.toLowerCase() === term;
      const matchCap = record.cap === term;
      
      return matchComune || matchProvincia || matchSigla || matchCap;
    }).slice(0, 50);
  }, [searchTerm]);

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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
            <div className="px-4 py-2 text-gray-500 text-sm">
              Nessun comune trovato. Prova con un CAP o una provincia.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
