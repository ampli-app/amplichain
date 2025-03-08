
import { Card, CardContent } from '@/components/ui/card';
import { EmptyStateProps } from './types';

export const EmptyState = ({ type }: EmptyStateProps) => {
  const getMessage = () => {
    switch (type) {
      case 'pending':
        return 'Nie masz żadnych oczekujących zamówień na konsultacje.';
      case 'active':
        return 'Nie masz żadnych aktywnych konsultacji.';
      case 'completed':
        return 'Nie masz żadnych zakończonych konsultacji.';
      case 'rejected':
        return 'Nie masz żadnych odrzuconych zamówień.';
      default:
        return 'Nie masz żadnych zamówień konsultacji.';
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
