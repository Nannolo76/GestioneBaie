import React from 'react';

export const TripRouteSequence: React.FC<{ 
  shipments: any[]; 
  selectedDepotId: string; 
  depots: any[]; 
}> = ({ shipments, selectedDepotId, depots }) => {
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
        : timelineStops[0]?.stop?.realOriginCity || 'DIR');
        
  elements.push(
    <span key="origin" className="flex items-center gap-1">
      🏢 <span>{originName}</span>
    </span>
  );

  timelineStops.forEach(({ stop, count }: { stop: any; count: number }, idx: number) => {
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
      label = stop.realDestinationCity || 'DIR';
      icon = '📍';
    }
    
    const suffix = count > 1 ? ` (${count} sped.)` : isHub || isCorr ? '' : ' (Diretta)';
    
    elements.push(
      <span key={`arrow-${idx}`} className="text-gray-500 mx-1">➔</span>
    );
    elements.push(
      <span key={`stop-${idx}`} className="flex items-center gap-1" title={`${label}${suffix}`}>
        {icon} <span>{label}</span><span className="text-gray-400">{suffix}</span>
      </span>
    );
  });
  
  return (
    <div className="flex flex-col gap-1.5 max-w-full">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tratta / Itinerario:</span>
      <div className="bg-[#1C1C1E] text-gray-300 px-3 py-1.5 rounded-full inline-flex items-center text-[11px] font-mono whitespace-nowrap overflow-x-auto max-w-full hide-scrollbar border border-black/20 shadow-inner">
        {elements}
      </div>
    </div>
  );
};
