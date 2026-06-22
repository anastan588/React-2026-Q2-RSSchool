import type { InputProps } from '@/types/types';

export const Input = ({ value, onChange, placeholder, type = 'text', className = '', ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={`search-bar w-full transition-all ${className}`}
      placeholder={placeholder}
      type={type === 'search' ? 'search' : type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={onChange}
    />
  );
};

export default Input;
