import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterFormData } from '@/types/auth';

const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine(val => val, {
      message: 'You must agree to the terms of service',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { signUp, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  const getPasswordStrength = (password: string): string => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'Very Weak';
    if (password.length < 8) return 'Weak';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'Fair';
    if (password.length < 12) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = (strength: string): string => {
    switch (strength) {
      case 'Very Weak':
        return 'text-red-500';
      case 'Weak':
        return 'text-orange-500';
      case 'Fair':
        return 'text-yellow-500';
      case 'Good':
        return 'text-blue-500';
      case 'Strong':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      setSuccess(null);
      await signUp(data.email, data.password);
      setSuccess(
        'Account created successfully! Please check your email to confirm your account.'
      );
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const isLoading = loading || isSubmitting;
  const passwordStrength = getPasswordStrength(password || '');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-primary">
          Create Account
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Join JARVIS to start your AI chat experience
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <div
            className="p-3 text-sm text-green-800 bg-green-100 border border-green-200 rounded-md dark:text-green-200 dark:bg-green-900/20 dark:border-green-800"
            role="alert"
            aria-live="polite"
          >
            {success}
          </div>
        )}

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
              placeholder="Create a password"
              disabled={isLoading}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={
                errors.password
                  ? 'password-error'
                  : passwordStrength
                    ? 'password-strength'
                    : undefined
              }
              {...register('password')}
            />
            {passwordStrength && (
              <p
                id="password-strength"
                className={`text-xs ${getPasswordStrengthColor(passwordStrength)}`}
              >
                Password strength: {passwordStrength}
              </p>
            )}
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              disabled={isLoading}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={
                errors.confirmPassword ? 'confirm-password-error' : undefined
              }
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                className="text-sm text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <input
              id="agreeToTerms"
              type="checkbox"
              disabled={isLoading}
              className="w-4 h-4 mt-0.5 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              aria-invalid={errors.agreeToTerms ? 'true' : 'false'}
              aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
              {...register('agreeToTerms')}
            />
            <div className="space-y-1">
              <label
                htmlFor="agreeToTerms"
                className="text-sm text-muted-foreground leading-relaxed"
              >
                I agree to the{' '}
                <a
                  href="/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
              {errors.agreeToTerms && (
                <p id="terms-error" className="text-sm text-destructive">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {onSwitchToLogin && (
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                className="text-primary hover:underline disabled:opacity-50"
                disabled={isLoading}
                onClick={onSwitchToLogin}
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
