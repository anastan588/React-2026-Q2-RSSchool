import type { InputProps } from '@/types/types';

export const Input = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  // Считываем все остальные нативные пропсы (включая name), переданные из формы
  ...props
}: InputProps) => {
  return (
    <input
      // Разворачиваем пропсы (включая name), чтобы они попали на нативный HTML-тег
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
