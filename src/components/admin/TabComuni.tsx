import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Table } from '../ui/Table';

interface TabComuniProps {
  comuni: any[];
}

export const TabComuni: React.FC<TabComuniProps> = ({ comuni }) => {
  const [comuniSearch, setComuniSearch] = useState('');

  const filteredComuniTable = useMemo(() => {
    return (comuni || []).filter(c => 
      c.comune.toLowerCase().includes(comuniSearch.toLowerCase()) ||
      c.cap.includes(comuniSearch) ||
      c.provincia.toLowerCase().includes(comuniSearch.toLowerCase())
    ).slice(0, 500); // Prevent lagging by limiting to 500 results
  }, [comuni, comuniSearch]);

  return (
    <>
      {/* --- TAB: ANAGRAFICA COMUNI --- */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 animate-fade-in text-black font-sans">
        <div className="space-y-4">
          <Card title="Database Comuni Italiani (ISTAT - 7904 Record Ufficiali)">
            <div className="mb-4">
              <Input
                placeholder="Cerca comune per nome, cap o provincia..."
                value={comuniSearch}
                onChange={(e) => setComuniSearch(e.target.value)}
              />
            </div>
            <Table
              data={filteredComuniTable}
              emptyMessage="Nessun comune trovato per i criteri specificati."
              columns={[
                {
                  header: 'Comune',
                  accessor: (c) => <span className="font-bold text-black">{c.comune}</span>
                },
                {
                  header: 'CAP',
                  accessor: (c) => <span className="font-mono text-xs">{c.cap}</span>
                },
                {
                  header: 'Provincia',
                  accessor: (c) => <span className="font-mono font-bold text-xs uppercase text-[#004B97]">{c.provincia}</span>
                },
                {
                  header: 'Regione',
                  accessor: (c) => <span className="text-xs text-gray-500 uppercase">{c.regione}</span>
                },
                {
                  header: 'Codice ISTAT',
                  accessor: (c) => <span className="font-mono text-xs text-gray-400">{c.istat_code}</span>
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </>
  );
};
