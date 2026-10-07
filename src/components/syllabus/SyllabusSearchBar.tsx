import React from 'react';
import { Search, X } from 'lucide-react';

interface SyllabusSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
}

export const SyllabusSearchBar: React.FC<SyllabusSearchBarProps> = ({
  value,
  onChange,
  resultCount,
  totalCount,
}) => {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by topic, chapter, or section name..."
          className="w-full h-10 pl-10 pr-24 rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {value && typeof resultCount === 'number' && (
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
              {resultCount} of {totalCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

