import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col mb-4 w-full">
      {label && (
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-text-muted mb-1">
          {label}
        </label>
      )}
      <input
        className={`bg-cyber-bg border border-cyber-border text-cyber-text px-3 py-2 font-mono text-sm transition-all focus:border-cyber-orange focus:ring-1 focus:ring-cyber-orange disabled:opacity-50 ${
          error ? 'border-cyber-red' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-cyber-red font-mono mt-1">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col mb-4 w-full">
      {label && (
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-text-muted mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`bg-cyber-bg border border-cyber-border text-cyber-text px-3 py-2 pr-10 font-mono text-sm w-full transition-all focus:border-cyber-orange focus:ring-1 focus:ring-cyber-orange disabled:opacity-50 appearance-none ${
            error ? 'border-cyber-red' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-cyber-card text-cyber-text">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-cyber-orange">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-xs text-cyber-red font-mono mt-1">{error}</span>}
    </div>
  );
};
