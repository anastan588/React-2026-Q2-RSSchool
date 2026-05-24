import { useState } from 'react';

import neutralBookImage from '@/assets/mock-book.jpg';
import BookSelectionCheckbox from '@/components/BookSelect';
import type { BookItemProps } from '@/types/types';

const BookItem = ({ book }: BookItemProps) => {
  const [hasError, setHasError] = useState(false);

  const { id, title, author, category, cover } = book;

  const handleError = (): void => {
    setHasError(true);
  };

  const displayCover = !cover || hasError ? neutralBookImage : cover;

  return (
    <article
      className="book-item group flex flex-col gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
      data-book-id={id}
    >
      <div className="book-cover-wrapper bg-card overflow-hidden rounded-lg aspect-[3/4] relative">
        <div className="book-spine" />
        <img
          alt={`Cover for ${title}`}
          className="book-cover-img w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          loading="lazy"
          src={displayCover}
          onError={handleError}
        />
        <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-white/20 pointer-events-none" />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2 min-h-[32px]">
          <span className="category-tag text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full truncate">
            {category}
          </span>
          <div className="flex items-center gap-1.5" title={`Select "${title}" to manage`}>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-primary transition-colors duration-200">
              Select
            </span>
            <BookSelectionCheckbox book={book} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3
            className="book-title text-base font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200"
            title={title}
          >
            {title}
          </h3>
          <p className="book-author text-sm text-slate-500 truncate">{author}</p>
        </div>
      </div>
    </article>
  );
};

export default BookItem;
