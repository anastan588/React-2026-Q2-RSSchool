import type { ButtonProps } from '@/types/types';

export const Button = ({ children, onClick, className = '', disabled = false, type = 'button' }: ButtonProps) => {
  return (
    <button
      className={`btn-primary ${className}`}
      disabled={disabled}
      type={type === 'submit' ? 'submit' : type === 'reset' ? 'reset' : 'button'}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
