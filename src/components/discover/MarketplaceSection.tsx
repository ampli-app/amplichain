
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Item {
  id: string;
  title: string;
  image: string;
  price?: number;
  author?: string;
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
      <div className="grid grid-cols-5 gap-4">
        {items.map((item) => (
          <Link 
            key={item.id} 
            to={`/${itemType === 'products' ? 'product' : itemType}/${item.id}`}
            className="no-underline"
          >
            <Card className="h-40 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0 h-full">
                <div 
                  className="w-full h-full bg-gray-200"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
