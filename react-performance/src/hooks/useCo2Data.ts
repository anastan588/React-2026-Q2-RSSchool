import { useState, useEffect, useMemo } from 'react';
import type { Country, YearData } from '../types';

type ApiCountryPayload = {
  iso_code?: string;
  data: YearData[];
};

type ApiResponse = Record<string, ApiCountryPayload>;

export const useCo2Data = () => {
  const [data, setData] = useState<Country[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const res = await fetch('/data/owid-co2-data.json');

        if (!res.ok) {
          throw new Error('Failed to fetch CO2 data');
        }

        const json = (await res.json()) as ApiResponse;

        const parsed: Country[] = Object.entries(json).map(([countryName, countryData]) => ({
          id: countryName,
          iso_code: countryData.iso_code,
          data: countryData.data,
        }));

        setData(parsed);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return useMemo(() => ({ data, isLoading, error }), [data, isLoading, error]);
};
