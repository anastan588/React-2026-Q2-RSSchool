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
      className="book-item group flex flex-col gap-3 p-3 rounded-xl border border-border-custom bg-card/50 backdrop-blur-md hover:bg-card hover:shadow-md transition-all duration-300 cursor-pointer"
      data-book-id={id}
    >
      <div className="book-cover-wrapper bg-card overflow-hidden rounded-lg aspect-[3/4] relative shadow-book">
        <div className="book-spine" />
        <img
          alt={`Cover for ${title}`}
          className="book-cover-img w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          loading="lazy"
          src={displayCover}
          onError={handleError}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/20 pointer-events-none" />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2 min-h-[32px]">
          <span className="category-tag text-xs font-bold uppercase tracking-wider bg-accent-soft text-primary px-2.5 py-1 rounded-md max-w-[120px] truncate transition-colors duration-300">
            {category}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-wider text-muted uppercase group-hover:text-primary transition-colors duration-200">
              Select
            </span>
            <BookSelectionCheckbox book={book} />
          </div>
        </div>
        <div className="flex flex-col gap-1 text-left">
          <h3
            className="book-title text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200"
            title={title}
          >
            {title}
          </h3>
          <p className="book-author text-sm text-muted truncate transition-colors duration-300">{author}</p>
        </div>
      </div>
    </article>
  );
};

export default BookItem;
