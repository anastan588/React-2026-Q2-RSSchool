import { useNavigate, useSearchParams } from 'react-router';

import Button from '@/components/Button';
import type { PaginationProps } from '@/types/types';

export const Pagination = ({ current, total }: Omit<PaginationProps, 'onPageChange'>) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  if (total <= 1) return null;
  const handlePageChange = (targetPage: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('page', String(targetPage));
    navigate(`/?${nextParams.toString()}`);
  };

  return (
    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
      <Button
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40"
        disabled={current <= 1}
        onClick={() => handlePageChange(current - 1)}
      >
        Previous
      </Button>

      <span className="text-sm font-semibold px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl select-none">
        Page {current} of {total}
      </span>

      <Button
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40"
        disabled={current >= total}
        onClick={() => handlePageChange(current + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
