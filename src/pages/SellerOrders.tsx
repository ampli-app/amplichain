
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { OrderManager } from '@/components/orders/OrderManager';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { useState } from 'react';

export default function SellerOrders() {
  const { isLoggedIn } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(!isLoggedIn);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            {isLoggedIn ? (
              <OrderManager mode="seller" />
            ) : null}
          </div>
        </div>
      </main>
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        title="Wymagane logowanie"
        description="Aby zarządzać zamówieniami jako sprzedawca, musisz być zalogowany."
      />
      
      <Footer />
    </div>
  );
}
