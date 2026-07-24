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
    none: 'border-t-cyber-border',
    orange: 'border-t-2 border-t-cyber-orange',
    yellow: 'border-t-2 border-t-cyber-yellow',
    green: 'border-t-2 border-t-cyber-green',
    red: 'border-t-2 border-t-cyber-red',
  };

  return (
    <div
      className={`bg-cyber-card border border-cyber-border ${accentBorders[accent]} p-5 transition-all duration-200 hover:border-cyber-border-active ${className}`}
      {...props}
    >
      {(title || headerAction) && (
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-cyber-border font-mono">
          {title && (
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyber-orange">
              // {title}
            </h3>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
