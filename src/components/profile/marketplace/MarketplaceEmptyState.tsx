
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface MarketplaceEmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  buttonIcon?: ReactNode;
  onButtonClick: () => void;
}

export function MarketplaceEmptyState({
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonClick
}: MarketplaceEmptyStateProps) {
  return (
    <Card className="p-6 text-center">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button onClick={onButtonClick}>
        {buttonIcon}
        {buttonText}
      </Button>
    </Card>
  );
}
