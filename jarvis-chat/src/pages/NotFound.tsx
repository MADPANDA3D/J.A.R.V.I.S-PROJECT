import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, MessageCircle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () {
  const navigate = useNavigate();

  const handleGoBack = () {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="text-6xl font-bold text-primary">404</div>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Try these instead:
            </p>
            <div className="space-y-2">
              <Link
                to="/chat"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                Go to Chat
              </Link>
              <Link
                to="/chat"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Home className="w-4 h-4" />
                Go to Chat
              </Link>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link to="/chat">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
