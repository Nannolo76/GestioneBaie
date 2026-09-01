import React, { useState } from 'react';

export const TripRouteSequence: React.FC<{ 
  shipments: any[]; 
  selectedDepotId: string; 
  depots: any[]; 
}> = ({ shipments, selectedDepotId, depots }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const validShipments = [...shipments].reverse().filter(s => s.orderNumber && s.orderNumber.trim() !== '');
  
  if (validShipments.length === 0) return <span className="text-gray-400">-</span>;
  
  const timelineStops = validShipments.reduce((acc, stop) => {
    const isHub = stop.tipoStop === 'HUB_TRANSIT' || stop.tipoStop === 'CORRISPONDENTE';
    const currentId = isHub ? stop.destinationNodeId : `${stop.realDestinationName}-${stop.realDestinationCity}`;
    
    if (acc.length > 0) {
      const prevObj = acc[acc.length - 1];
      const prevStop = prevObj.stop;
      const prevIsHub = prevStop.tipoStop === 'HUB_TRANSIT' || prevStop.tipoStop === 'CORRISPONDENTE';
      const prevId = prevIsHub ? prevStop.destinationNodeId : `${prevStop.realDestinationName}-${prevStop.realDestinationCity}`;
      if (currentId && currentId === prevId) {
        prevObj.count += 1;
        return acc;
      }
    }
    return [...acc, { stop, count: 1 }];
  }, [] as { stop: typeof validShipments[0], count: number }[]);

  const elements: React.ReactNode[] = [];
  
  // Origin
  const originDepot = depots.find(d => d.id === selectedDepotId);
  const isOutbound = validShipments[0]?.tipoOperazioneHub === 'OUTBOUND' || validShipments[0]?.tipoOperazioneHub === 'TRANSITO';
  let originLabel = '';
  let originTitle = '';
  let originColor = '';

  if (isOutbound) {
    originLabel = originDepot?.shortCode || originDepot?.city || 'HUB';
    originTitle = originDepot?.name || 'Hub di Partenza';
    originColor = 'bg-blue-100 text-blue-800 border-blue-300';
  } else {
    const firstStop = timelineStops[0]?.stop;
    if (firstStop?.tipoStop === 'HUB_TRANSIT') {
      const h = depots.find(d => d.id === firstStop.destinationNodeId);
      originLabel = h?.shortCode || h?.city || 'HUB';
      originTitle = h?.name || 'Hub Interno';
      originColor = 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (firstStop?.tipoStop === 'CORRISPONDENTE') {
      const c = depots.find(d => d.id === firstStop.destinationNodeId);
      originLabel = c?.shortCode || c?.name || 'CORR';
      originTitle = c?.name || 'Corrispondente';
      originColor = 'bg-orange-100 text-orange-800 border-orange-300';
    } else {
      originLabel = firstStop?.realOriginCity || firstStop?.originOrDestination || 'DIR';
      originTitle = firstStop?.realOriginName || 'Consegna Diretta';
      originColor = 'bg-rose-100 text-rose-800 border-rose-300';
    }
  }
        
  elements.push(
    <span key="origin" className={`px-2 py-0.5 rounded-md border text-[10px] font-bold shrink-0 shadow-sm flex items-center gap-1 ${originColor}`} title={originTitle}>
      {originColor.includes('blue') ? '🏢' : originColor.includes('orange') ? '🤝' : '📍'} {originLabel}
    </span>
  );

  let lastLabel = originLabel;
  const filteredStops = timelineStops.filter((ts: any) => {
    const isHub = ts.stop.tipoStop === 'HUB_TRANSIT';
    const isCorr = ts.stop.tipoStop === 'CORRISPONDENTE';
    const d = depots.find(dep => dep.id === ts.stop.destinationNodeId);
    let label = '';
    
    if (isHub) label = d?.shortCode || d?.city || 'HUB';
    else if (isCorr) label = d?.shortCode || d?.name || 'CORR';
    else label = ts.stop.realDestinationCity || ts.stop.originOrDestination || ts.stop.city || 'DIR';

    // Prevent redundant immediate repeats
    if (label === lastLabel) {
      return false; // skip this stop as it's redundant
    }
    lastLabel = label;
    return true;
  });

  const displayStops = (isExpanded || filteredStops.length <= 3) 
    ? filteredStops 
    : filteredStops.slice(0, 2);

  const hiddenCount = filteredStops.length - displayStops.length;

  displayStops.forEach(({ stop, count }: { stop: any; count: number }, idx: number) => {
    const isHub = stop.tipoStop === 'HUB_TRANSIT';
    const isCorr = stop.tipoStop === 'CORRISPONDENTE';
    const d = depots.find(dep => dep.id === stop.destinationNodeId);
    
    let label = '';
    let title = '';
    let icon = '';
    let color = '';
    
    if (isHub) {
      label = d?.shortCode || d?.city || 'HUB';
      title = d?.name || 'Hub Interno';
      icon = '🏢';
      color = 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (isCorr) {
      label = d?.shortCode || d?.name || 'CORR';
      title = d?.name || 'Corrispondente';
      icon = '🤝';
      color = 'bg-orange-100 text-orange-800 border-orange-300';
    } else {
      label = stop.realDestinationCity || stop.originOrDestination || stop.city || 'DIR';
      title = stop.realDestinationName || 'Consegna Diretta';
      icon = '📍';
      color = 'bg-rose-100 text-rose-800 border-rose-300';
    }
    
    const suffix = count > 1 ? ` (${count})` : '';
    
    elements.push(
      <span key={`arrow-${idx}`} className="text-gray-400 mx-0.5 shrink-0 text-[10px]">➔</span>
    );
    elements.push(
      <span key={`stop-${idx}`} className={`px-2 py-0.5 rounded-md border text-[10px] font-bold shrink-0 shadow-sm flex items-center gap-1 ${color}`} title={`${title}${suffix}`}>
        {icon} <span>{label}</span>
        {count > 1 && <span className="ml-1 px-1 bg-white/50 rounded-sm text-[8px]">{count}</span>}
      </span>
    );
  });
  
  if (hiddenCount > 0) {
    elements.push(
      <span key="arrow-hidden" className="text-gray-400 mx-0.5 shrink-0 text-[10px]">➔</span>
    );
    elements.push(
      <button 
        key="btn-hidden" 
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md cursor-pointer shrink-0 transition-colors border border-slate-300 shadow-sm"
      >
        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-700">
          + Altri {hiddenCount} stop...
        </span>
      </button>
    );
  }

  // Se è stato espanso, dai l'opzione di collassare di nuovo
  if (isExpanded && filteredStops.length > 3) {
    elements.push(
      <button 
        key="btn-collapse" 
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(false);
        }}
        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 ml-1 px-2 py-0.5 rounded-md cursor-pointer shrink-0 transition-colors border border-slate-300 shadow-sm"
      >
        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-700">
          Riduci
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 max-w-full">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tratta / Itinerario:</span>
      <div className="flex flex-wrap items-center gap-y-1.5 w-full">
        {elements}
      </div>
    </div>
  );
};
