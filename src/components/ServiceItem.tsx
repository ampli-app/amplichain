
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag, MapPin, Eye, Pencil, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { toast } from '@/components/ui/use-toast';

interface ServiceItemProps {
  id: string;
  title: string;
  price: number;
  priceType: string;
  image: string | string[];
  category: string;
  userId?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  tags?: string[];
  delay?: number;
}

export function ServiceItem({
  id,
  title,
  price,
  priceType,
  image,
  category,
  userId,
  rating = 0,
  reviewCount = 0,
  location,
  tags = [],
  delay = 0
}: ServiceItemProps) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Check if this service belongs to the current user
  const isUserService = user?.id === userId;
  
  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(price);
  
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
  
  const handleServiceClick = () => {
    // Allow all users to view services, no auth check needed
    navigate(`/services/${id}`);
  };
  
  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/messages/service/${id}`);
  };
  
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Create the full URL to the service
    const serviceUrl = `${window.location.origin}/services/${id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(serviceUrl).then(
      () => {
        toast({
          title: "Link skopiowany",
          description: "Link do usługi został skopiowany do schowka.",
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
          onClick={handleServiceClick}
          className="block relative aspect-video overflow-hidden bg-rhythm-100 cursor-pointer"
        >
          {isUserService && (
            <Badge className="absolute top-3 left-3 z-10 bg-green-500 hover:bg-green-600">
              Twoja usługa
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
          <div className="flex items-center mb-1 flex-wrap gap-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {category}
            </Badge>
            
            {location && (
              <Badge variant="outline" className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-800/50">
                <MapPin className="h-3 w-3" />
                {location}
              </Badge>
            )}
          </div>
          
          <div 
            className="block hover:text-primary transition-colors cursor-pointer"
            onClick={handleServiceClick}
          >
            <h3 className="font-medium mt-2 mb-2 line-clamp-2">{title}</h3>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 my-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs text-zinc-500 dark:text-zinc-400 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-lg text-primary">
                {formattedPrice} <span className="text-sm font-normal text-zinc-500">{priceType}</span>
              </div>
              
              {rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  {reviewCount > 0 && (
                    <span className="text-xs text-zinc-500">({reviewCount})</span>
                  )}
                </div>
              )}
            </div>
            
            {isUserService ? (
              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleServiceClick}
                  variant="outline"
                >
                  <Eye className="h-4 w-4" /> 
                  Zobacz
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => navigate(`/edit-service/${id}`)}
                >
                  <Pencil className="h-4 w-4" /> 
                  Edytuj
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full gap-2 font-bold text-base"
                onClick={handleContactClick}
              >
                <ShoppingCart className="h-4 w-4" /> 
                Kontakt
              </Button>
            )}
          </div>
        </div>
      </motion.div>
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby skontaktować się z usługodawcą, musisz być zalogowany."
      />
    </>
  );
}
