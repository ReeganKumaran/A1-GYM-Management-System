import { render, screen } from '@testing-library/react';
import BillCard from '@/components/BillCard';

describe('BillCard', () => {
  const baseBill = {
    memberId: 'MEM-001',
    amount: 1500,
    date: '2025-01-15',
    dueDate: '2025-02-15',
    description: 'Monthly Membership Fee',
    status: 'pending' as const,
    paymentMethod: 'Credit Card',
  };

  it('renders bill description and amount', () => {
    render(<BillCard bill={baseBill} />);

    expect(screen.getByText('Monthly Membership Fee')).toBeInTheDocument();
    expect(screen.getByText(/1,500\.00/)).toBeInTheDocument();
  });

  it('renders payment method and member ID', () => {
    render(<BillCard bill={baseBill} />);

    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('MEM-001')).toBeInTheDocument();
  });

  it('renders formatted dates', () => {
    render(<BillCard bill={baseBill} />);

    expect(screen.getByText('Bill Date')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('renders paid status with green styling', () => {
    render(<BillCard bill={{ ...baseBill, status: 'paid' }} />);

    const badge = screen.getByText('Paid');
    expect(badge.className).toContain('bg-green-500/15');
    expect(badge.className).toContain('text-green-400');
  });

  it('renders pending status with yellow styling', () => {
    render(<BillCard bill={{ ...baseBill, status: 'pending' }} />);

    const badge = screen.getByText('Pending');
    expect(badge.className).toContain('bg-yellow-500/15');
    expect(badge.className).toContain('text-yellow-400');
  });

  it('renders overdue status with red styling', () => {
    render(<BillCard bill={{ ...baseBill, status: 'overdue' }} />);

    const badge = screen.getByText('Overdue');
    expect(badge.className).toContain('bg-red-500/15');
    expect(badge.className).toContain('text-red-400');
  });
});
