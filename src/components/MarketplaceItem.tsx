
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag, Calendar, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

interface MarketplaceItemProps {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  userId?: string;
  rating?: number;
  reviewCount?: number;
  sale?: boolean;
  salePercentage?: number | null;
  forTesting?: boolean;
  testingPrice?: number | null;
  delay?: number;
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
  delay = 0
}: MarketplaceItemProps) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [purchaseType, setPurchaseType] = useState<'buy' | 'test'>(forTesting ? 'test' : 'buy');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Check if this product belongs to the current user
  const isUserProduct = user?.id === userId;
  
  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(purchaseType === 'buy' ? price : (testingPrice || 0));
  
  const originalPrice = sale && salePercentage 
    ? price / (1 - salePercentage / 100) 
    : undefined;
    
  const formattedOriginalPrice = originalPrice 
    ? new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
      }).format(originalPrice)
    : undefined;
  
  const handleProductClick = () => {
    // Allow all users to view products, no auth check needed
    navigate(`/marketplace/${id}`);
  };
  
  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowAuthDialog(true);
    } else {
      // Navigate to product page when user is logged in
      navigate(`/marketplace/${id}`);
    }
  };
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col"
      >
        <div 
          onClick={handleProductClick}
          className="block relative aspect-square overflow-hidden bg-rhythm-100 cursor-pointer"
        >
          {sale && salePercentage && (
            <Badge className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-600">
              {salePercentage}% ZNIŻKI
            </Badge>
          )}
          
          {forTesting && (
            <Badge className="absolute top-3 right-3 z-10 bg-primary/10 text-primary border-primary/20">
              <Calendar className="mr-1 h-3 w-3" />
              Dostępne do testów
            </Badge>
          )}
          
          {isUserProduct && (
            <Badge className="absolute top-3 left-3 z-10 bg-green-500 hover:bg-green-600">
              Twój produkt
            </Badge>
          )}
          
          <img
            src={image || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center mb-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {category}
            </Badge>
          </div>
          
          <div 
            className="block hover:text-primary transition-colors cursor-pointer"
            onClick={handleProductClick}
          >
            <h3 className="font-medium mt-2 mb-1 line-clamp-2">{title}</h3>
          </div>
          
          <div className="mt-auto">
            {!isUserProduct && forTesting ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN'
                    }).format(price)}
                  </span>
                  
                  {sale && formattedOriginalPrice && (
                    <span className="text-rhythm-500 line-through text-sm">
                      {formattedOriginalPrice}
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-rhythm-500 mb-3">
                  Możliwość testu: {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN'
                  }).format(testingPrice || 0)} / tydzień
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-lg">{formattedPrice}</span>
                {sale && formattedOriginalPrice && !isUserProduct && (
                  <span className="text-rhythm-500 line-through text-sm">
                    {formattedOriginalPrice}
                  </span>
                )}
                {forTesting && isUserProduct && (
                  <div className="text-sm text-rhythm-500 ml-auto">
                    Test: {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN'
                    }).format(testingPrice || 0)}
                  </div>
                )}
              </div>
            )}
            
            {isUserProduct ? (
              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleProductClick}
                  variant="outline"
                >
                  <Eye className="h-4 w-4" /> 
                  Zobacz produkt
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => navigate(`/profile?editProduct=${id}`)}
                >
                  <Pencil className="h-4 w-4" /> 
                  Edytuj
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full gap-2" 
                onClick={handlePurchaseClick}
              >
                <ShoppingCart className="h-4 w-4" /> 
                Zobacz produkt
              </Button>
            )}
          </div>
        </div>
      </motion.div>
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dokonać zakupu, musisz być zalogowany."
      />
    </>
  );
}
