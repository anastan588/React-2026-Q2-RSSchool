import Button from '@/components/Button';
import type { PaginationProps } from '@/types/types';

export const Pagination = ({ current, total, onPageChange }: PaginationProps) => {
  if (total <= 1) return null;

  return (
    <div className="flex items-center gap-4">
      <Button
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      >
        Previous
      </Button>

      <span className="text-sm font-semibold px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl select-none">
        Page {current} of {total}
      </span>

      <Button
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40"
        disabled={current >= total}
        onClick={() => onPageChange(current + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
