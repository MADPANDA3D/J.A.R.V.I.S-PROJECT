import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () {
  it('renders copyright information', () {
    render(<Footer />);
    
    expect(screen.getByText(/© 2024 JARVIS. All rights reserved./)).toBeInTheDocument();
  });

  it('shows version information by default', () {
    render(<Footer />);
    
    expect(screen.getByText('JARVIS v1.0')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant Interface')).toBeInTheDocument();
  });

  it('hides version information when showVersion is false', () {
    render(<Footer showVersion={false} />);
    
    expect(screen.queryByText('JARVIS v1.0')).not.toBeInTheDocument();
    expect(screen.queryByText('AI Assistant Interface')).not.toBeInTheDocument();
    expect(screen.getByText(/© 2024 JARVIS. All rights reserved./)).toBeInTheDocument();
  });

  it('applies custom className', () {
    render(<Footer className="custom-footer" />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('custom-footer');
  });

  it('has proper ARIA attributes', () {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveAttribute('aria-label', 'Application information');
  });
});