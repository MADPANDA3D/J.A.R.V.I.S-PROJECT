import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import type { User, Session } from '@supabase/supabase-js';

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

const TestComponent = () => (
  <div data-testid="protected-content">Protected Content</div>
);

describe('ProtectedRoute', () {
  beforeEach(() {
    vi.clearAllMocks();
  });

  it('should show loading spinner when auth is not initialized', () {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      initialized: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should show loading spinner when auth is loading', () {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      initialized: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render protected content when user is authenticated', () {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' } as User,
      session: {} as Session,
      loading: false,
      initialized: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(
      screen.queryByText('Checking authentication...')
    ).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      initialized: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // The component should redirect, so protected content should not be visible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Checking authentication...')
    ).not.toBeInTheDocument();
  });
});
