import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) {
  const { signIn, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) {
    try {
      setError(null);
      await signIn(data.email, data.password);
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-primary">
          Welcome to JARVIS
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Sign in to your account to continue
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              disabled={isLoading}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              disabled={isLoading}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              disabled={isLoading}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              {...register('rememberMe')}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm text-muted-foreground"
            >
              Remember me
            </label>
          </div>

          {error && (
            <div
              className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-describedby={error ? 'error-message' : undefined}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <button
            type="button"
            className="text-sm text-primary hover:underline disabled:opacity-50"
            disabled={isLoading}
            onClick={() {
              // TODO: Implement forgot password functionality
              console.log('Forgot password clicked');
            }}
          >
            Forgot your password?
          </button>

          {onSwitchToRegister && (
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-primary hover:underline disabled:opacity-50"
                disabled={isLoading}
                onClick={onSwitchToRegister}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
