
import { Card, CardContent } from '@/components/ui/card';
import { EmptyStateProps } from './types';

export const EmptyState = ({ type }: EmptyStateProps) => {
  const getMessage = () => {
    switch (type) {
      case 'pending':
        return 'Nie masz żadnych oczekujących rezerwacji.';
      case 'active':
        return 'Nie masz żadnych aktywnych konsultacji.';
      case 'completed':
        return 'Nie masz żadnych zakończonych konsultacji.';
      case 'cancelled':
        return 'Nie masz żadnych anulowanych konsultacji.';
      default:
        return 'Nie masz żadnych konsultacji.';
    }
  };

  return (
    <Card>
      <CardContent className="p-6 text-center text-muted-foreground">
        {getMessage()}
      </CardContent>
    </Card>
  );
};
