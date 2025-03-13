
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/components/marketplace/types';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { MarketplaceEmptyState } from './MarketplaceEmptyState';
import { toast } from '@/components/ui/use-toast';

interface ProductsTabContentProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ProductsTabContent({ userId, isOwnProfile }: ProductsTabContentProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          toast({
            title: "Błąd",
            description: "Nie udało się pobrać produktów.",
            variant: "destructive",
          });
          console.error('Error fetching products:', error);
          return;
        }
        
        // Map database results to Product type
        setProducts((data || []).map(product => ({
          ...product,
          user_id: product.user_id || userId,
          status: product.status as 'available' | 'reserved' | 'sold' | string
        })));
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [userId]);

  return (
    <div className="space-y-6">
      {isOwnProfile && (
        <div className="flex justify-end">
          <Button asChild>
            <Link to="/edit-product">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj produkt
            </Link>
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isOwner={isOwnProfile}
            />
          ))}
        </div>
      ) : (
        <MarketplaceEmptyState
          icon={<Package className="h-12 w-12 text-primary-500/20" />}
          title="Brak produktów"
          description={isOwnProfile 
            ? "Nie dodałeś jeszcze żadnych produktów. Kliknij przycisk powyżej, aby dodać swój pierwszy produkt."
            : "Ten użytkownik nie ma jeszcze żadnych produktów."}
        />
      )}
    </div>
  );
}
