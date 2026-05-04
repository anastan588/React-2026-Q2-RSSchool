import { Component, type ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

class Button extends Component<ButtonProps> {
  render() {
    const { children, onClick, className = '', disabled = false, type } = this.props;

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
  }
}

export default Button;
