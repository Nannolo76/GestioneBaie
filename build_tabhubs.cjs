const fs = require('fs');

const tabHubsHeader = `import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface TabHubsProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
  comuni: any[];
}

export const TabHubs: React.FC<TabHubsProps> = ({ setEditingItem, setConfirmDialogState, comuni }) => {
  const {
    depots,
    warehouseModules,
    bays,
    bayUsages,
    addDepot,
    deleteDepot,
    addWarehouseModule,
    deleteWarehouseModule,
    addBay,
    deleteBay,
    updateBayStatus,
    addBayUsage,
    deleteBayUsage
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
      setHubFormError(\`La sigla "\${normalizedShortCode}" è già in uso. Inserisci una sigla univoca.\`);
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

  const handleAddBayUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsageName) return;
    addBayUsage(newUsageName, newUsageDesc);
    setNewUsageName(''); setNewUsageDesc('');
  };

  return (
`;

const jsxContent = fs.readFileSync('src/components/admin/TabHubs.tsx', 'utf8');

const fullFile = tabHubsHeader + jsxContent + '\n  );\n};\n';

fs.writeFileSync('src/components/admin/TabHubs.tsx', fullFile);
console.log('TabHubs.tsx assembled successfully!');
