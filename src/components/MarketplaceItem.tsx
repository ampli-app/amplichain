
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  favoriteButtonClass = "absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
}: MarketplaceItemProps) {
  const [mainImage, setMainImage] = useState<string>('');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isUserProduct = user && userId === user.id;

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
    if (!isUserProduct) {
      navigate(`/marketplace/${id}`);
    }
  };
  
  const handleViewProduct = () => {
    navigate(`/marketplace/${id}`);
  };
  
  const handleEditProduct = () => {
    navigate(`/edit-product/${id}`);
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id, isFavorite);
    }
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${id}`;
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
      {isUserProduct && (
        <Badge className="absolute top-3 left-3 z-10 bg-green-500 hover:bg-green-600">
          Twój produkt
        </Badge>
      )}
      
      {!isUserProduct && (
        <Button 
          variant="secondary"
          size="icon" 
          className={favoriteButtonClass}
          onClick={handleToggleFavorite}
        >
          <Heart className={`h-4 w-4 text-red-500 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      )}
      
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
        
        {sale && salePercentage && !isUserProduct && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
            -{salePercentage}%
          </Badge>
        )}
        
        {forTesting && !isUserProduct && (
          <Badge className="absolute top-3 right-14 bg-amber-500 text-white">
            Dostępne do testów
          </Badge>
        )}
        
        {isUserProduct && forTesting && (
          <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
            Dostępne do testów
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
        
        {isUserProduct && (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleViewProduct}
            >
              <Eye className="h-4 w-4 mr-2" />
              Zobacz produkt
            </Button>
            <Button 
              variant="default" 
              className="flex-1 bg-[#9E9D1B] hover:bg-[#7e7c14]"
              onClick={handleEditProduct}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
