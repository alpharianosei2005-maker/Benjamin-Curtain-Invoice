import React, { useState, useRef, useEffect } from 'react';
import { CatalogItem } from '../types';
import { Search } from 'lucide-react';

interface SmartItemInputProps {
  value: string;
  onChange: (description: string, defaultPrice?: number) => void;
  catalog: CatalogItem[];
  placeholder?: string;
  id?: string;
}

export const SmartItemInput: React.FC<SmartItemInputProps> = ({
  value,
  onChange,
  catalog,
  placeholder = 'Type item keyword (e.g. cur, rail, voile)...',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter catalog based on input
  const suggestions = catalog.filter((item) =>
    item.description.toLowerCase().includes(value.trim().toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: CatalogItem) => {
    onChange(item.description, item.defaultPrice);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, suggestions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % Math.max(1, suggestions.length));
    } else if (e.key === 'Enter') {
      if (suggestions.length > 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-8 bg-white text-slate-800 placeholder-slate-400"
          autoComplete="off"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && value.trim().length > 0 && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
          <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-50">
            Suggested Catalog Items
          </div>
          {suggestions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                index === highlightedIndex
                  ? 'bg-indigo-50 text-indigo-950 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.description}</span>
                {item.category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                    {item.category}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                GH₵ {item.defaultPrice}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
