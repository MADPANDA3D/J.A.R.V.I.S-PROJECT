import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'login' | 'register';

export const LoginPage: React.FC = () {
  const { user, initialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');

  // Get the intended destination from state (set by ProtectedRoute)
  const from = location.state?.from?.pathname || '/chat';

  // Redirect if already authenticated
  if (initialized && user) {
    return <Navigate to={from} replace />;
  }

  const handleLoginSuccess = () {
    navigate(from, { replace: true });
  };

  const handleRegisterSuccess = () {
    // After successful registration, user might need to confirm email
    // For now, we'll redirect to the intended destination
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout>
      {mode === 'login' ? (
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setMode('register')}
        />
      ) : (
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setMode('login')}
        />
      )}
    </AuthLayout>
  );
};
