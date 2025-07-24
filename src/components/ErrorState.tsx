import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  description?: string;
  type?: 'error' | 'network' | 'notFound' | 'unauthorized';
  retry?: () => void;
  showRetry?: boolean;
}

export default function ErrorState({
  title,
  description,
  type = 'error',
  retry,
  showRetry = true
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          defaultTitle: 'Connection Error',
          defaultDescription: 'Unable to connect to our servers. Please check your internet connection and try again.',
          color: 'text-amber-600'
        };
      case 'notFound':
        return {
          icon: AlertCircle,
          defaultTitle: 'Not Found',
          defaultDescription: 'The requested resource could not be found.',
          color: 'text-muted-foreground'
        };
      case 'unauthorized':
        return {
          icon: AlertCircle,
          defaultTitle: 'Access Denied',
          defaultDescription: 'You do not have permission to access this resource.',
          color: 'text-destructive'
        };
      default:
        return {
          icon: AlertCircle,
          defaultTitle: 'Something went wrong',
          defaultDescription: 'An unexpected error occurred. Please try again.',
          color: 'text-destructive'
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <CardTitle>{title || config.defaultTitle}</CardTitle>
          <CardDescription>
            {description || config.defaultDescription}
          </CardDescription>
        </CardHeader>
        {(showRetry || retry) && (
          <CardContent className="text-center">
            <div className="space-y-2">
              {retry && (
                <Button onClick={retry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}