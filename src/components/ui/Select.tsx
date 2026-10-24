import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  children,
  className = '',
  containerClassName = '',
  icon,
  disabled,
  ...props
}) => {
  return (
    <div className={`relative inline-flex items-center w-full ${containerClassName}`}>
      {icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9E98AB] flex items-center justify-center z-10">
          {icon}
        </span>
      )}
      <select
        disabled={disabled}
        className={`w-full h-9 appearance-none truncate pr-8 ${
          icon ? 'pl-8' : 'pl-3'
        } rounded-xl bg-[#FCFAF8] border border-[#F0EDE8] text-xs font-semibold text-[#2A2538] hover:border-[#7657D9]/40 focus:border-[#7657D9] focus-visible:ring-2 focus-visible:ring-[#7657D9]/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E98AB] pointer-events-none z-10" />
    </div>
  );
};
