import { Component } from 'react';

import neutralBookImage from '@/assets/mock-book.jpg';
import type { Book } from '@/services/BooksService';

interface BookItemState {
  hasError: boolean;
}

class BookItem extends Component<{ book: Book }, BookItemState> {
  state: BookItemState = {
    hasError: false,
  };

  handleError = (): void => {
    this.setState({ hasError: true });
  };

  render() {
    const { book } = this.props;
    const { title, author, category, cover } = book;
    const { hasError } = this.state;

    const displayCover = !cover || hasError ? neutralBookImage : cover;

    return (
      <article className="book-item group">
        <div className="book-cover-wrapper bg-card">
          <div className="book-spine" />
          <img
            alt={`Cover for ${title}`}
            className="book-cover-img"
            loading="lazy"
            src={displayCover}
            onError={this.handleError}
          />
          <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-white/20 pointer-events-none" />
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <span className="category-tag">{category}</span>
          <h3 className="book-title" title={title}>
            {title}
          </h3>
          <p className="book-author">{author}</p>
        </div>
      </article>
    );
  }
}

export default BookItem;
