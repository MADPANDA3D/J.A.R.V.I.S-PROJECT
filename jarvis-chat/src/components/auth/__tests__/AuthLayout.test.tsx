import { render, screen } from '@testing-library/react';
import { AuthLayout } from '../AuthLayout';

describe('AuthLayout', () {
  it('renders default title "J.A.R.V.I.S OS"', () {
    render(<AuthLayout>Test content</AuthLayout>);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('J.A.R.V.I.S OS');
  });

  it('renders custom title when provided', () {
    render(<AuthLayout title="Custom Title">Test content</AuthLayout>);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title');
  });

  it('renders subtitle when provided', () {
    render(<AuthLayout subtitle="Test subtitle">Test content</AuthLayout>);
    
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () {
    render(<AuthLayout>Test content</AuthLayout>);
    
    // Should not have any subtitle paragraph
    expect(screen.queryByText(/Your AI Assistant/)).not.toBeInTheDocument();
  });

  it('renders avatar with correct attributes', () {
    render(<AuthLayout>Test content</AuthLayout>);
    
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('alt', 'J.A.R.V.I.S OS Avatar');
    expect(avatar).toHaveAttribute('src', expect.stringContaining('googleapis.com'));
  });

  it('renders children content', () {
    render(<AuthLayout>Test children content</AuthLayout>);
    
    expect(screen.getByText('Test children content')).toBeInTheDocument();
  });

  it('has proper responsive classes', () {
    render(<AuthLayout>Test content</AuthLayout>);
    
    const container = screen.getByText('Test content').closest('.px-4');
    expect(container).toHaveClass('sm:px-10');
  });
});