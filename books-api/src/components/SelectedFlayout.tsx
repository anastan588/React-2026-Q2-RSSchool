'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import Button from '@/components/Button';
import { clearBooks } from '@/state/selectedSlice';
import { useAppSelector } from '@/state/store';

export const SelectedBooksFlyout = () => {
  const dispatch = useDispatch();
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const t = useTranslations('Flyout');

  const selectedBooks = useAppSelector((state) => state.selected?.selectedBooks ?? []);
  const [csvData, setCsvData] = useState<{ url: string; fileName: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const count = selectedBooks.length;

  useEffect(() => {
    if (csvData && downloadRef.current) {
      downloadRef.current.click();
      URL.revokeObjectURL(csvData.url);
      setCsvData(null);
    }
  }, [csvData]);

  useEffect(() => {
    return () => {
      if (csvData?.url) {
        URL.revokeObjectURL(csvData.url);
      }
    };
  }, [csvData]);

  const handleUnselectAll = () => {
    dispatch(clearBooks());
  };

  const handleDownload = async () => {
    if (count === 0 || isExporting) return;

    setIsExporting(true);
    try {
      const response = await fetch('/api/export-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedBooks),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CSV on server');
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      setCsvData({
        url: fileUrl,
        fileName: `${count}_items.csv`,
      });
    } catch (error) {
      console.error('[CSV Client Handler Error]:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (count === 0) return null;

  return (
    <div
      className="
        fixed bottom-6 left-6 z-50 w-36 p-3 rounded-xl border backdrop-blur-md transition-all duration-300
        animate-in fade-in slide-in-from-top-4
        bg-card/90 border-border-custom text-foreground shadow-xl
      "
      data-testid="selected-items-flyout"
    >
      <a
        ref={downloadRef}
        aria-hidden="true"
        className="hidden"
        download={csvData?.fileName || ''}
        href={csvData?.url || '#'}
        tabIndex={-1}
      />
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className="
              flex items-center justify-center min-w-7 h-7 font-bold text-sm rounded-full px-2 shadow-xs transition-colors
              bg-primary text-white
            "
          >
            {count}
          </div>
          <p className="text-xs font-bold text-muted transition-colors duration-300">
            {count === 1 ? t('oneSelected') : t('manySelected')}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <Button
            className="
              w-full flex items-center justify-center font-bold text-xs py-2 rounded-lg border transition-all active:scale-98 cursor-pointer shadow-xs hover:shadow-md
              bg-primary text-white border-primary/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed
            "
            disabled={isExporting}
            onClick={handleDownload}
          >
            {isExporting ? t('exporting') : t('download')}
          </Button>

          <Button
            className="
              w-full flex items-center justify-center !border-0 text-[11px] text-white py-1.5 rounded-lg transition-colors cursor-pointer shadow-none after:hidden before:hidden
              !bg-transparent text-muted hover:text-black dark:hover:text-white
            "
            onClick={handleUnselectAll}
          >
            {t('unselectAll')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectedBooksFlyout;
