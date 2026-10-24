import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

export interface DropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  icon?: React.ReactNode;
  ariaLabel: string;
  fullWidth?: boolean;
}

export function Dropdown<T extends string>({
  value,
  onChange,
  options,
  icon,
  ariaLabel,
  fullWidth = false,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        const idx = options.findIndex((opt) => opt.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < options.length) {
        onChange(options[focusedIndex].value);
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={
        fullWidth
          ? 'relative w-full'
          : 'relative inline-block flex-1 sm:flex-none min-w-0'
      }
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        className={`${
          fullWidth ? 'w-full' : 'w-full sm:w-auto'
        } h-9 px-3 rounded-xl bg-[#FCFAF8] border border-[#F0EDE8] hover:border-[#7657D9]/40 focus:border-[#7657D9] focus-visible:ring-2 focus-visible:ring-[#7657D9]/20 focus:outline-none transition-all cursor-pointer flex items-center justify-between gap-1.5 text-xs font-semibold text-[#2A2538]`}
      >
        <span className="flex items-center gap-1.5 truncate min-w-0">
          {icon && <span className="text-[#9E98AB] flex-shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : ''}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#9E98AB] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={`${
            fullWidth
              ? 'absolute left-0 right-0 top-full mt-1 w-full'
              : 'absolute left-0 sm:left-auto sm:right-0 top-full mt-1 min-w-full w-max max-w-[calc(100vw-32px)]'
          } bg-white border border-[#F0EDE8] rounded-2xl shadow-lg z-30 py-1 max-h-60 overflow-y-auto`}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isFocused = idx === focusedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                  isSelected ? 'text-[#7657D9] bg-[#EFEBFC]/50' : 'text-[#6D677D]'
                } ${isFocused && !isSelected ? 'bg-[#F5F2EE] text-[#2A2538]' : ''}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#7657D9] flex-shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}