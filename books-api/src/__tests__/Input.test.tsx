import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Input from '@/components/Input';

describe('Input Component', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    placeholder: 'Search books...',
  };

  it('renders with the correct value and placeholder', () => {
    render(<Input {...defaultProps} value="React" />);

    const inputElement = screen.getByPlaceholderText('Search books...');
    expect(inputElement).toHaveValue('React');
  });

  it('calls onChange handler when text is entered', () => {
    const handleChange = vi.fn();
    render(<Input {...defaultProps} onChange={handleChange} />);

    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'New Search' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies the correct type attribute based on props', () => {
    const { rerender } = render(<Input {...defaultProps} type="search" />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('type', 'search');

    rerender(<Input {...defaultProps} type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');

    rerender(<Input {...defaultProps} type="text" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('includes default and custom CSS classes', () => {
    render(<Input {...defaultProps} className="custom-focus" />);

    const inputElement = screen.getByPlaceholderText('Search books...');
    expect(inputElement).toHaveClass('search-bar');
    expect(inputElement).toHaveClass('custom-focus');
  });
});
