import { type ChangeEvent, Component } from 'react';

interface InputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'search' | 'number';
  className?: string;
}

class Input extends Component<InputProps> {
  render() {
    const { value, onChange, placeholder, type, className = '' } = this.props;

    return (
      <input
        className={`search-bar w-full transition-all ${className}`}
        placeholder={placeholder}
        type={type === 'search' ? 'search' : type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={onChange}
      />
    );
  }
}

export default Input;
