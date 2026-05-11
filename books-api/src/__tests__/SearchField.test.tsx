import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SearchField from '@/components/SearchField';

describe('SearchField Component', () => {
  const mockOnSearch = vi.fn();

  it('initializes with initialValue from props', () => {
    render(<SearchField initialValue="Agatha" onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search by author/i);
    expect(input).toHaveValue('Agatha');
  });

  it('updates localQuery state on input change', () => {
    render(<SearchField initialValue="" onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search by author/i);
    fireEvent.change(input, { target: { value: 'Agatha' } });
    expect(input).toHaveValue('Agatha');
  });

  it('shows error message if query is less than 3 characters on submit', () => {
    render(<SearchField initialValue="" onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search by author/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.click(button);

    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('calls onSearch with trimmed query when valid', () => {
    render(<SearchField initialValue="" onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search by author/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '  Testing  ' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Testing');
    expect(screen.queryByText(/at least 3 characters/i)).not.toBeInTheDocument();
  });

  it('calls onSearch when query is empty (reset search)', () => {
    render(<SearchField initialValue="Previous" onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search by author/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('');
    expect(screen.queryByText(/at least 3 characters/i)).not.toBeInTheDocument();
  });

  it('applies error classes to input when showError is true', () => {
    render(<SearchField initialValue="ab" onSearch={mockOnSearch} />);
    fireEvent.submit(screen.getByRole('button').closest('form')!);

    const input = screen.getByPlaceholderText(/Search by author/i);
    expect(input).toHaveClass('border-red-500');
  });
});
