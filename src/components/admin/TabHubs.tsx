// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';


interface TabHubsProps {
  adminTab: string;
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
  comuni: any[];
}

export const TabHubs: React.FC<TabHubsProps> = ({ adminTab, setEditingItem, setConfirmDialogState, comuni }) => {
  const {
    depots,
    warehouseModules,
    bays,
    bayUsages,
    addDepot,
    
    addWarehouseModule,
    
    addBay,
    
    updateBayStatus,
    addBayUsage
  } = useApp();

  // Stati Hub
  const [newHubName, setNewHubName] = useState('');
  const [newHubShortCode, setNewHubShortCode] = useState('');
  const [hubFormError, setHubFormError] = useState<string | null>(null);
  const [newHubCity, setNewHubCity] = useState('');
  const [newHubAddress, setNewHubAddress] = useState('');
  const [newHubCap, setNewHubCap] = useState('');
  const [newHubProvince, setNewHubProvince] = useState('');
  const [newHubCountry, setNewHubCountry] = useState('Italia');
  const [newHubType, setNewHubType] = useState<'HUB' | 'CORRISPONDENTE'>('HUB');

  // Stati Autocomplete
  const [filteredHubComuni, setFilteredHubComuni] = useState<any[]>([]);
  const [showHubSuggestions, setShowHubSuggestions] = useState(false);

  // Stati Baia
  const [selectedHubForBay, setSelectedHubForBay] = useState('');
  const [selectedModuleForBay, setSelectedModuleForBay] = useState('');
  const [selectedUsageForBay, setSelectedUsageForBay] = useState('');
  const [newBayName, setNewBayName] = useState('');

  // Stati Modulo Magazzino
  const [newModHubId, setNewModHubId] = useState('');
  const [newModName, setNewModName] = useState('');
  const [newModDesc, setNewModDesc] = useState('');

  // Stati Uso Baia
  const [newUsageName, setNewUsageName] = useState('');
  const [newUsageDesc, setNewUsageDesc] = useState('');

  useEffect(() => {
    if (depots.length > 0) {
      const hubs = depots.filter(d => d.type === 'HUB' || !d.type);
      if (!selectedHubForBay && hubs.length > 0) setSelectedHubForBay(hubs[0].id);
      if (!newModHubId && hubs.length > 0) setNewModHubId(hubs[0].id);
    }
  }, [depots, selectedHubForBay, newModHubId]);

  // Autocomplete
  const handleHubCityChange = (val: string) => {
    setNewHubCity(val);
    if (!val) { setFilteredHubComuni([]); return; }
    const filtered = (comuni || []).filter(c => c.comune.toLowerCase().includes(val.toLowerCase()) || c.provincia.toLowerCase().includes(val.toLowerCase()));
    setFilteredHubComuni(filtered.slice(0, 6));
    setShowHubSuggestions(true);
  };
  const handleHubCapChange = (val: string) => {
    setNewHubCap(val);
    if (!val) { setFilteredHubComuni([]); return; }
    const filtered = (comuni || []).filter(c => c.cap.startsWith(val));
    setFilteredHubComuni(filtered.slice(0, 6));
    setShowHubSuggestions(true);
  };
  const handleSelectHubComune = (c: { comune: string; cap: string; provincia: string }) => {
    setNewHubCity(c.comune); setNewHubCap(c.cap); setNewHubProvince(c.provincia); setNewHubCountry('Italia');
    setFilteredHubComuni([]); setShowHubSuggestions(false);
  };

  // Handlers
  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName || !newHubCity || !newHubShortCode) {
      setHubFormError('Compila tutti i campi obbligatori (Nome, Località, Sigla).');
      return;
    }
    if (newHubType === 'CORRISPONDENTE' && (!newHubAddress || !newHubCap || !newHubProvince)) {
      setHubFormError('Per i Corrispondenti è obbligatorio inserire Indirizzo, CAP e Provincia completi.');
      return;
    }
    const normalizedShortCode = newHubShortCode.trim().toUpperCase();
    if (depots.some(d => d.shortCode?.toUpperCase() === normalizedShortCode)) {
      setHubFormError(`La sigla "${normalizedShortCode}" è già in uso. Inserisci una sigla univoca.`);
      return;
    }
    setHubFormError(null);
    addDepot(newHubName, newHubCity, newHubAddress, newHubCap, newHubProvince, newHubCountry, newHubType, normalizedShortCode);
    setNewHubName(''); setNewHubShortCode(''); setNewHubCity(''); setNewHubAddress(''); setNewHubCap(''); setNewHubProvince(''); setNewHubCountry('Italia'); setNewHubType('HUB');
  };

  const handleAddBay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBayName || !selectedHubForBay) return;
    addBay(selectedHubForBay, newBayName, selectedModuleForBay || undefined, selectedUsageForBay || undefined);
    setNewBayName(''); setSelectedModuleForBay(''); setSelectedUsageForBay('');
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModName || !newModHubId) return;
    addWarehouseModule(newModHubId, newModName, newModDesc);
    setNewModName(''); setNewModDesc('');
  };

  const handleAddUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsageName) return;
    addBayUsage(newUsageName, newUsageDesc);
    setNewUsageName(''); setNewUsageDesc('');
  };

  return (
    <>
      {adminTab === 'hubs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="space-y-6">
            <Card title="Nuovo Hub o Corrispondente" accent="orange">
              <form onSubmit={handleAddHub} className="space-y-4">
                <Input
                  label="Ragione Sociale / Nome Plant"
                  placeholder="Es. Milano Logistics Plant"
                  value={newHubName}
                  onChange={(e) => setNewHubName(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Codice Breve (Sigla)"
                    placeholder="Es. MIL"
                    maxLength={4}
                    value={newHubShortCode}
                    onChange={(e) => setNewHubShortCode(e.target.value.toUpperCase())}
                    required
                  />
                  <Select
                    label="Tipologia Nodo"
                    value={newHubType}
                    onChange={(e) => { setHubFormError(null); setNewHubType(e.target.value as 'HUB' | 'CORRISPONDENTE'); }}
                    options={[
                      { value: 'HUB', label: 'HUB Interno' },
                      { value: 'CORRISPONDENTE', label: 'Corrispondente Esterno' }
                    ]}
                    required
                  />
                </div>
                <Input
                  label={`Indirizzo${newHubType === 'CORRISPONDENTE' ? ' *' : ''}`}
                  placeholder="Es. Via dell'Artigianato, 10"
                  value={newHubAddress}
                  onChange={(e) => setNewHubAddress(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="CAP"
                      placeholder="Es. 20020"
                      value={newHubCap}
                      onChange={(e) => handleHubCapChange(e.target.value)}
                      onFocus={() => setShowHubSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowHubSuggestions(false), 200)}
                    />
                  </div>
                  <Input
                    label="Provincia"
                    placeholder="Es. MI"
                    value={newHubProvince}
                    onChange={(e) => setNewHubProvince(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Località"
                    placeholder="Es. Lainate"
                    value={newHubCity}
                    onChange={(e) => handleHubCityChange(e.target.value)}
                    onFocus={() => setShowHubSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowHubSuggestions(false), 200)}
                    required
                  />
                  {showHubSuggestions && filteredHubComuni.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto font-sans text-xs">
                      {filteredHubComuni.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectHubComune(c)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-b-0 flex justify-between items-center"
                        >
                          <span className="font-bold text-slate-800">{c.comune}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.cap} ({c.provincia})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  label="Nazione"
                  placeholder="Es. Italia"
                  value={newHubCountry}
                  onChange={(e) => setNewHubCountry(e.target.value)}
                />
                
                {hubFormError && (
                  <div className="bg-red-500/20 text-red-400 p-2 rounded-lg text-xs font-bold border border-red-500/50">
                    {hubFormError}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Crea Stabilimento
                </Button>
              </form>
            </Card>

            <Card title="Nuova Baia Carico/Scarico" accent="orange">
              <form onSubmit={handleAddBay} className="space-y-4">
                <Select
                  label="Stabilimento Plant Ass."
                  options={depots.filter(d => d.type === 'HUB' || !d.type).map(d => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                  value={depots.find(d => d.id === selectedHubForBay)?.name || selectedHubForBay}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    if (found) setSelectedHubForBay(found.id);
                  }}
                />

                <Select
                  label="Modulo di Magazzino (Opz.)"
                  options={[
                    { value: '', label: 'Nessun modulo specifico' },
                    ...activeHubModules.map(m => ({ value: m.id, label: m.name }))
                  ]}
                  value={warehouseModules.find(m => m.id === selectedModuleForBay)?.name || selectedModuleForBay}
                  onChange={(e) => {
                    const found = warehouseModules.find(m => m.name === e.target.value || m.id === e.target.value);
                    setSelectedModuleForBay(found ? found.id : e.target.value);
                  }}
                />

                <Select
                  label="Uso Baia / Cliente Associato"
                  options={[
                    { value: '', label: 'Uso Generico (Tutti)' },
                    ...bayUsages.map(bu => ({ value: bu.id, label: bu.name }))
                  ]}
                  value={bayUsages.find(bu => bu.id === selectedUsageForBay)?.name || selectedUsageForBay}
                  onChange={(e) => {
                    const found = bayUsages.find(bu => bu.name === e.target.value || bu.id === e.target.value);
                    setSelectedUsageForBay(found ? found.id : e.target.value);
                  }}
                />

                <Input
                  label="Identificativo Baia (Nome) *"
                  placeholder="Es. Baia A-09"
                  value={newBayName}
                  onChange={(e) => setNewBayName(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full">
                  Crea Baia
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Hub e Corrispondenti Registrati">
              <Table
                data={depots}
                emptyMessage="Nessun plant registrato."
                columns={[
                  {
                    header: 'Codice Nodo',
                    accessor: (d: any) => <span className="font-mono font-bold text-xs text-ticket-accent">{d.id}</span>,
                  },
                  {
                    header: 'Nome Hub/Corrispondente',
                    accessor: (d: any) => <span className="font-bold">{d.name}</span>,
                  },
                  {
                    header: 'Indirizzo e Località',
                    accessor: (d: any) => (
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-700">{d.address || '-'}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {d.cap || ''} {d.city || ''} {d.province ? `(${d.province.toUpperCase()})` : ''} {d.country ? `- ${d.country}` : ''}
                        </span>
                      </div>
                    ),
                  },
                  {
                    header: 'Conteggio Baie',
                    accessor: (d: any) => (
                      (!d.type || d.type === 'HUB') ? (
                        <Badge variant="primary">
                          {bays.filter((b: any) => b.depotId === d.id).length} Baie
                        </Badge>
                      ) : (
                        <span className="text-gray-400 italic text-[10px] uppercase font-mono">Non applicabile</span>
                      )
                    ),
                  },
                  {
                    header: 'Azioni',
                    accessor: (d: any) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditFormError(null);
                            setEditingItem({
                              type: 'depot',
                              id: d.id,
                              fields: { name: d.name, city: d.city, address: d.address || '', cap: d.cap || '', province: d.province || '', country: d.country || 'Italia', type: d.type || 'HUB', shortCode: d.shortCode || '' }
                            });
                          }}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('depot', d.id, d.name)}
                        >
                          Elimina
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
 
            <Card title="Layout e Uso Baie del Yard (Gestione Rampa)">
              <p className="text-xs text-ticket-muted mb-4 font-mono uppercase">
                // Modifica al volo la destinazione d'uso o assegna le baie delle rampe a clienti specifici.
              </p>
              <Table
                data={bays}
                emptyMessage="Nessuna baia inserita a sistema."
                columns={[
                  {
                    header: 'Plant',
                    accessor: (b: any) => {
                      const dName = depots.find(d => d.id === b.depotId)?.name || 'Stabilimento';
                      return <span className="text-xs font-bold uppercase">{dName}</span>;
                    }
                  },
                  {
                    header: 'Modulo',
                    accessor: (b: any) => {
                      const mName = warehouseModules.find(m => m.id === b.moduleId)?.name || 'Nessuno';
                      return <span className="text-xs font-mono">{mName}</span>;
                    }
                  },
                  {
                    header: 'Identificativo Baia',
                    accessor: (b: any) => <span className="font-mono text-xs font-bold text-ticket-accent">{b.name}</span>
                  },
                  {
                    header: 'Uso Baia Attivo',
                    accessor: (b: any) => {
                      return (
                        <select
                           value={b.bayUsageId || ''}
                           onChange={(e) => updateBayUsage(b.id, e.target.value || undefined)}
                           className="bg-white border border-black/10 text-xs text-black font-mono p-1 rounded-md focus:ring-0 focus:outline-none cursor-pointer"
                        >
                          <option value="">Generico (Nessuno)</option>
                          {bayUsages.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      );
                    }
                  },
                  {
                    header: 'Stato Baia',
                    accessor: (b: any) => {
                      let badgeVar: 'success' | 'danger' | 'warning' = 'success';
                      if (b.status === 'OCCUPATA') badgeVar = 'danger';
                      if (b.status === 'MANUTENZIONE') badgeVar = 'warning';
                      return <Badge variant={badgeVar}>{b.status}</Badge>;
                    }
                  },
                  {
                    header: 'Attiva/Manutenzione',
                    accessor: (b: any) => {
                      const isMaintenance = b.status === 'MANUTENZIONE';
                      return (
                        <Button
                          size="sm"
                          variant={isMaintenance ? 'success' : 'warning'}
                          onClick={() => updateBayStatus(b.id, isMaintenance ? 'DISPONIBILE' : 'MANUTENZIONE')}
                        >
                          {isMaintenance ? 'Abilita' : 'Disabilita'}
                        </Button>
                      );
                    }
                  },
                  {
                    header: 'Azioni',
                    accessor: (b: any) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'bay',
                            id: b.id,
                            fields: { name: b.name, moduleId: b.moduleId || '', bayUsageId: b.bayUsageId || '' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('bay', b.id, b.name)}
                        >
                          Elimina
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: MODULI MAGAZZINO --- */}
      {adminTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Modulo Magazzino" accent="orange">
              <form onSubmit={handleAddModule} className="space-y-4">
                <Select
                  label="Stabilimento Plant"
                  options={depots.filter(d => d.type === 'HUB' || !d.type).map(d => ({ value: d.id, label: `${d.name} (${d.city})` }))}
                  value={depots.find(d => d.id === newModHubId)?.name || newModHubId}
                  onChange={(e) => {
                    const found = depots.find(d => d.name === e.target.value || d.id === e.target.value);
                    if (found) setNewModHubId(found.id);
                  }}
                />
                <Input
                  label="Nome Modulo Magazzino *"
                  placeholder="Es. Modulo A (Freschi)"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  required
                />
                <Input
                  label="Descrizione Modulo"
                  placeholder="Es. Temperatura controllata 4°C"
                  value={newModDesc}
                  onChange={(e) => setNewModDesc(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Crea Modulo
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Moduli Magazzino Configurati">
              <Table
                data={warehouseModules}
                emptyMessage="Nessun modulo magazzino registrato."
                columns={[
                  {
                    header: 'Plant Hub',
                    accessor: (m: any) => {
                      const dName = depots.find(d => d.id === m.depotId)?.name || 'Stabilimento';
                      return <span className="font-bold text-xs uppercase">{dName}</span>;
                    }
                  },
                  {
                    header: 'Modulo Magazzino',
                    accessor: (m: any) => <span className="font-mono text-xs font-bold text-ticket-accent">{m.name}</span>
                  },
                  {
                    header: 'Descrizione / Note',
                    accessor: (m: any) => <span>{m.description || '-'}</span>
                  },
                  {
                    header: 'Totale Baie Collegate',
                    accessor: (m: any) => (
                      <Badge variant="primary">
                        {bays.filter(b => b.moduleId === m.id).length} Baie Associate
                      </Badge>
                    )
                  },
                  {
                    header: 'Azioni',
                    accessor: (m: any) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingItem({
                            type: 'warehouseModule',
                            id: m.id,
                            fields: { depotId: m.depotId, name: m.name, description: m.description || '' }
                          })}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('warehouseModule', m.id, m.name)}
                        >
                          Elimina
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB: USO BAIE --- */}
      {adminTab === 'bayusages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <Card title="Nuovo Uso Baia / Riferimento Cliente" accent="orange">
              <form onSubmit={handleAddUsage} className="space-y-4">
                <Input
                  label="Nome Utilizzo / Cliente *"
                  placeholder="Es. Pallet vuoti o Cliente Rossi"
                  value={newUsageName}
                  onChange={(e) => setNewUsageName(e.target.value)}
                  required
                />
                <Input
                  label="Descrizione"
                  placeholder="Dettagli sulle merci o logistica di prossimità..."
                  value={newUsageDesc}
                  onChange={(e) => setNewUsageDesc(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Salva Anagrafica Uso
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Anagrafiche Usi Baia e Attività Prossimità">
              <Table
                data={bayUsages}
                emptyMessage="Nessun uso baia registrato."
                columns={[
                  {
                    header: 'Codice Uso',
                    accessor: (bu: any) => <span className="font-mono font-bold text-xs text-ticket-accent">{bu.id}</span>
                  },
                  {
                    header: 'Utilizzo / Riferimento',
                    accessor: (bu: any) => <span className="font-bold text-xs">{bu.name}</span>
                  },
                  {
                    header: 'Descrizione Operativa',
                    accessor: (bu: any) => <span>{bu.description || '-'}</span>
                  },
                  {
                    header: 'Rampe Collegate',
                    accessor: (bu: any) => (
                      <Badge variant="info">
                        {bays.filter((b: any) => b.bayUsageId === bu.id).length} Baie Attive
                      </Badge>
                    )
                  },
                  {
                    header: 'Gestisci',
                    accessor: (bu: any) => (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setConfirmDialogState({
                            isOpen: true,
                            title: 'Conferma Rimozione',
                            message: `Rimuovendo ${bu.name}, le ralle collegate torneranno ad uso Generico. Sei sicuro di voler procedere?`,
                            confirmLabel: 'Rimuovi',
                            isDanger: true,
                            onConfirm: () => {
                              deleteBayUsage(bu.id);
                              setConfirmDialogState(prev => ({ ...prev, isOpen: false }));
                            }
                          });
                        }}
                      >
                        Elimina
                      </Button>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </div>
      )}
    </>
  );
};




