import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'Test', role: 'admin' } }, status: 'authenticated' }),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/admin/dashboard',
}));

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the input with default placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders the input with custom placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} placeholder="Find members..." />);

    expect(screen.getByPlaceholderText('Find members...')).toBeInTheDocument();
  });

  it('calls onSearch after debounce when user types', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'yoga');

    // onSearch should not have been called yet (debounce)
    expect(onSearch).not.toHaveBeenCalledWith('yoga');

    // Advance timers past the 300ms debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith('yoga');
  });

  it('shows clear button when query is not empty and clears on click', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search...');

    // No clear button initially
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    await user.type(input, 'test');

    // Clear button should appear
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);

    // Input should be cleared and onSearch called with empty string
    expect(input).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });
});
