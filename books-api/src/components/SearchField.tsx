import { type ChangeEvent, type SyntheticEvent, useState } from 'react';

import Button from '@/components/Button';
import Input from '@/components/Input';
import type { SearchFieldProps } from '@/types/types';

const SearchField = ({ initialValue, onSearch }: SearchFieldProps) => {
  const [localQuery, setLocalQuery] = useState(initialValue || '');
  const [showError, setShowError] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    const trimmedLen = value.trim().length;

    setLocalQuery(value);

    if (trimmedLen === 0 || trimmedLen >= 3) {
      setShowError(false);
    }
  };

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    const trimmedQuery = localQuery.trim();

    if (trimmedQuery.length >= 3 || trimmedQuery.length === 0) {
      setShowError(false);
      onSearch(trimmedQuery);
    } else {
      setShowError(true);
    }
  };

  return (
    <>
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Input
            className={`transition-all duration-300 backdrop-blur-md rounded-xl bg-card/80 text-foreground border-border-custom placeholder:text-slate-500 dark:placeholder:text-white/70 ${
              showError
                ? 'border-red-500/80 ring-4 ring-red-500/10 text-red-600 dark:text-red-400 dark:border-red-500/50'
                : 'focus:border-primary focus:ring-4 focus:ring-primary/10'
            }`}
            placeholder="Search by author (min 3 chars)..."
            type="text"
            value={localQuery}
            onChange={handleInputChange}
          />
        </div>

        <Button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 shadow-xs hover:shadow-md active:scale-98 cursor-pointer"
        >
          Search
        </Button>
      </form>

      {showError ? (
        <p className="text-red-500 dark:text-red-400 text-xs font-semibold mt-2.5 ml-3 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <span aria-hidden="true">⚠</span>
          Please enter at least 3 characters for an accurate search
        </p>
      ) : null}
    </>
  );
};

export default SearchField;
