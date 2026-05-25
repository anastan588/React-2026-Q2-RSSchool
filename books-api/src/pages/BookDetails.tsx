import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import BookSelectionCheckbox from '@/components/BookSelect';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import { fetchBookDetails } from '@/services/BooksService';
import type { ExtendedBook } from '@/types/types';

const neutralBookImage = new URL('@/assets/mock-book.jpg', import.meta.url).href;

export const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [book, setBook] = useState<ExtendedBook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchSingleBookDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchBookDetails(id);
        setBook(response);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load book data profiles.';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSingleBookDetails();
  }, [id]);

  const handleClose = () => {
    const currentSearch = searchParams.toString();
    navigate(currentSearch ? `/?${currentSearch}` : '/');
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-12" data-testid="details-loader">
        <Loader query="book detailes" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-8 text-center text-red-500">
        <p className="font-medium text-sm">{error || 'Book data record not located.'}</p>
        <Button className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs" onClick={handleClose}>
          Close Panel
        </Button>
      </div>
    );
  }

  const displayCover = !book.cover || book.cover.includes('mock-book.jpg') ? neutralBookImage : book.cover;

  return (
    <div className="h-full flex flex-col bg-card/90 backdrop-blur-xl border-l border-border-custom shadow-2xl animate-in slide-in-from-right duration-300">
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

      <main className="grow overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center">
          <img
            alt={book.title}
            className="h-64 object-contain shadow-book rounded-lg bg-card/40 border border-border-custom transition-all"
            src={displayCover}
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
            <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Setting Locations</span>
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
    </div>
  );
};

export default BookDetails;
