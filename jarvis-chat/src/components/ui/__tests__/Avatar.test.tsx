import { render, screen, waitFor } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders image when provided valid src', async () => {
    render(<Avatar src="https://example.com/image.jpg" alt="Test Avatar" />);
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Test Avatar');
  });

  it('shows loading state initially', () => {
    render(<Avatar src="https://example.com/image.jpg" alt="Test Avatar" />);
    
    // Loading placeholder should be present
    const loadingDiv = document.querySelector('.animate-pulse');
    expect(loadingDiv).toBeInTheDocument();
  });

  it('shows initials fallback on error', async () => {
    render(<Avatar src="invalid-url" alt="John Doe" />);
    
    // Simulate image error
    const img = screen.getByRole('img');
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Avatar src="test.jpg" alt="Test" size="sm" />);
    expect(document.querySelector('.w-12')).toBeInTheDocument();

    rerender(<Avatar src="test.jpg" alt="Test" size="lg" />);
    expect(document.querySelector('.w-24')).toBeInTheDocument();
  });

  it('handles custom className', () => {
    render(<Avatar src="test.jpg" alt="Test" className="custom-class" />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });
});