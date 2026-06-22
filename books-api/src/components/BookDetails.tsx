'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import neutralBookImage from '@/assets/mock-book.jpg';
import BookSelectionCheckbox from '@/components/BookSelect';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Loader from '@/components/Loader';
import RefreshCacheButton from '@/components/RefreshCacheButton';
import { booksApi, useFetchBookDetailsQuery } from '@/services/BooksService';
import type { ExtendedBook } from '@/types/types';
import getErrorMessage from '@/utils/getErrorMessage';

interface BookDetailsProps {
  id: string;
  initialData: ExtendedBook | null;
}

export const BookDetails = ({ id, initialData }: BookDetailsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const t = useTranslations('BookDetails');

  const [imageError, setImageError] = useState(false);
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setImageError(false);
  }

  const safeParams = searchParams || new URLSearchParams();

  const {
    data: clientBook,
    error,
    isLoading,
    isFetching,
  } = useFetchBookDetailsQuery(id ?? '', {
    skip: !id || !!initialData,
  });

  const [triggerFetchDetails, lazyResult] = booksApi.useLazyFetchBookDetailsQuery();

  const book = lazyResult.data || clientBook || initialData;
  const currentIsFetching = isFetching || lazyResult.isFetching;
  const currentError = error || lazyResult.error;

  const handleClose = (): void => {
    const params = new URLSearchParams(safeParams.toString());
    params.delete('selectedBookId');
    const currentSearch = params.toString();
    router.replace(currentSearch ? `/?${currentSearch}` : '/', { scroll: false });
  };

  const handleManualRefresh = (): void => {
    if (id) {
      dispatch(booksApi.util.invalidateTags([{ type: 'BookDetails', id }]));
      triggerFetchDetails(id);
    }
  };

  const errorMessage = getErrorMessage(currentError);

  if (isLoading && !book) {
    return (
      <div className="h-full flex items-center justify-center p-12" data-testid="details-loader">
        <Loader query="book details" />
      </div>
    );
  }

  const displayCover =
    !book?.cover || book.cover.includes('mock-book.jpg') || imageError ? neutralBookImage : book.cover;

  return (
    <div className="h-full flex flex-col bg-card/90 backdrop-blur-xl border-l border-border-custom shadow-2xl relative animate-in slide-in-from-right duration-300">
      {!errorMessage && book ? (
        <RefreshCacheButton id={id} isFetching={currentIsFetching} variant="details" onRefresh={handleManualRefresh} />
      ) : null}

      <header className="flex items-center justify-between p-6 border-b border-border-custom transition-colors duration-300">
        <h2 className="font-bold text-foreground text-lg truncate pr-4">{t('profileTitle')}</h2>
        <button
          aria-label={t('closeLabel')}
          className="p-2 hover:bg-card/50 rounded-full transition-colors text-muted hover:text-foreground cursor-pointer"
          type="button"
          onClick={handleClose}
        >
          ✕
        </button>
      </header>

      <div className="grow overflow-y-auto relative">
        {errorMessage && !book ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full gap-4">
            <ErrorMessage message={errorMessage} onRetry={handleManualRefresh} />
            <Button
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              onClick={handleClose}
            >
              {t('closeButton')}
            </Button>
          </div>
        ) : null}

        {currentIsFetching && !book ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/20 backdrop-blur-xs z-30 animate-in fade-in duration-200">
            <Loader query="book details" />
          </div>
        ) : null}

        {book ? (
          <main
            className={`p-6 space-y-6 transition-all duration-300 ${
              currentIsFetching && !clientBook && !lazyResult.data
                ? 'opacity-30 animate-pulse pointer-events-none'
                : 'opacity-100'
            }`}
          >
            <div className="flex justify-center">
              <div className="h-64 aspect-[3/4] relative overflow-hidden shadow-book rounded-lg bg-card/40 border border-border-custom transition-all">
                <Image
                  fill
                  priority
                  alt={book.title}
                  className="object-contain w-full h-full"
                  sizes="(max-width: 768px) 100vw, 300px"
                  src={displayCover}
                  onError={() => setImageError(true)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <h3 className="text-xl font-black text-foreground leading-tight">{book.title}</h3>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted">{t('synopsis')}</span>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line text-left bg-card/30 p-4 rounded-2xl border border-border-custom backdrop-blur-xs transition-colors duration-300">
                {book.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border-custom pt-4 text-left transition-colors duration-300">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">{t('genre')}</span>
                <span className="text-foreground font-semibold">{book.category}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  {t('locations')}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {book.places && book.places.length > 0 ? (
                    book.places.map((place) => (
                      <span
                        key={place}
                        className="text-xs bg-card/50 text-foreground border border-border-custom px-2 py-0.5 rounded-md font-medium transition-colors"
                      >
                        {place}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted text-xs font-medium">{t('notSpecified')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border-custom bg-card/30 backdrop-blur-xs transition-all duration-300">
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">{t('status')}</span>
                <span className="text-[11px] font-medium text-muted-foreground mt-0.5">{t('statusSub')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-muted uppercase">{t('selectLabel')}</span>
                <BookSelectionCheckbox book={book} />
              </div>
            </div>

            {book.openLibraryUrl ? (
              <div className="border-t border-border-custom pt-4 text-left transition-colors duration-300">
                <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  {t('registry')}
                </span>
                <a
                  className="text-primary underline text-xs break-all hover:text-primary/80 transition-colors"
                  href={book.openLibraryUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {book.openLibraryUrl}
                </a>
              </div>
            ) : null}
          </main>
        ) : null}
      </div>
    </div>
  );
};

export default BookDetails;
