import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Pencil, Share2, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useOrderReservation } from '@/hooks/checkout/useOrderReservation';
import { useProductAvailability } from '@/hooks/useProductAvailability';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductActionsProps {
  id: string;
  isUserProduct: boolean;
  product?: any;
  onBuyNow?: () => void;
}

export function ProductActions({ id, isUserProduct, product, onBuyNow }: ProductActionsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const isDiscoverPage = location.pathname === '/discover';
  const [isReserving, setIsReserving] = useState(false);
  
  const { initiateOrder, cancelPreviousReservations, isInitiating, isChecking } = useOrderReservation({ productId: id });
  const { isAvailable, isLoading: isCheckingAvailability, productStatus } = useProductAvailability(id);
  
  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/marketplace/${id}`);
  };
  
  const handleEditProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-product/${id}`);
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
  
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby dokonać zakupu, musisz być zalogowany.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!isAvailable) {
      toast({
        title: "Produkt niedostępny",
        description: "Ten produkt jest obecnie zarezerwowany lub został sprzedany.",
        variant: "destructive",
      });
      return;
    }
    
    if (onBuyNow) {
      onBuyNow();
      return;
    }
    
    if (isReserving || isInitiating || isChecking) {
      console.log("Proces rezerwacji już trwa - ignorowanie kliknięcia");
      return;
    }
    
    setIsReserving(true);
    
    try {
      await cancelPreviousReservations();
      
      const isTestMode = location.search.includes('mode=test');
      
      if (product) {
        console.log("Inicjujemy rezerwację dla produktu", product.id);
        const reservation = await initiateOrder(product, isTestMode);
        if (reservation) {
          console.log("Rezerwacja udana, przekierowujemy do checkout z orderId:", reservation.id);
          if (isTestMode) {
            navigate(`/checkout/${id}?mode=test&orderId=${reservation.id}`);
          } else {
            navigate(`/checkout/${id}?orderId=${reservation.id}`);
          }
          return;
        } else {
          console.log("Nie udało się utworzyć rezerwacji");
        }
      } else {
        console.log("Brak danych produktu, przekierowujemy bez orderId");
        if (isTestMode) {
          navigate(`/checkout/${id}?mode=test`);
        } else {
          navigate(`/checkout/${id}`);
        }
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia rezerwacji:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas inicjowania zamówienia.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsReserving(false);
      }, 2000);
    }
  };

  const renderBuyButton = () => {
    if (isCheckingAvailability) {
      return (
        <Button 
          variant="default" 
          size="sm"
          className="flex items-center gap-1 h-9"
          disabled={true}
          title="Sprawdzanie dostępności..."
        >
          <ShoppingCart className="h-4 w-4" />
          <span className={isDiscoverPage ? "hidden" : "hidden sm:inline"}>
            Sprawdzanie...
          </span>
        </Button>
      );
    }

    if (!isAvailable) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="sm"
                className="flex items-center gap-1 h-9 bg-gray-500"
                disabled={true}
                title="Produkt niedostępny"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className={isDiscoverPage ? "hidden" : "hidden sm:inline"}>
                  Niedostępny
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ten produkt jest {productStatus === 'reserved' ? 'zarezerwowany' : 'niedostępny'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button 
        variant="default" 
        size="sm"
        className="flex items-center gap-1 h-9"
        onClick={handleBuyNow}
        disabled={isReserving}
        title="Kup teraz"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className={isDiscoverPage ? "hidden" : "hidden sm:inline"}>
          {isReserving ? "Rezerwowanie..." : "Kup teraz"}
        </span>
      </Button>
    );
  };

  return (
    <div className="flex justify-between mt-4">
      <div>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 h-9"
          onClick={handleViewProduct}
          title="Zobacz produkt"
        >
          <Eye className="h-4 w-4" />
          <span className={isDiscoverPage ? "hidden" : "hidden sm:inline"}>Zobacz produkt</span>
        </Button>
      </div>
      
      <div className="flex gap-2">
        {!isUserProduct && renderBuyButton()}
        
        {isUserProduct && (
          <Button 
            variant="default" 
            size="sm"
            className="bg-[#9E9D1B] hover:bg-[#7e7c14] flex items-center gap-1 h-9"
            onClick={handleEditProduct}
            title="Edytuj"
          >
            <Pencil className="h-4 w-4" />
            <span className={isDiscoverPage ? "hidden" : "hidden sm:inline"}>Edytuj</span>
          </Button>
        )}
        
        <Button 
          variant="secondary" 
          size="icon"
          className="h-9 w-9"
          onClick={handleShare}
          title="Udostępnij"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
