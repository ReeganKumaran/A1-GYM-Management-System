import { render, screen } from '@testing-library/react';
import DashboardCard from '@/components/DashboardCard';

describe('DashboardCard', () => {
  const defaultProps = {
    title: 'Total Members',
    value: 150,
    icon: '👥',
    color: 'orange',
  };

  it('renders title, value, and icon correctly', () => {
    render(<DashboardCard {...defaultProps} />);

    expect(screen.getByText('Total Members')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('renders string value correctly', () => {
    render(<DashboardCard {...defaultProps} value="$1,200" />);

    expect(screen.getByText('$1,200')).toBeInTheDocument();
  });

  it('applies orange color classes by default', () => {
    const { container } = render(<DashboardCard {...defaultProps} color="orange" />);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('bg-orange-500/10');
    expect(card.className).toContain('border-orange-500/30');
  });

  it('applies green color classes', () => {
    const { container } = render(<DashboardCard {...defaultProps} color="green" />);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('bg-green-500/10');
    expect(card.className).toContain('border-green-500/30');
  });

  it('applies blue color classes', () => {
    const { container } = render(<DashboardCard {...defaultProps} color="blue" />);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('bg-blue-500/10');
    expect(card.className).toContain('border-blue-500/30');
  });

  it('applies purple color classes', () => {
    const { container } = render(<DashboardCard {...defaultProps} color="purple" />);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('bg-purple-500/10');
    expect(card.className).toContain('border-purple-500/30');
  });

  it('falls back to orange for unknown color', () => {
    const { container } = render(<DashboardCard {...defaultProps} color="unknown" />);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('bg-orange-500/10');
    expect(card.className).toContain('border-orange-500/30');
  });
});
