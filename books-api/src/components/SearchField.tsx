import { type ChangeEvent, Component, type FormEvent } from 'react';

import Button from './Button';
import Input from './Input';

interface SearchFieldProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

interface SearchFieldState {
  localQuery: string;
  showError: boolean;
}

class SearchField extends Component<SearchFieldProps, SearchFieldState> {
  constructor(props: SearchFieldProps) {
    super(props);
    const { initialValue } = props;
    this.state = {
      localQuery: initialValue || '',
      showError: false,
    };
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    const { showError } = this.state;
    const trimmedLen = value.trim().length;

    this.setState({
      localQuery: value,
      showError: trimmedLen === 0 || trimmedLen >= 3 ? false : showError,
    });
  };

  handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const { localQuery } = this.state;
    const { onSearch } = this.props;
    const trimmedQuery = localQuery.trim();

    if (trimmedQuery.length >= 3) {
      this.setState({ showError: false });
      onSearch(trimmedQuery);
    } else {
      this.setState({ showError: true });
    }
  };

  render() {
    const { localQuery, showError } = this.state;

    return (
      <div className="mb-12">
        <form className="flex gap-2" onSubmit={this.handleSubmit}>
          <div className="relative flex-1">
            <Input
              className={showError ? 'border-red-500 ring-4 ring-red-500/10' : 'border-border-custom'}
              placeholder="Search by title or author (min 3 chars)..."
              type="text"
              value={localQuery}
              onChange={this.handleInputChange}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {showError ? (
          <p className="text-red-500 text-sm mt-3 ml-4 font-medium animate-in fade-in duration-300">
            ⚠ Please enter at least 3 characters for an accurate search
          </p>
        ) : null}
      </div>
    );
  }
}

export default SearchField;
