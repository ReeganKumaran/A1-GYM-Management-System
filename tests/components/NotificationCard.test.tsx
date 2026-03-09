import { render, screen } from '@testing-library/react';
import NotificationCard from '@/components/NotificationCard';

describe('NotificationCard', () => {
  const baseNotification = {
    title: 'Gym Closed Tomorrow',
    message: 'The gym will be closed for maintenance.',
    type: 'general' as const,
    date: '2025-01-15',
    targetRole: 'all',
  };

  it('renders notification title and message', () => {
    render(<NotificationCard notification={baseNotification} />);

    expect(screen.getByText('Gym Closed Tomorrow')).toBeInTheDocument();
    expect(screen.getByText('The gym will be closed for maintenance.')).toBeInTheDocument();
  });

  it('renders target role', () => {
    render(<NotificationCard notification={baseNotification} />);

    expect(screen.getByText('all')).toBeInTheDocument();
  });

  it('renders general type badge with blue styling', () => {
    render(<NotificationCard notification={baseNotification} />);

    const badge = screen.getByText('General');
    expect(badge.className).toContain('bg-blue-500/15');
    expect(badge.className).toContain('text-blue-400');
  });

  it('renders fee_reminder type badge with yellow styling', () => {
    render(
      <NotificationCard
        notification={{ ...baseNotification, type: 'fee_reminder' }}
      />
    );

    const badge = screen.getByText('Fee Reminder');
    expect(badge.className).toContain('bg-yellow-500/15');
    expect(badge.className).toContain('text-yellow-400');
  });

  it('renders holiday type badge with green styling', () => {
    render(
      <NotificationCard
        notification={{ ...baseNotification, type: 'holiday' }}
      />
    );

    const badge = screen.getByText('Holiday');
    expect(badge.className).toContain('bg-green-500/15');
    expect(badge.className).toContain('text-green-400');
  });

  it('renders announcement type badge with purple styling', () => {
    render(
      <NotificationCard
        notification={{ ...baseNotification, type: 'announcement' }}
      />
    );

    const badge = screen.getByText('Announcement');
    expect(badge.className).toContain('bg-purple-500/15');
    expect(badge.className).toContain('text-purple-400');
  });
});
