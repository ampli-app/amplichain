
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export interface MarketplaceItemProps {
  id: string;
  title: string;
  price: number;
  image: string | string[];
  category: string;
  userId?: string;
  rating?: number;
  reviewCount?: number;
  sale?: boolean;
  salePercentage?: number | null;
  forTesting?: boolean;
  testingPrice?: number | null;
  delay?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  favoriteButtonClass?: string;
}

export function MarketplaceItem({ 
  id, 
  title, 
  price, 
  image, 
  category, 
  userId, 
  rating = 0, 
  reviewCount = 0, 
  sale = false, 
  salePercentage, 
  forTesting = false,
  testingPrice,
  delay = 0,
  isFavorite = false,
  onToggleFavorite,
  favoriteButtonClass = "absolute top-3 right-3 opacity-70 hover:opacity-100 z-10 text-red-500 hover:text-red-600"
}: MarketplaceItemProps) {
  const [mainImage, setMainImage] = useState<string>('');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (typeof image === 'string') {
      setMainImage(image);
    } else if (Array.isArray(image) && image.length > 0) {
      setMainImage(image[0]);
    } else {
      setMainImage('/placeholder.svg');
    }
  }, [image]);
  
  const handleClick = () => {
    navigate(`/marketplace/${id}`);
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id, isFavorite);
    }
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/marketplace/${id}`;
    navigator.clipboard.writeText(productUrl);
    toast({
      title: "Link skopiowany",
      description: "Link do produktu został skopiowany do schowka.",
    });
  };
  
  const calculateSalePrice = (originalPrice: number, salePercentage: number) => {
    return originalPrice - (originalPrice * (salePercentage / 100));
  };
  
  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(price);
  
  const formattedSalePrice = sale && salePercentage ? 
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(calculateSalePrice(price, salePercentage)) : null;
    
  const formattedTestingPrice = forTesting && testingPrice ? 
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(testingPrice) : null;

  return (
    <Card 
      className={`overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300 animate-fade-up relative`}
      style={{ animationDelay: `${delay}s` }}
      onClick={handleClick}
    >
      <Button 
        variant="secondary"
        size="icon" 
        className={favoriteButtonClass}
        onClick={handleToggleFavorite}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute bottom-3 right-3 opacity-70 hover:opacity-100 z-10"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>
      
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <img 
          src={mainImage || '/placeholder.svg'} 
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {sale && salePercentage && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
            -{salePercentage}%
          </Badge>
        )}
        
        {forTesting && (
          <Badge className="absolute top-3 left-3 bg-amber-500 text-white">
            Testuj przed zakupem
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{title}</h3>
        
        <div className="flex items-center mb-2">
          <Badge variant="outline">{category}</Badge>
        </div>
        
        <div className="mt-2">
          {sale && salePercentage ? (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary">{formattedSalePrice}</span>
              <span className="text-sm text-muted-foreground line-through">{formattedPrice}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary">{formattedPrice}</span>
          )}
          
          {forTesting && testingPrice && (
            <div className="mt-1 text-sm text-muted-foreground">
              Test: {formattedTestingPrice}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
