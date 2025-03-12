
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface MarketplaceEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function MarketplaceEmptyState({
  icon,
  title,
  description,
  buttonText,
  onButtonClick
}: MarketplaceEmptyStateProps) {
  return (
    <Card className="p-6 text-center">
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </Card>
  );
}
