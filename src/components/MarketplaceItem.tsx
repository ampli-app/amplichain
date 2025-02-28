
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

interface MarketplaceItemProps {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  sale?: boolean;
  salePercentage?: number;
  forTesting?: boolean;
  testingPrice?: number;
  delay?: number;
}

export function MarketplaceItem({
  id,
  title,
  price,
  image,
  category,
  rating,
  reviewCount,
  sale = false,
  salePercentage,
  forTesting = false,
  testingPrice,
  delay = 0
}: MarketplaceItemProps) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [purchaseType, setPurchaseType] = useState<'buy' | 'test'>(forTesting ? 'test' : 'buy');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
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
  
  const handleProductClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowAuthDialog(true);
    } else {
      navigate(`/product/${id}`);
    }
  };
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300"
      >
        <div 
          onClick={handleProductClick}
          className="block relative aspect-square overflow-hidden bg-rhythm-100 cursor-pointer"
        >
          {sale && (
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
          
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {category}
            </Badge>
            
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="font-medium">{rating}</span>
              <span className="text-rhythm-500">({reviewCount})</span>
            </div>
          </div>
          
          <div 
            className="block hover:text-primary transition-colors cursor-pointer"
            onClick={handleProductClick}
          >
            <h3 className="font-medium mt-2 mb-1 line-clamp-1">{title}</h3>
          </div>
          
          {forTesting ? (
            <Tabs 
              defaultValue={purchaseType} 
              onValueChange={(value) => setPurchaseType(value as 'buy' | 'test')}
              className="mb-3"
            >
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="buy">Kup</TabsTrigger>
                <TabsTrigger value="test">Testuj przez tydzień</TabsTrigger>
              </TabsList>
              
              <TabsContent value="buy" className="mt-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN'
                  }).format(price)}</span>
                  
                  {sale && formattedOriginalPrice && (
                    <span className="text-rhythm-500 line-through text-sm">
                      {formattedOriginalPrice}
                    </span>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="test" className="mt-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN'
                  }).format(testingPrice || 0)}</span>
                  <span className="text-rhythm-500 text-sm">za tydzień</span>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-lg">{formattedPrice}</span>
              {sale && formattedOriginalPrice && (
                <span className="text-rhythm-500 line-through text-sm">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
          )}
          
          <Button 
            className="w-full gap-2" 
            onClick={handleProductClick}
          >
            <ShoppingCart className="h-4 w-4" /> 
            {purchaseType === 'buy' ? 'Zobacz produkt' : 'Wypożycz do testów'}
          </Button>
        </div>
      </motion.div>
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby zobaczyć szczegóły produktu i dokonać zakupu, musisz być zalogowany."
      />
    </>
  );
}
