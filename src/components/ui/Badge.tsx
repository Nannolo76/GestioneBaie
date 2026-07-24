import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold tracking-wider uppercase border';

  const variants = {
    primary: 'bg-cyber-orange/10 text-cyber-orange border-cyber-orange/30',
    success: 'bg-cyber-green/10 text-cyber-green border-cyber-green/30',
    warning: 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30',
    danger: 'bg-cyber-red/10 text-cyber-red border-cyber-red/30',
    info: 'text-cyber-text border-cyber-border bg-cyber-bg/50',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
