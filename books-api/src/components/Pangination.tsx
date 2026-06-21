'use client'; // Обязательно, так как используются клиентские хуки и события клика

import { useRouter, useSearchParams } from 'next/navigation'; // ЗАМЕНЕНО с react-router

import Button from '@/components/Button';
import type { PaginationProps } from '@/types/types';

export const Pagination = ({ current, total }: Omit<PaginationProps, 'onPageChange'>) => {
  const searchParams = useSearchParams();
  const router = useRouter(); // В Next.js вместо useNavigate используется useRouter

  if (total <= 1) return null;

  const handlePageChange = (targetPage: number) => {
    // Безопасно преобразуем параметры в строку, обрабатывая возможный null на сервере
    const currentParamsString = searchParams ? searchParams.toString() : '';
    const nextParams = new URLSearchParams(currentParamsString);

    nextParams.set('page', String(targetPage));

    // В Next.js используем push для перехода по URL-адресу
    router.push(`/?${nextParams.toString()}`);
  };

  return (
    <div className="flex items-center gap-4 select-none" onClick={(e) => e.stopPropagation()}>
      <Button
        className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-card/50 disabled:hover:text-foreground disabled:hover:border-border-custom disabled:cursor-not-allowed"
        disabled={current <= 1}
        onClick={() => handlePageChange(current - 1)}
      >
        Previous
      </Button>

      <span className="text-sm font-bold px-5 py-2.5 bg-card/30 border border-border-custom text-foreground rounded-xl min-w-[120px] text-center shadow-xs backdrop-blur-xs transition-colors duration-300">
        Page {current} of {total}
      </span>

      <Button
        className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-card/50 disabled:hover:text-foreground disabled:hover:border-border-custom disabled:cursor-not-allowed"
        disabled={current >= total}
        onClick={() => handlePageChange(current + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
