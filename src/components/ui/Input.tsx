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
        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`bg-white border border-black/10 text-black px-3 py-2 rounded-lg font-mono text-xs transition-all focus:border-[#11BCEC] focus:ring-1 focus:ring-[#11BCEC] disabled:opacity-50 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-mono mt-1">{error}</span>}
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
        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`bg-white border border-black/10 text-black px-3 py-2 pr-10 rounded-lg font-mono text-xs w-full transition-all focus:border-[#11BCEC] focus:ring-1 focus:ring-[#11BCEC] disabled:opacity-50 appearance-none ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-black">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#11BCEC]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-xs text-red-500 font-mono mt-1">{error}</span>}
    </div>
  );
};
