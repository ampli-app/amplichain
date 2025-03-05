
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
  return (
    <div className="mb-12">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
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
