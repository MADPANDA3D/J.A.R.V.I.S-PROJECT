import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'J.A.R.V.I.S OS',
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Avatar
              src="https://storage.googleapis.com/msgsndr/tfV7ObosaI3yF8QzekD7/media/68784f8d1db129a9bb49461d.png"
              alt="J.A.R.V.I.S OS Avatar"
              size="lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">{title}</h1>
          {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 sm:px-10">{children}</div>
      </div>
    </div>
  );
};
