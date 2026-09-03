import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';
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
    <div className="space-y-6 animate-fade-in font-mono">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header Tabellone */}
        <div className="bg-black text-white p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className={`text-xl font-bold tracking-[0.2em] ${stationSubTab === 'arrivi' ? 'text-amber-400' : 'text-emerald-400'}`}>
              [ STATION BOARD ] {stationSubTab === 'arrivi' ? 'ARRIVI' : 'PARTENZE'}
            </h2>
            <p className="text-xs text-slate-400 tracking-widest mt-1">
              DATA: {formattedDate} // HUB: {depots.find(d => d.id === selectedDepotId)?.name || selectedDepotId}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setStationSubTab('arrivi')}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all rounded cursor-pointer border ${
                stationSubTab === 'arrivi'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:bg-white/10'
              }`}
            >
              ▶ Arrivi ({arrivi.length})
            </button>
            <button
              onClick={() => setStationSubTab('partenze')}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all rounded cursor-pointer border ${
                stationSubTab === 'partenze'
                  ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:bg-white/10'
              }`}
            >
              ▶ Partenze ({partenze.length})
            </button>
          </div>
        </div>

        {/* Tabella Dati */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead className="bg-slate-800/80 text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 font-normal text-center">Stato</th>
                <th className="px-4 py-3 font-normal">Orario</th>
                <th className="px-4 py-3 font-normal">Vettore / Targa</th>
                <th className="px-4 py-3 font-normal">Viaggio / CLI</th>
                <th className="px-4 py-3 font-normal">Committente</th>
                <th className="px-4 py-3 font-normal">Itinerario</th>
                <th className="px-4 py-3 font-normal">Carico</th>
                <th className="px-4 py-3 font-normal text-center">Baia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-900 text-slate-200">
              {activeData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500 italic tracking-widest">
                    NESSUN {stationSubTab === 'arrivi' ? 'ARRIVO' : 'VIAGGIO IN PARTENZA'} PREVISTO
                  </td>
                </tr>
              ) : (
                activeData.map((g, index) => {
                  const bookedShipment = g.shipments.find((s: any) => s.bookingId);
                  const booking = bookedShipment ? bookings.find(b => b.id === bookedShipment.bookingId) : null;
                  const firstShipment = g.shipments[0];
                  const carrierName = carriers.find(c => c.id === g.carrierId)?.name || 'N/D';
                  const clientName = clients.find(c => c.id === firstShipment?.clientId)?.name || 'Multi-Committente';
                  const bay = booking?.bayId ? bays.find(b => b.id === booking.bayId) : null;

                  return (
                    <tr key={g.id || index} className="hover:bg-slate-800/50 transition-colors">
                      {/* STATO */}
                      <td className="px-4 py-3 text-center">
                        {!booking ? <Badge variant="secondary" className="border-slate-600 text-slate-400">DA ABBINARE</Badge> :
                         booking.status === 'COMPLETATO' ? <Badge variant="secondary" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">COMPLETATO</Badge> :
                         booking.status === 'IN_BAIA' ? <Badge variant="secondary" className="border-amber-500/50 text-amber-400 bg-amber-500/20 animate-pulse">IN BAIA</Badge> :
                         booking.status === 'AL_CANCELLO' ? <Badge variant="secondary" className="border-sky-500/50 text-sky-400 bg-sky-500/20">IN PIAZZALE</Badge> :
                         <Badge variant="secondary" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">IN VIAGGIO</Badge>}
                      </td>
                      
                      {/* ORARIO */}
                      <td className="px-4 py-3">
                        <div className={`text-xl font-bold tracking-tight ${stationSubTab === 'arrivi' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {g.expectedTime || '--:--'}
                        </div>
                      </td>

                      {/* VETTORE & TARGA */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-200 truncate max-w-[140px] uppercase">{carrierName}</div>
                        {booking?.licensePlate ? (
                          <div className="text-[11px] text-slate-900 font-bold bg-slate-300 px-1.5 py-0.5 rounded-sm inline-block mt-0.5 tracking-widest border border-slate-400">
                            {booking.licensePlate}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-600 mt-0.5">Targa assente</div>
                        )}
                      </td>

                      {/* VIAGGIO */}
                      <td className="px-4 py-3">
                        {g.tripId ? (
                          <span className="font-bold text-indigo-300 block">INT: {g.tripId}</span>
                        ) : (
                          <span className="text-slate-500 italic block text-xs">Viaggio Diretto</span>
                        )}
                        {(firstShipment?.clientTripNumber || firstShipment?.orderNumber) && (
                          <span className="text-[10px] text-slate-400 block uppercase">
                            CLI: {firstShipment?.clientTripNumber || firstShipment?.orderNumber}
                          </span>
                        )}
                      </td>

                      {/* COMMITTENTE */}
                      <td className="px-4 py-3 font-bold text-slate-300 uppercase text-xs truncate max-w-[120px]">
                        {clientName}
                      </td>

                      {/* ITINERARIO */}
                      <td className="px-4 py-3">
                        <div className="bg-slate-900 rounded p-1 border border-slate-700/50">
                           <TripRouteSequence shipments={g.shipments} depots={depots} selectedDepotId={selectedDepotId} />
                        </div>
                      </td>

                      {/* CARICO */}
                      <td className="px-4 py-3">
                        <div className="text-emerald-400 font-bold">{g.totalPallets} PLT</div>
                        <div className="text-[10px] text-slate-500">{g.totalGrossWeight} kg</div>
                        {g.shipments.length > 1 && (
                          <div className="text-[9px] text-amber-500 font-bold mt-0.5">Multi-drop ({g.shipments.length})</div>
                        )}
                      </td>

                      {/* BAIA */}
                      <td className="px-4 py-3 text-center">
                        {bay ? (
                          <div className="font-bold text-2xl text-amber-400 bg-black w-10 h-10 flex items-center justify-center rounded border border-slate-700 mx-auto shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                            {bay.name.replace('BAIA ', '')}
                          </div>
                        ) : (
                          <span className="text-slate-700 text-xl font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

