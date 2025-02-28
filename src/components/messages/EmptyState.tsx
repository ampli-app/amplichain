
import { Button } from '@/components/ui/button';
import { MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  error?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  error = false, 
  isLoading = false,
  onRetry 
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <div className={`mb-4 mx-auto h-16 w-16 rounded-full ${error ? 'bg-destructive/10' : 'bg-primary/10'} flex items-center justify-center`}>
          {error ? (
            <AlertCircle className="h-8 w-8 text-destructive" />
          ) : (
            <MessageCircle className="h-8 w-8 text-primary" />
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className={`${error ? 'text-destructive/80' : 'text-gray-500'} mb-6`}>{description}</p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.label}
            </Button>
          )}
          
          {error && onRetry && (
            <Button 
              variant="outline" 
              onClick={onRetry} 
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Próbuję ponownie...' : 'Spróbuj ponownie'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
