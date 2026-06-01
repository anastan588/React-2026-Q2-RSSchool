import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import BookSelectionCheckbox from '@/components/BookSelect';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Loader from '@/components/Loader';
import { booksApi, useFetchBookDetailsQuery } from '@/services/BooksService';
import getErrorMessage from '@/utils/getErrorMessage';

const neutralBookImage = new URL('@/assets/mock-book.jpg', import.meta.url).href;

export const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const {
    data: book,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useFetchBookDetailsQuery(id ?? '', {
    skip: !id,
  });

  const handleClose = (): void => {
    const currentSearch = searchParams.toString();
    navigate(currentSearch ? `/?${currentSearch}` : '/');
  };

  const handleManualRefresh = (): void => {
    if (id) {
      dispatch(booksApi.util.invalidateTags([{ type: 'BookDetails', id }]));
    }
  };

  const errorMessage = getErrorMessage(error);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-12" data-testid="details-loader">
        <Loader query="book detailes" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card/90 backdrop-blur-xl border-l border-border-custom shadow-2xl relative">
      {!errorMessage && book ? (
        <Button
          className={`fixed bottom-24 right-6 z-50 px-4 py-2.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-amber-400 cursor-pointer flex items-center gap-2 hover:bg-amber-400 active:scale-95 transition-all ${
            isFetching ? 'opacity-70 pointer-events-none' : ''
          }`}
          disabled={isFetching}
          onClick={handleManualRefresh}
        >
          <span className={`${isFetching ? 'animate-spin' : ''}`}>↻</span>
          {isFetching ? 'Refreshing' : 'Refresh Data'}
        </Button>
      ) : null}

      <header className="flex items-center justify-between p-6 border-b border-border-custom transition-colors duration-300">
        <h2 className="font-bold text-foreground text-lg truncate pr-4">Book Profile</h2>
        <button
          aria-label="Close details"
          className="p-2 hover:bg-card/50 rounded-full transition-colors text-muted hover:text-foreground cursor-pointer"
          type="button"
          onClick={handleClose}
        >
          ✕
        </button>
      </header>

      <div className="grow overflow-y-auto relative">
        {errorMessage && !isLoading && !isFetching ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full gap-4">
            <ErrorMessage message={errorMessage} onRetry={refetch} />
            <Button
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              onClick={handleClose}
            >
              Close Panel
            </Button>
          </div>
        ) : null}

        {isFetching && !errorMessage ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/20 backdrop-blur-xs z-30 animate-in fade-in duration-200">
            <Loader query="book detailes" />
          </div>
        ) : null}

        {!errorMessage && book ? (
          <main
            className={`p-6 space-y-6 transition-all duration-300 ${
              isFetching ? 'opacity-30 animate-pulse pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="flex justify-center">
              <img
                alt={book.title}
                className="h-64 object-contain shadow-book rounded-lg bg-card/40 border border-border-custom transition-all"
                loading="lazy"
                src={!book.cover || book.cover.includes('mock-book.jpg') ? neutralBookImage : book.cover}
              />
            </div>

            <div className="flex flex-col gap-1 text-left">
              <h3 className="text-xl font-black text-foreground leading-tight">{book.title}</h3>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted">Synopsis Description</span>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line text-left bg-card/30 p-4 rounded-2xl border border-border-custom backdrop-blur-xs transition-colors duration-300">
                {book.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border-custom pt-4 text-left transition-colors duration-300">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Primary Genre</span>
                <span className="text-foreground font-semibold">{book.category}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  Setting Locations
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {book.places.length > 0 ? (
                    book.places.map((place) => (
                      <span
                        key={place}
                        className="text-xs bg-card/50 text-foreground border border-border-custom px-2 py-0.5 rounded-md font-medium transition-colors"
                      >
                        {place}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted text-xs font-medium">Not Specified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border-custom bg-card/30 backdrop-blur-xs transition-all duration-300">
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Status</span>
                <span className="text-[11px] font-medium text-muted-foreground mt-0.5">Toggle selected state</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-muted uppercase">Select</span>
                <BookSelectionCheckbox book={book} />
              </div>
            </div>

            <div className="border-t border-border-custom pt-4 text-left transition-colors duration-300">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                Open Library Source Registry
              </span>
              <a
                className="text-primary underline text-xs break-all hover:brightness-110 font-medium transition-all"
                href={book.openLibraryUrl}
                rel="noreferrer"
                target="_blank"
              >
                {book.openLibraryUrl}
              </a>
            </div>
          </main>
        ) : null}
      </div>
    </div>
  );
};

export default BookDetails;
