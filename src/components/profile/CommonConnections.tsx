
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommonConnectionsProps {
  count: number;
  userId: string;
}

export function CommonConnections({ count, userId }: CommonConnectionsProps) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Users className="h-4 w-4 mr-1" />
      <Link 
        to={`/connections?common=${userId}`} 
        className="hover:text-primary transition-colors"
      >
        {count} {count === 1 ? 'wspólne połączenie' : 
                count < 5 ? 'wspólne połączenia' : 
                'wspólnych połączeń'}
      </Link>
    </div>
  );
}
