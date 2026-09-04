import React, { useState, useRef } from 'react';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-5xl',
  className = '',
  headerClassName = 'bg-gradient-to-r from-slate-800 to-slate-900',
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.initialX + dx,
      y: dragStartRef.current.initialY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center p-4">
      {/* Sfondo non bloccante: usiamo pointer-events-none per consentire click sulla griglia sottostante */}
      <div 
        className={`pointer-events-auto bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-300 flex flex-col ${width} w-full max-h-[90vh] ${className}`}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`, 
          transition: isDragging ? 'none' : 'transform 0.1s ease-out' 
        }}
      >
        {/* Intestazione trascinabile */}
        <div 
          className={`${headerClassName} text-white p-3 flex justify-between items-center cursor-move select-none rounded-t-xl`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <h3 className="font-bold text-sm uppercase tracking-wide truncate pr-4">{title}</h3>
          <button 
            type="button"
            onPointerDown={(e) => e.stopPropagation()} // Previene il drag sul pulsante chiudi
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl cursor-pointer transition-colors"
          >
            &times;
          </button>
        </div>
        
        {/* Contenuto modale scrollabile */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 rounded-b-xl">
          {children}
        </div>
      </div>
    </div>
  );
};
