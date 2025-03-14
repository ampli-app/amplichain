
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Pencil, Share2, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
import { useOrderReservation } from '@/hooks/checkout/useOrderReservation';
import { useProductAvailability } from '@/hooks/useProductAvailability';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

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
  const buyButtonClickedRef = useRef(false);
  
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
  
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (buyButtonClickedRef.current) {
      console.log("Przycisk kup teraz został już kliknięty - ignorowanie powtórnych kliknięć");
      return;
    }
    
    // Ustaw flagę, aby zapobiec wielokrotnym kliknięciom
    buyButtonClickedRef.current = true;
    
    if (!isLoggedIn) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby dokonać zakupu, musisz być zalogowany.",
        variant: "destructive",
      });
      navigate('/login');
      buyButtonClickedRef.current = false;
      return;
    }

    if (!isAvailable) {
      toast({
        title: "Produkt niedostępny",
        description: "Ten produkt jest obecnie zarezerwowany lub został sprzedany.",
        variant: "destructive",
      });
      buyButtonClickedRef.current = false;
      return;
    }
    
    if (onBuyNow) {
      onBuyNow();
      buyButtonClickedRef.current = false;
      return;
    }
    
    if (isReserving || isInitiating || isChecking) {
      console.log("Proces rezerwacji już trwa - ignorowanie kliknięcia");
      buyButtonClickedRef.current = false;
      return;
    }
    
    setIsReserving(true);
    
    try {
      console.log("Rozpoczynam procedurę zakupu dla produktu", id);
      
      // Dodatkowe sprawdzenie statusu przed procesem rezerwacji
      const { data: productData, error: productStatusError } = await supabase
        .from('products')
        .select('status')
        .eq('id', id)
        .single();
        
      if (productStatusError) {
        console.error('Błąd podczas sprawdzania statusu produktu:', productStatusError);
        toast({
          title: "Błąd",
          description: "Nie udało się sprawdzić dostępności produktu.",
          variant: "destructive",
        });
        setIsReserving(false);
        buyButtonClickedRef.current = false;
        return;
      }
      
      if (productData.status !== 'available') {
        console.log('Produkt nie jest dostępny, aktualny status:', productData.status);
        toast({
          title: "Produkt niedostępny",
          description: "Ten produkt jest obecnie zarezerwowany lub sprzedany.",
          variant: "destructive",
        });
        setIsReserving(false);
        buyButtonClickedRef.current = false;
        return;
      }
      
      // Anuluj poprzednie rezerwacje, jeśli istnieją
      const canProceed = await cancelPreviousReservations();
      
      if (canProceed === false) {
        console.log("Nie można kontynuować - poprzednia rezerwacja jest aktywna");
        setIsReserving(false);
        buyButtonClickedRef.current = false;
        return;
      }
      
      console.log("Status produktu przed utworzeniem rezerwacji:", productData.status);
      
      const isTestMode = location.search.includes('mode=test');
      
      // Pobierz pełne dane produktu, jeśli nie zostały przekazane
      let productToUse = product;
      if (!productToUse) {
        console.log("Brak danych produktu, pobieranie z bazy danych");
        const { data: fetchedProduct, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (fetchError || !fetchedProduct) {
          console.error('Błąd podczas pobierania danych produktu:', fetchError);
          toast({
            title: "Błąd",
            description: "Nie udało się pobrać danych produktu.",
            variant: "destructive",
          });
          setIsReserving(false);
          buyButtonClickedRef.current = false;
          return;
        }
        
        productToUse = fetchedProduct;
      }
      
      if (productToUse) {
        console.log("Inicjuję rezerwację dla produktu", productToUse.id);
        // Nie przekazujemy rabatu przy kliknięciu przycisku "Kup teraz" - rabat będzie zastosowany w procesie checkoutu
        const reservation = await initiateOrder(productToUse, null, isTestMode);
        
        if (reservation) {
          console.log("Rezerwacja udana, przekierowuję do checkout z orderId:", reservation.id);
          if (isTestMode) {
            navigate(`/checkout/${id}?mode=test&orderId=${reservation.id}`);
          } else {
            navigate(`/checkout/${id}?orderId=${reservation.id}`);
          }
        } else {
          console.log("Nie udało się utworzyć rezerwacji - brak danych rezerwacji");
          toast({
            title: "Błąd",
            description: "Nie udało się utworzyć rezerwacji. Spróbuj ponownie za chwilę.",
            variant: "destructive",
          });
          buyButtonClickedRef.current = false;
        }
      } else {
        console.error("Brak danych produktu po wszystkich próbach pobrania!");
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych produktu.",
          variant: "destructive",
        });
        buyButtonClickedRef.current = false;
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia rezerwacji:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas inicjowania zamówienia.",
        variant: "destructive",
      });
      buyButtonClickedRef.current = false;
    } finally {
      // Opóźnione resetowanie stanu, aby zapobiec wielokrotnym kliknięciom
      setTimeout(() => {
        setIsReserving(false);
      }, 2000);
    }
  };

  const renderBuyButton = () => {
    // Pokaż stan ładowania tylko przy pierwszym sprawdzaniu
    if (isCheckingAvailability && !productStatus) {
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
        disabled={isReserving || buyButtonClickedRef.current}
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
