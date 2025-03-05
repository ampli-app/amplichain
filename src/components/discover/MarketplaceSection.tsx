
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketplaceItem } from '@/components/MarketplaceItem';

interface Item {
  id: string;
  title: string;
  image: string;
  price?: number;
  author?: string;
  category?: string;
}

interface MarketplaceSectionProps {
  title: string;
  itemType: 'products' | 'services' | 'consultations';
  items: Item[];
}

export function MarketplaceSection({ title, itemType, items }: MarketplaceSectionProps) {
  const getViewAllPath = () => {
    if (itemType === 'products') {
      return '/marketplace?tab=products';
    } else if (itemType === 'services') {
      return '/marketplace?tab=services';
    } else {
      return '/marketplace?tab=consultations';
    }
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <Link to={getViewAllPath()} className="no-underline">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Zobacz wszystkie
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item, index) => (
          <MarketplaceItem
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price || 0}
            image={item.image}
            category={item.category || "Inne"}
            delay={index * 0.05}
            favoriteButtonClass="absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
          />
        ))}
      </div>
    </div>
  );
}
