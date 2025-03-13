
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Pencil, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  
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
    
    // Blokowanie wielokrotnych kliknięć
    if (isProcessing) return;
    
    // Sprawdzenie, czy użytkownik jest zalogowany
    if (!isLoggedIn) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby dokonać zakupu, musisz być zalogowany.",
        variant: "destructive",
      });
      navigate('/login', { state: { returnUrl: `/checkout/${id}` }});
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Jeśli dostarczono funkcję onBuyNow, użyj jej
      if (onBuyNow) {
        onBuyNow();
        return;
      }
      
      // Sprawdź, czy URL zawiera parametr trybu testowego
      const isTestMode = location.search.includes('mode=test');
      
      // Bezpośrednie przekierowanie do checkout
      const checkoutUrl = isTestMode 
        ? `/checkout/${id}?mode=test` 
        : `/checkout/${id}`;
      
      toast({
        title: "Przechodzę do finalizacji",
        description: "Przygotowuję zamówienie...",
      });
      navigate(checkoutUrl);
    } catch (error) {
      console.error('Błąd podczas inicjowania zakupu:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas inicjowania zamówienia.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
        {!isUserProduct && (
          <Button 
            variant="default" 
            size="sm"
            className="flex items-center gap-1 h-9"
            onClick={handleBuyNow}
            disabled={isProcessing}
            title="Kup teraz"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className={isDiscoverPage ? "hidden" : "hidden sm:inline"}>
              {isProcessing ? "Przetwarzanie..." : "Kup teraz"}
            </span>
          </Button>
        )}
        
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
