
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { OrderManager } from '@/components/orders/OrderManager';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [orderMode, setOrderMode] = useState<'buyer' | 'seller' | null>(null);
  
  useEffect(() => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }
    
    if (id && user) {
      checkOrderAccess(id);
    }
  }, [isLoggedIn, id, user]);
  
  const checkOrderAccess = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_orders')
        .select('buyer_id, seller_id')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      
      if (data.buyer_id === user?.id) {
        setOrderMode('buyer');
      } else if (data.seller_id === user?.id) {
        setOrderMode('seller');
      } else {
        // Użytkownik nie ma dostępu do tego zamówienia
        setOrderMode(null);
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania dostępu do zamówienia:', error);
      setOrderMode(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          {isLoggedIn ? (
            orderMode ? (
              <div className="max-w-3xl mx-auto">
                <OrderManager mode={orderMode} orderId={id} />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Brak dostępu</h2>
                <p className="text-muted-foreground mb-6">
                  Nie masz uprawnień do przeglądania tego zamówienia lub zamówienie nie istnieje.
                </p>
              </div>
            )
          ) : null}
        </div>
      </main>
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        title="Wymagane logowanie"
        description="Aby przeglądać szczegóły zamówienia, musisz być zalogowany."
      />
      
      <Footer />
    </div>
  );
}
