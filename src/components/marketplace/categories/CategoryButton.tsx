
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '../icons/CategoryIcon';

interface CategoryButtonProps {
  id: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryButton({ id, name, isSelected, onClick }: CategoryButtonProps) {
  return (
    <Button
      key={id}
      variant={isSelected ? 'default' : 'outline'}
      className="whitespace-nowrap rounded-full flex items-center gap-2 px-6 flex-shrink-0"
      onClick={onClick}
    >
      <CategoryIcon categoryName={name} />
      {name}
    </Button>
  );
}
