
import { Badge } from '@/components/ui/badge';
import { TabCountProps } from './types';

export const TabCount = ({ count }: TabCountProps) => {
  if (count === 0) return null;
  
  return (
    <Badge className="ml-2" variant="secondary">
      {count}
    </Badge>
  );
};
