
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
  
  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/marketplace/${id}`);
  };
  
  const handleEditProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      {/* Znaczniki - zawsze po lewej stronie */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {forTesting && (
          <Badge className="bg-amber-500 hover:bg-amber-500">
            Dostępne do testów
          </Badge>
        )}
        
        {isUserProduct && (
          <Badge className="bg-green-500 hover:bg-green-500">
            Twój produkt
          </Badge>
        )}
        
        {sale && salePercentage && !isUserProduct && (
          <Badge className="bg-red-500 hover:bg-red-500">
            -{salePercentage}%
          </Badge>
        )}
      </div>
      
      {/* Przycisk ulubione - zawsze po prawej stronie */}
      <Button 
        variant="secondary"
        size="icon" 
        className={favoriteButtonClass}
        onClick={handleToggleFavorite}
      >
        <Heart className={`h-4 w-4 text-red-500 ${isFavorite ? "fill-current" : ""}`} />
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
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{title}</h3>
        
        <div className="flex items-center mb-2">
          <Badge variant="outline">{category}</Badge>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div>
            {sale && salePercentage ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary">{formattedSalePrice}</span>
                <span className="text-sm text-muted-foreground line-through">{formattedPrice}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary">{formattedPrice}</span>
            )}
          </div>
          
          {forTesting && testingPrice && (
            <div className="text-sm text-muted-foreground">
              Test: {formattedTestingPrice}
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-4 gap-2">
          {/* Przycisk "Zobacz produkt" zawsze widoczny */}
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleViewProduct}
          >
            <Eye className="h-4 w-4" />
            Zobacz produkt
          </Button>
          
          <div className="flex gap-2">
            {/* Przycisk "Edytuj" tylko dla własnych produktów */}
            {isUserProduct && (
              <Button 
                variant="default" 
                size="sm"
                className="bg-[#9E9D1B] hover:bg-[#7e7c14] flex items-center gap-1"
                onClick={handleEditProduct}
              >
                <Pencil className="h-4 w-4" />
                Edytuj
              </Button>
            )}
            
            {/* Przycisk "Udostępnij" zawsze widoczny */}
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
