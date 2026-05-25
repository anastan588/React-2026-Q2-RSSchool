import { useDispatch, useSelector } from 'react-redux';

import { addBook, removeBook } from '@/state/selectedSlice';
import type { RootState } from '@/state/store';
import type { BookSelectionCheckboxProps } from '@/types/types';

const BookSelectionCheckbox = ({ book }: BookSelectionCheckboxProps) => {
  const dispatch = useDispatch();
  const { id, title } = book;

  const isSelected = useSelector((state: RootState) =>
    state.selectedReducer.selectedBooks.some((selectedBook) => selectedBook.id === id),
  );

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.stopPropagation();

    if (e.target.checked) {
      dispatch(addBook(book));
    } else {
      dispatch(removeBook(id));
    }
  };

  return (
    <div className="inline-block cursor-pointer select-none p-1" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheckboxChange}
        className="w-5 h-5 cursor-pointer accent-primary rounded-sm"
        aria-label={`Select ${title}`}
      />
    </div>
  );
};

export default BookSelectionCheckbox;
