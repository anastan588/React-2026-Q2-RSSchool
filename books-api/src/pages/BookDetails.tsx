import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import neutralBookImage from '@/assets/mock-book.jpg';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import { fetchBookDetails } from '@/services/BooksService';
import type { ExtendedBook } from '@/types/types';

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
    const page = searchParams.get('page');
    navigate(page ? `/?page=${page}` : '/');
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

  const displayCover = !book.cover ? neutralBookImage : book.cover;

  return (
    <div className="h-full flex flex-col bg-white border-l border-zinc-200 shadow-xl animate-in slide-in-from-right duration-200">
      <header className="flex items-center justify-between p-6 border-b border-zinc-100">
        <h2 className="font-bold text-slate-800 text-lg truncate pr-4">Book Profile</h2>
        <button
          aria-label="Close details"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700"
          type="button"
          onClick={handleClose}
        >
          ✕
        </button>
      </header>

      <main className="grow overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center">
          <img alt={book.title} className="h-64 object-contain shadow-md rounded-lg bg-zinc-50" src={displayCover} />
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight">{book.title}</h3>
          <p className="text-sm font-semibold text-indigo-600">First Published: {book.publishDate}</p>
        </div>
        <div className="space-y-1.5">
          <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Synopsis Description</span>
          <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line text-left bg-slate-50 p-4 rounded-2xl border border-zinc-100">
            {book.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm border-t border-zinc-100 pt-4 text-left">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Primary Genre</span>
            <span className="text-slate-700 font-semibold">{book.category}</span>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Setting Locations
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {book.places.length > 0 ? (
                book.places.map((place) => (
                  <span key={place} className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                    {place}
                  </span>
                ))
              ) : (
                <span className="text-zinc-400 text-xs">Not Specified</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-4 text-left">
          <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Open Library Source Registry
          </span>
          <a
            className="text-indigo-500 underline text-xs break-all hover:text-indigo-700 font-medium"
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
