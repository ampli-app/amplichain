
import { Music, Plus, Pencil, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
  image_url?: string;
  category?: string;
  created_at: string;
}

interface ProductsTabProps {
  userProducts: Product[];
  isOwnProfile: boolean;
}

export function ProductsTab({ userProducts, isOwnProfile }: ProductsTabProps) {
  const navigate = useNavigate();
  
  const loadProductForEditing = (productId: string) => {
    navigate(`/edit-product/${productId}`);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Produkty</h2>
        {isOwnProfile && (
          <Button size="sm" onClick={() => navigate('/marketplace')}>
            <Plus className="h-4 w-4 mr-1" />
            Dodaj produkt
          </Button>
        )}
      </div>
      
      {userProducts.length > 0 ? (
        <div className="space-y-4">
          {userProducts.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-medium">{product.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{product.category || "Inne"}</Badge>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN'
                      }).format(product.price)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/marketplace/${product.id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Zobacz
                  </Button>
                  
                  {isOwnProfile && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => loadProductForEditing(product.id)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edytuj
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-background">
          <Music className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-medium mt-4">Brak produktów</h3>
          <p className="text-muted-foreground mt-2">
            {isOwnProfile ? "Dodaj swoje produkty do Rynku." : "Ten użytkownik nie ma jeszcze żadnych produktów na sprzedaż."}
          </p>
          {isOwnProfile && (
            <Button className="mt-4" onClick={() => navigate('/marketplace')}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj pierwszy produkt
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
