import { useMemo, memo, useState, useEffect, useRef, useCallback } from 'react';
import type { Country } from '../../types';
import { CountryCard } from '../country-card/country-card';
import { getPopulationForYear, createYearDataMap } from '../../utils/data-transformers';

import styles from './country-list.module.css';

type CountryListProps = {
  countries: Country[];
  searchQuery: string;
  selectedColumns: string[];
  selectedRegion: string;
  selectedYear: number;
  sortField: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  onYearChange: (year: number) => void;
};

type VisibleItemContext = {
  item: Country;
};

export const CountryList = memo(
  ({
    countries,
    searchQuery,
    selectedColumns,
    selectedRegion,
    selectedYear,
    sortField,
    sortOrder,
  }: CountryListProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<ResizeObserver | null>(null);
    const [scrollTop, setScrollTop] = useState<number>(0);
    const [itemHeight, setItemHeight] = useState<number>(320);
    const [viewportHeight, setViewportHeight] = useState<number>(700);

    const filteredCountries = useMemo<Country[]>(() => {
      return countries
        .filter((c) => {
          const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesRegion = !selectedRegion || c.data.some((d) => d.region === selectedRegion);
          return matchesSearch && matchesRegion;
        })
        .sort((a, b) => {
          if (sortField === 'name') {
            return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
          } else {
            const popA = getPopulationForYear(createYearDataMap(a.data), selectedYear) || 0;
            const popB = getPopulationForYear(createYearDataMap(b.data), selectedYear) || 0;
            return sortOrder === 'asc' ? popA - popB : popB - popA;
          }
        });
    }, [countries, searchQuery, selectedRegion, selectedYear, sortField, sortOrder]);

    useEffect(() => {
      const updateDimensions = (): void => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const calculatedHeight = window.innerHeight - rect.top - 32;
          setViewportHeight(Math.max(300, calculatedHeight));
        }
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
      const handleScroll = (e: Event): void => {
        const target = e.target as HTMLDivElement;
        setScrollTop(target.scrollTop);
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll, { passive: true });
      }
      return () => {
        container?.removeEventListener('scroll', handleScroll);
      };
    }, []);

    useEffect(() => {
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, []);

    const firstRowRef = useCallback((node: HTMLDivElement | null): void => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) {return;}

      observerRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.target.getBoundingClientRect().height;
          if (height > 0) {
            setItemHeight(height);
          }
        }
      });

      observerRef.current.observe(node);
    }, []);

    const { visibleItems, totalHeight, offsetY } = useMemo(() => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
      const endIndex = Math.min(
        filteredCountries.length,
        Math.ceil((scrollTop + viewportHeight) / itemHeight) + 2
      );

      const mappedItems: VisibleItemContext[] = [];
      for (let i = startIndex; i < endIndex; i++) {
        mappedItems.push({
          item: filteredCountries[i],
        });
      }

      return {
        visibleItems: mappedItems,
        totalHeight: filteredCountries.length * itemHeight,
        offsetY: startIndex * itemHeight,
      };
    }, [scrollTop, filteredCountries, itemHeight, viewportHeight]);

    if (filteredCountries.length === 0) {
      return <div className={styles.noResults}>No countries match the selected filters.</div>;
    }

    return (
      <div
        ref={containerRef}
        className={styles.countryListContainer}
        style={{ height: viewportHeight }}
      >
        <div className={styles.scrollTrack} style={{ height: totalHeight }}>
          <div
            className={styles.slidingWindow}
            style={{ transform: `translate3d(0, ${offsetY}px, 0)` }}
          >
            {visibleItems.map(({ item }, index) => (
              <div
                ref={index === 0 ? firstRowRef : undefined}
                key={item.id}
                className={styles.rowWrapper}
              >
                <CountryCard
                  country={item}
                  selectedYear={selectedYear}
                  selectedColumns={selectedColumns}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

CountryList.displayName = 'CountryList';
