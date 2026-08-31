import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';
import { Input, Select } from './Input';
import { Button } from './Button';

export const ShipmentsGrid: React.FC = () => {
  const { shipments, selectedDepotId, clients, carriers } = useApp();

  // Filters state
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterTrip, setFilterTrip] = useState('');
  const [filterCity, setFilterCity] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Derive unique options for filters
  const clientOptions = useMemo(() => {
    return [
      { value: '', label: 'Tutti i Committenti' },
      ...clients.map(c => ({ value: c.id, label: c.name }))
    ];
  }, [clients]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    shipments.forEach(s => {
      const city = s.realDestinationCity || s.originOrDestination || s.city;
      if (city) cities.add(city.toUpperCase());
    });
    return [
      { value: '', label: 'Tutte le Destinazioni' },
      ...Array.from(cities).sort().map(c => ({ value: c, label: c }))
    ];
  }, [shipments]);

  // Filter logic
  const filteredShipments = useMemo(() => {
    let result = shipments.filter(s => {
      // Must belong to current depot (origin or destination or depot)
      const isForThisDepot = s.depotId === selectedDepotId || 
                             s.hubOrigineOperativo === selectedDepotId || 
                             s.hubDestinazioneOperativo === selectedDepotId;
      if (!isForThisDepot) return false;

      // Filter by Client
      if (filterClient && s.clientId !== filterClient) return false;

      // Filter by Trip
      if (filterTrip && (!s.tripId || !s.tripId.toLowerCase().includes(filterTrip.toLowerCase()))) return false;

      // Filter by City
      if (filterCity) {
        const sCity = (s.realDestinationCity || s.originOrDestination || s.city || '').toUpperCase();
        if (sCity !== filterCity) return false;
      }

      // Global Search (DDT, Delivery, Client Name)
      if (globalSearch) {
        const query = globalSearch.toLowerCase();
        const cName = clients.find(c => c.id === s.clientId)?.name.toLowerCase() || '';
        const order1 = (s.orderNumber || '').toLowerCase();
        const order2 = (s.orderNumber2 || '').toLowerCase();
        
        if (!cName.includes(query) && !order1.includes(query) && !order2.includes(query)) {
          return false;
        }
      }

      return true;
    });

    // Sort by expected date descending (or any other logic)
    result.sort((a, b) => {
      const dateA = a.expectedDate ? new Date(a.expectedDate).getTime() : 0;
      const dateB = b.expectedDate ? new Date(b.expectedDate).getTime() : 0;
      return dateB - dateA;
    });

    return result;
  }, [shipments, selectedDepotId, filterClient, filterTrip, filterCity, globalSearch, clients]);

  // Pagination logic
  const totalPages = Math.ceil(filteredShipments.length / ITEMS_PER_PAGE) || 1;
  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredShipments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredShipments, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Helper to format status
  const getStatusBadge = (shipment: any) => {
    const status = shipment.status || 'DA_PIANIFICARE';
    
    // Derived status logic based on booking presence
    if (shipment.bookingId) {
      return <Badge variant="success">IN VIAGGIO / A BORDO</Badge>;
    }
    
    switch (status) {
      case 'DA_PIANIFICARE': return <Badge variant="primary">IN MAGAZZINO</Badge>;
      case 'PIANIFICATO': return <Badge variant="info">PIANIFICATO</Badge>;
      case 'COMPLETATO': return <Badge variant="success">CONSEGNATO</Badge>;
      default: return <Badge variant="primary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in border border-black/10 rounded-xl overflow-hidden shadow-sm">
      {/* Header & Filters */}
      <div className="bg-gray-50 border-b border-black/10 p-4 space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <Input 
              label="Ricerca Globale" 
              placeholder="Cerca per DDT, Delivery, o Committente..." 
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white"
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              label="Filtra Committente" 
              options={clientOptions}
              value={filterClient}
              onChange={(e) => {
                setFilterClient(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              label="Filtra Destinazione" 
              options={cityOptions}
              value={filterCity}
              onChange={(e) => {
                setFilterCity(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="w-full md:w-48">
            <Input 
              label="Codice Viaggio" 
              placeholder="Cerca ID viaggio..." 
              value={filterTrip}
              onChange={(e) => {
                setFilterTrip(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs font-mono whitespace-nowrap">
          <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
            <tr className="border-b border-black/10">
              <th className="px-4 py-3 text-gray-500 uppercase tracking-widest font-bold">Riferimenti Documentali</th>
              <th className="px-4 py-3 text-gray-500 uppercase tracking-widest font-bold">Dati Destinatario</th>
              <th className="px-4 py-3 text-gray-500 uppercase tracking-widest font-bold">Dati Fisici del Carico</th>
              <th className="px-4 py-3 text-gray-500 uppercase tracking-widest font-bold">Assegnazione Viaggio</th>
              <th className="px-4 py-3 text-gray-500 uppercase tracking-widest font-bold">Stato Spedizione</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {paginatedShipments.length > 0 ? (
              paginatedShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-4 py-3 align-top max-w-[200px]">
                    <div className="flex flex-col gap-1 truncate">
                      <span className="font-bold text-black text-[13px] truncate">
                        {clients.find(c => c.id === shipment.clientId)?.name || 'Sconosciuto'}
                      </span>
                      <span className="text-gray-500 truncate" title={shipment.orderNumber}>
                        Delivery: <span className="font-bold text-gray-700">{shipment.orderNumber}</span>
                      </span>
                      {shipment.orderNumber2 && (
                        <span className="text-gray-500 truncate" title={shipment.orderNumber2}>
                          DDT/Ordine: <span className="font-bold text-gray-700">{shipment.orderNumber2}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 align-top max-w-[250px] whitespace-normal">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-black text-[13px] leading-tight">
                        {shipment.realDestinationName || shipment.subjectName || 'Sconosciuto'}
                      </span>
                      <span className="text-gray-500 leading-tight">
                        {shipment.realDestinationCity || shipment.originOrDestination || shipment.city || 'N/D'} 
                        {shipment.realDestinationProvince ? ` (${shipment.realDestinationProvince})` : ''}
                      </span>
                      {(shipment.realDestinationCap || shipment.cap) && (
                        <span className="text-gray-400">CAP: {shipment.realDestinationCap || shipment.cap}</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-700">
                        <span className="font-bold text-black">{shipment.palletPlaces || 0}</span> PLT
                      </span>
                      <span className="text-gray-700">
                        <span className="font-bold text-black">{shipment.grossWeight || 0}</span> KG
                      </span>
                      {shipment.goodsType && (
                        <span className="text-gray-400 truncate max-w-[120px] inline-block" title={shipment.goodsType}>
                          {shipment.goodsType}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    {shipment.tripId ? (
                      <div className="flex flex-col gap-1 items-start">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          TRIP: {shipment.tripId}
                        </span>
                        {shipment.clientTripNumber && (
                          <span className="text-gray-500 text-[10px]">Rif: {shipment.clientTripNumber}</span>
                        )}
                        {shipment.carrierId && (
                          <span className="text-gray-500 text-[10px] truncate max-w-[150px]">
                            {carriers.find(c => c.id === shipment.carrierId)?.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-[11px]">Nessun viaggio assegnato</span>
                    )}
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-start gap-1">
                      {getStatusBadge(shipment)}
                      {shipment.routingStatus === 'DA_CONFERMARE' && (
                        <span className="text-[10px] text-orange-600 flex items-center gap-1 mt-1">
                          ⚠️ Routing ambiguo
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    Nessuna spedizione trovata per i criteri di ricerca.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-gray-50 border-t border-black/10 p-4 shrink-0 flex items-center justify-between">
        <div className="text-xs text-gray-500 font-mono">
          Visualizzazione di <span className="font-bold text-black">{paginatedShipments.length}</span> su <span className="font-bold text-black">{filteredShipments.length}</span> spedizioni
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-xs"
          >
            Precedente
          </Button>
          
          <div className="flex items-center gap-1 mx-2">
            <span className="text-xs font-mono font-bold">Pagina {currentPage} di {totalPages}</span>
          </div>

          <Button 
            variant="secondary" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-xs"
          >
            Successiva
          </Button>
        </div>
      </div>
    </div>
  );
};
