
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag, Calendar, Eye, Pencil, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { toast } from '@/components/ui/use-toast';

interface MarketplaceItemProps {
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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Check if this product belongs to the current user
  const isUserProduct = user?.id === userId;
  
  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(price);
  
  const formattedTestPrice = testingPrice 
    ? new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
      }).format(testingPrice)
    : null;
  
  const originalPrice = sale && salePercentage 
    ? price / (1 - salePercentage / 100) 
    : undefined;
    
  const formattedOriginalPrice = originalPrice 
    ? new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
      }).format(originalPrice)
    : undefined;
  
  // Obsługa różnych formatów zdjęć
  let imageToShow = '/placeholder.svg';
  
  if (typeof image === 'string') {
    try {
      // Próbujemy sprawdzić, czy to string JSON
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageToShow = parsed[0]; // Bierzemy pierwszy obraz z tablicy
      } else {
        // Jeśli to nie tablica lub pusta, używamy oryginalnego stringa
        imageToShow = image;
      }
    } catch (e) {
      // Jeśli to nie JSON, używamy oryginalnego stringa
      imageToShow = image;
    }
  } else if (Array.isArray(image) && image.length > 0) {
    // Jeśli to już tablica, użyj pierwszego elementu
    imageToShow = image[0];
  }
  
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
  
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Create the full URL to the product
    const productUrl = `${window.location.origin}/marketplace/${id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(productUrl).then(
      () => {
        toast({
          title: "Link skopiowany",
          description: "Link do produktu został skopiowany do schowka.",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Błąd",
          description: "Nie udało się skopiować linku.",
          variant: "destructive",
        });
      }
    );
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
            src={imageToShow}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute bottom-3 right-3 opacity-70 hover:opacity-100"
            onClick={handleShareClick}
          >
            <Share2 className="h-4 w-4" />
          </Button>
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
                  <span className="font-semibold text-lg bg-primary/10 px-2 py-1 rounded text-primary">
                    {formattedPrice}
                  </span>
                  
                  {sale && formattedOriginalPrice && (
                    <span className="text-rhythm-500 line-through text-sm">
                      {formattedOriginalPrice}
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-rhythm-500 mb-3">
                  Możliwość testu: <span className="font-medium">{formattedTestPrice}</span> / tydzień
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-lg bg-primary/10 px-2 py-1 rounded text-primary">
                  {formattedPrice}
                </span>
                {sale && formattedOriginalPrice && !isUserProduct && (
                  <span className="text-rhythm-500 line-through text-sm">
                    {formattedOriginalPrice}
                  </span>
                )}
                {forTesting && (
                  <div className="text-sm text-rhythm-500 ml-auto">
                    {testingPrice ? (
                      <span>Test: <span className="font-medium">{formattedTestPrice}</span></span>
                    ) : null}
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
                  onClick={() => navigate(`/edit-product/${id}`)}
                >
                  <Pencil className="h-4 w-4" /> 
                  Edytuj
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full gap-2 font-bold text-base"
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
