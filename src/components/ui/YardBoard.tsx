import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';
import { Table } from './Table';
import { Card } from './Card';
import { TripRouteSequence } from './TripRouteSequence';

export const YardBoard: React.FC = () => {
  const { shipments, selectedDepotId, clients, carriers, bookings, depots, bays } = useApp();
  const [stationSubTab, setStationSubTab] = useState<'arrivi' | 'partenze'>('arrivi');

  // Raggruppa per Trip (o per singola spedizione se tripId manca)
  const tripGroups = useMemo(() => {
    const groups = new Map<string, any>();
    
    shipments.forEach(s => {
      // Considera solo spedizioni legate al depot corrente
      if (s.depotId !== selectedDepotId && 
          s.hubOrigineOperativo !== selectedDepotId && 
          s.hubDestinazioneOperativo !== selectedDepotId) {
        return;
      }

      const tripKey = s.tripId || s.id;
      if (!groups.has(tripKey)) {
        groups.set(tripKey, {
          id: tripKey,
          tripId: s.tripId || '',
          activityType: s.activityType,
          carrierId: s.carrierId,
          totalPallets: 0,
          totalGrossWeight: 0,
          expectedDate: s.expectedDate,
          expectedTime: s.expectedTime,
          shipments: [],
          // Determina se è arrivo o partenza per questo depot
          isArrivo: (s.hubOrigineOperativo === selectedDepotId && s.tipoOperazioneHub === 'INBOUND') || (!s.hubOrigineOperativo && s.depotId === selectedDepotId && s.activityType !== 'CARICO'),
          isPartenza: (s.hubDestinazioneOperativo === selectedDepotId && s.tipoOperazioneHub === 'OUTBOUND') || (!s.hubDestinazioneOperativo && s.depotId === selectedDepotId && s.activityType === 'CARICO')
        });
      }
      
      const group = groups.get(tripKey);
      group.shipments.push(s);
      group.totalPallets += s.palletPlaces || 0;
      group.totalGrossWeight += s.grossWeight || 0;
    });

    return Array.from(groups.values()).sort((a, b) => {
      const dateComp = (a.expectedDate || '').localeCompare(b.expectedDate || '');
      if (dateComp !== 0) return dateComp;
      return (a.expectedTime || '').localeCompare(b.expectedTime || '');
    });
  }, [shipments, selectedDepotId]);

  const arrivi = tripGroups.filter(g => g.isArrivo);
  const partenze = tripGroups.filter(g => g.isPartenza);

  const activeData = stationSubTab === 'arrivi' ? arrivi : partenze;

  // Use the date of the first record if available, else today
  let displayDate = new Date().toISOString().split('T')[0];
  if (activeData.length > 0 && activeData[0].expectedDate) {
    displayDate = activeData[0].expectedDate;
  }
  const dateObj = new Date(displayDate);
  const formattedDate = !isNaN(dateObj.getTime()) 
    ? dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
    : displayDate;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card
        title={`STATION BOARD - ${stationSubTab === 'arrivi' ? 'ARRIVI' : 'PARTENZE'} DEL ${formattedDate}`}
        accent={stationSubTab === 'arrivi' ? 'orange' : 'green'}
        headerAction={
          <div className="flex gap-2 font-mono">
            <button
              onClick={() => setStationSubTab('arrivi')}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded-lg cursor-pointer border ${
                stationSubTab === 'arrivi'
                  ? 'bg-[#004B97] text-white border-[#004B97] shadow-xs'
                  : 'bg-transparent text-gray-500 border-black/10 hover:text-black hover:bg-white/20'
              }`}
            >
              🛬 Arrivi ({arrivi.length})
            </button>
            <button
              onClick={() => setStationSubTab('partenze')}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded-lg cursor-pointer border ${
                stationSubTab === 'partenze'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-transparent text-gray-500 border-black/10 hover:text-black hover:bg-white/20'
              }`}
            >
              🛫 Partenze ({partenze.length})
            </button>
          </div>
        }
      >
        <Table
          data={activeData}
          emptyMessage={`Nessun ${stationSubTab === 'arrivi' ? 'arrivo' : 'viaggio in partenza'} per questo stabilimento.`}
          columns={[
            {
              header: 'Stato',
              className: "w-28 text-center",
              accessor: (g) => {
                const bookedShipment = g.shipments.find((s: any) => s.bookingId);
                const booking = bookedShipment ? bookings.find(b => b.id === bookedShipment.bookingId) : null;
                
                if (!booking) return <Badge variant="warning">DA ABBINARE</Badge>;
                if (booking.status === 'COMPLETATO') return <Badge variant="success">COMPLETATO</Badge>;
                if (booking.status === 'IN_BAIA') return <Badge variant="primary" className="animate-pulse">IN BAIA</Badge>;
                if (booking.status === 'AL_CANCELLO') return <Badge variant="success">IN PIAZZALE</Badge>;
                return <Badge variant="info">IN VIAGGIO</Badge>;
              }
            },
            {
              header: 'Viaggio',
              accessor: (g) => {
                const firstShipment = g.shipments[0];
                return (
                  <div className="text-xs font-sans">
                    {g.tripId ? (
                      <span className="font-bold text-amber-600 block bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 w-max mb-1">
                        INT: {g.tripId}
                      </span>
                    ) : (
                      <span className="font-bold text-gray-700 block italic">Viaggio Diretto</span>
                    )}
                    {(firstShipment?.clientTripNumber || firstShipment?.orderNumber) && (
                      <span className="text-[10px] text-gray-500 font-bold block mt-1 uppercase">
                        CLI: {firstShipment?.clientTripNumber || firstShipment?.orderNumber}
                      </span>
                    )}
                  </div>
                );
              }
            },
            {
              header: 'Orario',
              accessor: (g) => (
                <div className="text-lg font-mono font-bold text-gray-800 tracking-tight">
                  {g.expectedTime || '--:--'}
                </div>
              )
            },
            {
              header: 'Prevista Cons.',
              accessor: (g) => {
                const deliveryDates = g.shipments.map((s: any) => s.expectedDeliveryDate).filter(Boolean);
                const firstDeliveryDate = deliveryDates.length > 0 ? deliveryDates[0] : null;
                
                return firstDeliveryDate ? (
                  <div className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 w-max">
                    {new Date(firstDeliveryDate).toLocaleDateString('it-IT')}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                );
              }
            },
            {
              header: 'Committente',
              accessor: (g) => {
                const firstShipment = g.shipments[0];
                const clientName = clients.find(c => c.id === firstShipment?.clientId)?.name || 'Multi-Committente';
                return (
                  <div className="text-xs font-sans font-bold uppercase text-gray-700">
                    {clientName}
                  </div>
                );
              }
            },
            {
              header: 'Vettore & Targa',
              accessor: (g) => {
                const carrierName = carriers.find(c => c.id === g.carrierId)?.name || 'Vettore Non Assegnato';
                const bookedShipment = g.shipments.find((s: any) => s.bookingId);
                const booking = bookedShipment ? bookings.find(b => b.id === bookedShipment.bookingId) : null;
                
                return (
                  <div className="text-xs font-mono">
                    <span className="font-bold text-gray-800 block truncate max-w-[120px]">{carrierName}</span>
                    {booking?.licensePlate ? (
                      <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-1 border border-blue-200 rounded mt-0.5 inline-block">
                        {booking.licensePlate}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Targa assente</span>
                    )}
                  </div>
                );
              }
            },
            {
              header: 'Itinerario',
              accessor: (g) => (
                <TripRouteSequence shipments={g.shipments} depots={depots} selectedDepotId={selectedDepotId} />
              )
            },
            {
              header: 'Carico',
              accessor: (g) => (
                <div className="text-xs font-mono">
                  <span className="font-bold text-gray-800">{g.totalPallets} PLT</span>
                  <span className="block text-[10px] text-gray-500">{g.totalGrossWeight} kg</span>
                  {g.shipments.length > 1 && (
                    <span className="text-[9px] text-amber-600 font-bold">Multi-drop ({g.shipments.length})</span>
                  )}
                </div>
              )
            },
            {
              header: 'Baia',
              className: "w-20 text-center",
              accessor: (g) => {
                const bookedShipment = g.shipments.find((s: any) => s.bookingId);
                const booking = bookedShipment ? bookings.find(b => b.id === bookedShipment.bookingId) : null;
                const bay = booking?.bayId ? bays.find(b => b.id === booking.bayId) : null;
                
                if (!bay) return <span className="text-gray-300 text-xs">-</span>;
                return (
                  <span className="font-mono font-bold text-lg text-emerald-600 bg-emerald-50 w-8 h-8 flex items-center justify-center rounded-lg mx-auto border border-emerald-200">
                    {bay.name}
                  </span>
                );
              }
            }
          ]}
        />
      </Card>
    </div>
  );
};
