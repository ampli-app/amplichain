
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <div className="mb-4 mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
