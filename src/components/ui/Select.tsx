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
  ...props
}) => {
  return (
    <div className={`relative inline-flex items-center w-full ${containerClassName}`}>
      {icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9E98AB] flex items-center justify-center">
          {icon}
        </span>
      )}
      <select
        className={`w-full appearance-none py-2 pr-8 ${
          icon ? 'pl-8' : 'pl-3'
        } rounded-xl bg-[#FCFAF8] border border-[#F0EDE8] text-xs font-semibold text-[#2A2538] focus:border-[#7657D9] focus:outline-none transition-all cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E98AB] pointer-events-none" />
    </div>
  );
};