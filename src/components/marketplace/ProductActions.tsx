
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Pencil, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from '@/utils/orderUtils';

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
    console.log("Kliknięto przycisk Kup Teraz dla produktu:", id);
    
    // Blokowanie wielokrotnych kliknięć
    if (isReserving) {
      console.log("Proces rezerwacji już trwa, blokuję ponowne kliknięcie");
      return;
    }
    
    if (!isLoggedIn) {
      console.log("Użytkownik nie jest zalogowany, przekierowuję do logowania");
      toast({
        title: "Wymagane logowanie",
        description: "Aby dokonać zakupu, musisz być zalogowany.",
        variant: "destructive",
      });
      navigate('/login', { state: { returnUrl: `/checkout/${id}` }});
      return;
    }
    
    if (!isValidUUID(id)) {
      console.error("Nieprawidłowy format ID produktu:", id);
      toast({
        title: "Błąd produktu",
        description: "Nieprawidłowy format ID produktu. Prosimy o kontakt z administracją.",
        variant: "destructive",
      });
      return;
    }
    
    setIsReserving(true);
    
    try {
      if (onBuyNow) {
        console.log("Używam dostarczonej funkcji onBuyNow");
        onBuyNow();
        return;
      }
      
      // Sprawdź, czy URL zawiera parametr trybu testowego
      const isTestMode = location.search.includes('mode=test');
      console.log("Tryb testowy:", isTestMode);
      
      // Sprawdź, czy produkt istnieje
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (productError) {
        console.error("Błąd podczas sprawdzania produktu:", productError);
        toast({
          title: "Błąd produktu",
          description: "Nie udało się pobrać danych produktu. Spróbuj ponownie później.",
          variant: "destructive",
        });
        setIsReserving(false);
        return;
      }
      
      if (!productData) {
        console.error("Nie znaleziono produktu o ID:", id);
        toast({
          title: "Błąd produktu",
          description: "Nie znaleziono produktu. Spróbuj ponownie później.",
          variant: "destructive",
        });
        setIsReserving(false);
        return;
      }
      
      // Przekieruj natychmiast do ekranu koszyka
      const checkoutUrl = isTestMode 
        ? `/checkout/${id}?mode=test` 
        : `/checkout/${id}`;
      
      console.log("Przekierowanie do:", checkoutUrl);
      navigate(checkoutUrl);
    } catch (error) {
      console.error('Błąd podczas inicjowania zakupu:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas inicjowania zamówienia.",
        variant: "destructive",
      });
      setIsReserving(false);
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
            disabled={isReserving}
            title="Kup teraz"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className={isDiscoverPage ? "hidden" : "hidden sm:inline"}>
              {isReserving ? "Rezerwowanie..." : "Kup teraz"}
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
