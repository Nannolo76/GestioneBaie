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

  const badges: React.ReactNode[] = [];
  
  // Origin
  const originName = validShipments[0]?.tipoOperazioneHub === 'OUTBOUND' || validShipments[0]?.tipoOperazioneHub === 'TRANSITO'
    ? (depots.find(d => d.id === selectedDepotId)?.name || 'HUB')
    : (timelineStops[0]?.stop?.tipoStop === 'HUB_TRANSIT' || timelineStops[0]?.stop?.tipoStop === 'CORRISPONDENTE' 
        ? timelineStops[0]?.stop?.destinationNodeName || 'HUB'
        : timelineStops[0]?.stop?.realOriginCity || 'DIR');
        
  badges.push(<span key="origin" className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-gray-300 break-words max-w-[120px] line-clamp-1 flex-shrink-0" title={originName}>[{originName}]</span>);

  timelineStops.forEach(({ stop, count }: { stop: any; count: number }, idx: number) => {
    const isHub = stop.tipoStop === 'HUB_TRANSIT';
    const isCorr = stop.tipoStop === 'CORRISPONDENTE';
    
    let label = '';
    if (isHub) label = stop.destinationNodeName || 'HUB';
    else if (isCorr) label = `${stop.destinationNodeName || 'CORR'} (C)`;
    else label = `${stop.realDestinationCity || 'DIR'} (D)`;
    
    if (count > 1) label += ` [${count}x]`;

    const colorClass = isHub ? 'bg-blue-100 text-blue-800 border-blue-300' : isCorr ? 'bg-green-100 text-green-800 border-green-300' : 'bg-orange-100 text-orange-800 border-orange-300';
    
    badges.push(<span key={`arrow-${idx}`} className="text-gray-400 mx-1 flex-shrink-0">➔</span>);
    badges.push(<span key={`stop-${idx}`} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border break-words max-w-[120px] line-clamp-1 flex-shrink-0 ${colorClass}`} title={label}>[{label}]</span>);
  });
  
  return <div className="flex items-center flex-wrap gap-y-1">{badges}</div>;
};
