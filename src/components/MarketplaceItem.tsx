
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProductImage } from './marketplace/ProductImage';
import { ProductBadges } from './marketplace/ProductBadges';
import { ProductActions } from './marketplace/ProductActions';
import { ProductPrice } from './marketplace/ProductPrice';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isUserProduct = user && userId === user.id;

  const handleClick = () => {
    if (!isUserProduct) {
      navigate(`/marketplace/${id}`);
    }
  };
  
  return (
    <Card 
      className={`overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300 animate-fade-up relative`}
      style={{ animationDelay: `${delay}s` }}
      onClick={handleClick}
    >
      {/* Badges - left-aligned in the top-left corner */}
      <ProductBadges 
        forTesting={forTesting} 
        isUserProduct={isUserProduct} 
        sale={sale} 
        salePercentage={salePercentage} 
      />
      
      {/* Favorite button - always in the top-right corner */}
      <Button 
        variant="secondary"
        size="icon" 
        className={favoriteButtonClass}
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleFavorite) {
            onToggleFavorite(id, isFavorite);
          }
        }}
      >
        <Heart className={`h-4 w-4 text-red-500 ${isFavorite ? "fill-current" : ""}`} />
      </Button>
      
      {/* Product image */}
      <ProductImage image={image} title={title} />
      
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{title}</h3>
        
        <div className="flex items-center mb-2">
          <Badge variant="outline">{category}</Badge>
        </div>
        
        {/* Product price */}
        <ProductPrice 
          price={price} 
          sale={sale} 
          salePercentage={salePercentage} 
          forTesting={forTesting} 
          testingPrice={testingPrice} 
        />
        
        {/* Product actions - properly aligned buttons */}
        <ProductActions 
          id={id} 
          isUserProduct={isUserProduct} 
        />
      </CardContent>
    </Card>
  );
}
