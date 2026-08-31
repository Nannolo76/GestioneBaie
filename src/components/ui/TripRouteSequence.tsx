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
  const originName = validShipments[0]?.tipoOperazioneHub === 'OUTBOUND' || validShipments[0]?.tipoOperazioneHub === 'TRANSITO'
    ? (depots.find(d => d.id === selectedDepotId)?.name || 'HUB')
    : (timelineStops[0]?.stop?.tipoStop === 'HUB_TRANSIT' || timelineStops[0]?.stop?.tipoStop === 'CORRISPONDENTE' 
        ? timelineStops[0]?.stop?.destinationNodeName || 'HUB'
        : timelineStops[0]?.stop?.realOriginCity || timelineStops[0]?.stop?.originOrDestination || 'DIR');
        
  elements.push(
    <span key="origin" className="flex items-center gap-1 shrink-0">
      🏢 <span>{originName}</span>
    </span>
  );

  let lastLabel = originName;
  const filteredStops = timelineStops.filter((ts: any) => {
    const isHub = ts.stop.tipoStop === 'HUB_TRANSIT';
    const isCorr = ts.stop.tipoStop === 'CORRISPONDENTE';
    let label = '';
    if (isHub) label = ts.stop.destinationNodeName || 'HUB';
    else if (isCorr) label = ts.stop.destinationNodeName || 'CORR';
    else label = ts.stop.realDestinationCity || ts.stop.originOrDestination || ts.stop.city || 'DIR';

    // Prevent redundant immediate repeats (e.g. Origin -> Origin)
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
    
    let label = '';
    let icon = '';
    
    if (isHub) {
      label = stop.destinationNodeName || 'HUB';
      icon = '🏢';
    } else if (isCorr) {
      label = stop.destinationNodeName || 'CORR';
      icon = '🤝';
    } else {
      label = stop.realDestinationCity || stop.originOrDestination || stop.city || 'DIR';
      icon = '📍';
    }
    
    const suffix = count > 1 ? ` (${count} sped.)` : isHub || isCorr ? '' : '';
    
    elements.push(
      <span key={`arrow-${idx}`} className="text-gray-500 mx-0.5 shrink-0">➔</span>
    );
    elements.push(
      <span key={`stop-${idx}`} className="flex items-center gap-1 shrink-0" title={`${label}${suffix}`}>
        {icon} <span>{label}</span><span className="text-gray-400">{suffix}</span>
      </span>
    );
  });
  
  if (hiddenCount > 0) {
    elements.push(
      <span key="arrow-hidden" className="text-gray-500 mx-0.5 shrink-0">➔</span>
    );
    elements.push(
      <button 
        key="btn-hidden" 
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
        className="flex items-center gap-1 bg-blue-50/50 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer shrink-0 transition-colors border border-blue-100"
      >
        <span className="text-[9px] uppercase font-bold tracking-wider text-blue-700">
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
        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 ml-2 px-2 py-0.5 rounded cursor-pointer shrink-0 transition-colors border border-slate-200"
      >
        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-600">
          Riduci
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 max-w-full">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tratta / Itinerario:</span>
      <div className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl inline-flex flex-wrap items-center gap-y-1 text-[11px] font-mono border border-slate-200 shadow-sm">
        {elements}
      </div>
    </div>
  );
};
