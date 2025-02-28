import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Pencil } from 'lucide-react';

export default function Profile() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [userProducts, setUserProducts] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      fetchUserProducts();
    }
  }, [isLoggedIn, navigate]);

  const fetchUserProducts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user products:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać produktów użytkownika.",
        variant: "destructive",
      });
    } else {
      setUserProducts(data);
    }
  };

  const loadProductForEditing = async (productId: string) => {
    // Navigate to the edit product page directly
    navigate(`/edit-product/${productId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <h1 className="text-3xl font-bold mb-6">Twój profil</h1>
          <h2 className="text-2xl font-semibold mb-4">Moje produkty</h2>
          <div className="grid grid-cols-1 gap-4">
            {userProducts.map((product) => (
              <div key={product.id} className="border p-4 rounded-lg">
                <h3 className="text-xl font-medium">{product.title}</h3>
                <p className="text-gray-600">{product.description}</p>
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => loadProductForEditing(product.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
