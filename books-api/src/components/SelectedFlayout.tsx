import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@/components/Button';
import { prepareCsvDownload } from '@/services/CsvDownloadService';
import { clearBooks } from '@/state/selectedSlice';
import type { RootState } from '@/state/store';

export const SelectedBooksFlyout = () => {
  const dispatch = useDispatch();

  const downloadRef = useRef<HTMLAnchorElement>(null);

  const selectedBooks = useSelector((state: RootState) => state.selectedReducer.selectedBooks);

  const [csvData, setCsvData] = useState<{ url: string; fileName: string } | null>(null);

  const count = selectedBooks.length;

  useEffect(() => {
    console.log(downloadRef.current);
    if (csvData && downloadRef.current) {
      downloadRef.current.click();
      URL.revokeObjectURL(csvData.url);
      setCsvData(null);
    }
  }, [csvData]);

  const handleUnselectAll = () => {
    dispatch(clearBooks());
  };

  const handleDownload = () => {
    const data = prepareCsvDownload(selectedBooks);
    if (data) {
      setCsvData(data);
    }
  };

  if (count === 0) return null;

  return (
    <div
      className="
        fixed top-6 right-6 z-50 w-36 p-3 rounded-xl transition-all duration-300
        animate-in fade-in slide-in-from-top-4
        bg-white/90 border border-slate-200/80 text-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md
        dark:bg-slate-900/90 dark:border-slate-800/80 dark:text-slate-100 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
      "
      data-testid="selected-items-flyout"
    >
      <a
        ref={downloadRef}
        href={csvData?.url || '#'}
        download={csvData?.fileName || ''}
        className="hidden"
        aria-hidden="true"
      />
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className="
            flex items-center justify-center min-w-7 h-7 font-bold text-sm rounded-full px-2 shadow-xs transition-colors
            bg-indigo-600 text-white
            dark:bg-indigo-500
          "
          >
            {count}
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
            {count === 1 ? 'item selected' : 'items selected'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 w-full">
          <Button
            className="
              w-full flex items-center justify-center font-bold text-xs py-2 rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer
              bg-indigo-600 hover:bg-indigo-500 border-indigo-600 text-white
              dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:border-indigo-500
            "
            onClick={handleDownload}
          >
            Download
          </Button>

          <Button
            className="
              w-full flex items-center justify-center !border-0 text-[11px] font-semibold py-1.5 rounded-lg transition-colors cursor-pointer shadow-none after:hidden before:hidden
              !bg-transparent text-slate-400 hover:text-slate-700
              dark:text-slate-400 dark:hover:text-slate-200
            "
            onClick={handleUnselectAll}
          >
            Unselect all
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectedBooksFlyout;
