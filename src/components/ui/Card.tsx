import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  headerAction?: React.ReactNode;
  accent?: 'orange' | 'yellow' | 'green' | 'red' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  headerAction,
  accent = 'none',
  className = '',
  ...props
}) => {
  const accentBorders = {
    none: 'border-t-black/10',
    orange: 'border-t-2 border-t-amber-500',
    yellow: 'border-t-2 border-t-yellow-500',
    green: 'border-t-2 border-t-emerald-500',
    red: 'border-t-2 border-t-red-500',
  };

  return (
    <div
      className={`bg-white border border-black/10 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-black/20 ${accentBorders[accent]} ${className}`}
      {...props}
    >
      {(title || headerAction) && (
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/5 font-mono">
          {title && (
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#11BCEC]">
              [ {title} ]
            </h3>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="text-sm text-black">{children}</div>
    </div>
  );
};
