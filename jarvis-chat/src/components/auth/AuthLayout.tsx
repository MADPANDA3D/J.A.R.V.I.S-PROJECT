import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'JARVIS',
  subtitle = 'Your AI Assistant',
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">{title}</h1>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 sm:px-10">{children}</div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 JARVIS. All rights reserved.
        </p>
      </div>
    </div>
  );
};
