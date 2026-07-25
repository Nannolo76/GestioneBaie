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
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border';

  const variants = {
    primary: 'bg-sky-50 text-[#11BCEC] border-sky-200/50',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    warning: 'bg-amber-50 text-amber-600 border-amber-200/50',
    danger: 'bg-rose-50 text-rose-600 border-rose-200/50',
    info: 'bg-gray-100 text-gray-700 border-gray-200/50',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
