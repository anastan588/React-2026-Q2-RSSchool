import { type ChangeEvent, Component, type FormEvent } from 'react';

interface SearchFieldProps {
  onSearch: (query: string) => void;
}

interface SearchFieldState {
  localQuery: string;
  showError: boolean;
}

class SearchField extends Component<SearchFieldProps, SearchFieldState> {
  state: SearchFieldState = {
    localQuery: '',
    showError: false,
  };

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const { showError } = this.state;
    const trimmedLen = value.trim().length;

    this.setState({
      localQuery: value,
      showError: trimmedLen === 0 || trimmedLen >= 3 ? false : showError,
    });
  };

  handleSubmit = (e: FormEvent) => {
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
            <input
              className={`search-bar w-full transition-all ${showError ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
              placeholder="Search by title or author (min 3 chars)..."
              type="text"
              value={localQuery}
              onChange={this.handleInputChange}
            />
          </div>
          <button
            className="px-8 py-4 bg-primary text-white font-bold rounded-2xl 
                       hover:shadow-xl hover:bg-primary/90 transition-all 
                       active:scale-95 shadow-primary/20 shadow-lg"
            type="submit"
          >
            Search
          </button>
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
