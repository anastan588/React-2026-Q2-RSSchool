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
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Input
            className={showError ? 'border-red-500 ring-4 ring-red-500/10' : 'border-border-custom'}
            placeholder="Search by author (min 3 chars)..."
            type="text"
            value={localQuery}
            onChange={handleInputChange}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      {showError ? (
        <p className="text-red-500 text-sm mt-3 ml-4 font-medium animate-in fade-in duration-300">
          ⚠ Please enter at least 3 characters for an accurate search
        </p>
      ) : null}
    </>
  );
};

export default SearchField;
