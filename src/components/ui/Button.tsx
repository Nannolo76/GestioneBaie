import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-mono font-bold tracking-wider uppercase transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-cyber-orange text-cyber-bg hover:bg-cyber-yellow hover:shadow-[0_0_10px_rgba(255,184,0,0.4)] border border-transparent',
    secondary: 'bg-cyber-card text-cyber-text hover:text-cyber-orange border border-cyber-border hover:border-cyber-orange',
    success: 'bg-cyber-green text-cyber-bg hover:shadow-[0_0_10px_rgba(0,255,102,0.4)] border border-transparent',
    danger: 'bg-cyber-red text-cyber-text hover:shadow-[0_0_10px_rgba(255,51,51,0.4)] border border-transparent',
    warning: 'bg-cyber-yellow text-cyber-bg hover:shadow-[0_0_10px_rgba(255,184,0,0.4)] border border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 border-b-2 active:border-b-0',
    md: 'text-sm px-5 py-2.5 border-b-4 active:border-b-0',
    lg: 'text-base px-7 py-3 border-b-4 active:border-b-0',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
