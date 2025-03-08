
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MarketplaceEmptyStateProps {
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function MarketplaceEmptyState({
  message,
  buttonText,
  onButtonClick
}: MarketplaceEmptyStateProps) {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button onClick={onButtonClick}>
        {buttonText}
      </Button>
    </Card>
  );
}
