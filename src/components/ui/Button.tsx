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
  const baseStyle = 'inline-flex items-center justify-center font-sans font-bold tracking-wider uppercase transition-all duration-150 rounded-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border';
  
  const variants = {
    primary: 'bg-[#11BCEC] hover:bg-[#004B97] text-white border-transparent shadow-xs',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-black/10 shadow-xs',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-xs',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-transparent shadow-xs',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-xs',
  };

  const sizes = {
    sm: 'text-[10px] px-3 py-1.5',
    md: 'text-xs px-5 py-2.5',
    lg: 'text-sm px-7 py-3',
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
