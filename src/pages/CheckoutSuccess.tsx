
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  Phone, 
  Mail, 
  Home, 
  Loader2,
  Package,
  Clock
} from 'lucide-react';

export default function CheckoutSuccess() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'buy';
  
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Dane produktu
  const [product, setProduct] = useState<any>(null);
  // Dane profilu użytkownika
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (!id) {
      navigate('/marketplace');
      return;
    }
    
    fetchProductData();
    if (user) {
      fetchUserProfile(user.id);
    }
  }, [id, isLoggedIn, user]);
  
  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych produktu.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      setProduct(data);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
            </div>
            <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie danych zamówienia...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Format daty
  const formatDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('pl-PL');
  };
  
  // Określ treści w zależności od trybu zakupu
  const pageTitle = mode === 'buy' 
    ? 'Dziękujemy za zakup!' 
    : 'Rezerwacja testowa potwierdzona!';
  
  const pageDescription = mode === 'buy'
    ? 'Twoje zamówienie zostało przyjęte do realizacji'
    : 'Twoja rezerwacja testowa została potwierdzona';
  
  // Przykładowe dane zamówienia
  const orderNumber = `ORD${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
  const estimatedDelivery = formatDate(3); // 3 dni na dostawę
  const testEndDate = formatDate(7); // 7 dni testu
  
  // Ustalamy nazwę użytkownika
  const userName = userProfile?.full_name || "Użytkownik";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold mb-3">{pageTitle}</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              {pageDescription}
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="mb-8">
              <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-zinc-500">Numer zamówienia</p>
                    <p className="font-medium">{orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Data zamówienia</p>
                    <p className="font-medium">{new Date().toLocaleDateString('pl-PL')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {mode === 'buy' ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-4">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Status zamówienia: Opłacone</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Sprzedawca został powiadomiony o Twoim zakupie. Przygotuje i wyśle produkt najszybciej jak to możliwe.
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Przewidywana dostawa:</span> {estimatedDelivery}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 flex items-start gap-4">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-purple-800 dark:text-purple-300">Status rezerwacji: Potwierdzona</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                        Sprzedawca został powiadomiony o Twojej rezerwacji testowej. Produkt zostanie dostarczony w ciągu kilku dni.
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Przewidywana dostawa:</span> {estimatedDelivery}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Koniec okresu testowego:</span> {testEndDate}
                      </p>
                    </div>
                  </div>
                )}
                
                {product && (
                  <div className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                        {product.image_url && (
                          <img 
                            src={typeof product.image_url === 'string' 
                              ? (product.image_url.startsWith('[') 
                                ? JSON.parse(product.image_url)[0] 
                                : product.image_url)
                              : (Array.isArray(product.image_url) 
                                ? product.image_url[0] 
                                : '/placeholder.svg')
                            } 
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{product.title}</h3>
                        <p className="text-sm text-zinc-500">{product.category}</p>
                        <div className="flex justify-between items-end mt-2">
                          <div className="text-sm">
                            <span className="text-zinc-500">
                              {mode === 'buy' ? 'Zakup produktu' : 'Test przez 7 dni'}
                            </span>
                          </div>
                          <span className="font-medium">
                            {new Intl.NumberFormat('pl-PL', {
                              style: 'currency',
                              currency: 'PLN'
                            }).format(mode === 'buy' ? product.price : product.testing_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="font-medium">Dane kontaktowe</p>
                    <div className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>+48 xxx xxx xxx</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Adres dostawy</p>
                    <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Home className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{userName}</p>
                        <p>ul. Przykładowa 123</p>
                        <p>00-000 Warszawa</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 space-y-4">
                  <div className="pt-2 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button asChild>
                      <Link to="/marketplace">
                        Kontynuuj zakupy
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="#" className="flex items-center justify-center gap-2">
                        Śledź status zamówienia
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  
                  <p className="text-center text-sm text-zinc-500">
                    Masz pytania dotyczące Twojego {mode === 'buy' ? 'zamówienia' : 'testu'}? <a href="#" className="text-primary underline">Skontaktuj się z nami</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
