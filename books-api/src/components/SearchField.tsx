'use client';

import { type ChangeEvent, type SyntheticEvent, useState } from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button';
import Input from '@/components/Input';
import type { SearchFieldProps } from '@/types/types';

export const SearchField = ({ initialValue, onSearch }: SearchFieldProps) => {
  const t = useTranslations('Header');
  const [localQuery, setLocalQuery] = useState(initialValue || '');
  const [showError, setShowError] = useState(false);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);

  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setLocalQuery(initialValue || '');
    setShowError(false);
  }

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
    <div className="w-full">
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Input
            name="q"
            className={`transition-all duration-300 backdrop-blur-md rounded-xl bg-card/80 text-foreground border-border-custom placeholder:text-slate-500 dark:placeholder:text-white/70 ${
              showError
                ? 'border-red-500/80 ring-4 ring-red-500/10 text-red-600 dark:text-red-400 dark:border-red-500/50'
                : 'focus:border-primary focus:ring-4 focus:ring-primary/10'
            }`}
            placeholder={t('placeholder')}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
          />
        </div>

        <Button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 shadow-xs hover:shadow-md active:scale-98 cursor-pointer"
        >
          {t('searchButton') || 'Search'}
        </Button>
      </form>

      {showError ? (
        <p className="text-red-500 dark:text-red-400 text-xs font-semibold mt-2.5 ml-3 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <span aria-hidden="true">⚠</span>
          {t('errorMessage')}
        </p>
      ) : null}
    </div>
  );
};

export default SearchField;
