import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Copy, 
  Clock, 
  Package, 
  ArrowLeft,
  Calendar,
  MapPin,
  Loader2,
  ShoppingCart
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutSuccess() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTestMode = location.search.includes('mode=test');
  
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [sellerInfo, setSellerInfo] = useState({
    name: "Sprzedawca",
    email: "kontakt@example.com",
    phone: "123-456-789",
    location: ""
  });
  const [orderCreated, setOrderCreated] = useState(false);
  
  // Generujemy losowy numer zamówienia
  const orderNumber = `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // Symulujemy czas dostawy
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);
  
  const testEndDate = new Date();
  testEndDate.setDate(testEndDate.getDate() + 7);
  
  useEffect(() => {
    if (!id || !user) return;
    
    const fetchProductData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch product data
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
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setProduct(data);
          
          // Fetch seller info
          if (data.user_id) {
            fetchSellerInfo(data.user_id);
          }
          
          // Create order if it doesn't exist yet
          if (!orderCreated) {
            createOrder(data);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductData();
  }, [id, user, orderCreated]);
  
  const createOrder = async (productData: any) => {
    if (!user || !productData) return;
    
    try {
      // Sprawdź, czy zamówienie już istnieje
      const { data: existingOrders, error: fetchError } = await supabase
        .from('product_orders')
        .select('id')
        .eq('product_id', productData.id)
        .eq('buyer_id', user.id)
        .eq('status', 'oczekujące')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) {
        console.error('Błąd podczas sprawdzania istniejących zamówień:', fetchError);
        return;
      }
      
      // Jeśli zamówienie już istnieje, nie tworzymy nowego
      if (existingOrders && existingOrders.length > 0) {
        console.log('Zamówienie już istnieje:', existingOrders[0].id);
        setOrderCreated(true);
        return;
      }
      
      // Pobierz opcję dostawy (używamy kuriera jako domyślnej opcji)
      const { data: deliveryOptions, error: deliveryError } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('name', 'Kurier')
        .limit(1);
      
      if (deliveryError || !deliveryOptions || deliveryOptions.length === 0) {
        console.error('Błąd podczas pobierania opcji dostawy:', deliveryError);
        return;
      }
      
      const deliveryOption = deliveryOptions[0];
      
      // Cena produktu zależna od trybu (test/zakup)
      const productPrice = isTestMode && productData.testing_price 
        ? parseFloat(productData.testing_price) 
        : parseFloat(productData.price);
      
      const totalAmount = productPrice + deliveryOption.price;
      
      // Utwórz nowe zamówienie
      const { data, error } = await supabase
        .from('product_orders')
        .insert({
          product_id: productData.id,
          buyer_id: user.id,
          seller_id: productData.user_id,
          total_amount: totalAmount,
          delivery_option_id: deliveryOption.id,
          status: 'oczekujące',
          payment_method: 'Karta płatnicza',
          order_type: isTestMode ? 'test' : 'purchase',
          test_end_date: isTestMode ? testEndDate.toISOString() : null
        })
        .select();
      
      if (error) {
        console.error('Błąd podczas tworzenia zamówienia:', error);
        toast({
          title: "Ostrzeżenie",
          description: "Zamówienie mogło nie zostać zapisane poprawnie. Sprawdź swoje zamówienia.",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        console.log('Zamówienie utworzone:', data[0].id);
        setOrderCreated(true);
        toast({
          title: "Sukces",
          description: "Zamówienie zostało pomyślnie zapisane.",
        });
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas tworzenia zamówienia:', err);
    }
  };
  
  const fetchSellerInfo = async (userId: string) => {
    try {
      // Usunięto pole 'email', którego nie ma w tabeli 'profiles'
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching seller info:', error);
        return;
      }
      
      if (data) {
        setSellerInfo(prev => ({
          ...prev,
          name: data.full_name || "Sprzedawca",
          // Używamy domyślnego maila zamiast próby pobrania z tabeli
          location: product?.location || ""
        }));
      }
    } catch (err) {
      console.error('Unexpected error fetching seller info:', err);
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
            <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie potwierdzenia zamówienia...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Nie znaleziono danych zamówienia</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
              Nie udało się znaleźć informacji o zamówieniu. Spróbuj ponownie później.
            </p>
            <Button asChild>
              <Link to="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do Rynku
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };
  
  const productPrice = isTestMode && product.testing_price 
    ? parseFloat(product.testing_price) 
    : parseFloat(product.price);
  
  // Zakładamy że wybraliśmy pierwszą opcję dostawy
  const deliveryCost = 15.99;
  const totalCost = productPrice + deliveryCost;
  
  // Przygotowanie URL obrazka produktu
  const getProductImageUrl = () => {
    if (!product.image_url) return '/placeholder.svg';
    
    try {
      if (typeof product.image_url === 'string') {
        // Spróbuj sparsować jako JSON
        try {
          const images = JSON.parse(product.image_url);
          if (Array.isArray(images) && images.length > 0) {
            return images[0];
          }
        } catch (e) {
          // To nie jest JSON, więc traktujemy jako zwykły string
          return product.image_url;
        }
      } else if (Array.isArray(product.image_url) && product.image_url.length > 0) {
        return product.image_url[0];
      }
    } catch (e) {
      console.error("Error parsing image URL:", e);
    }
    
    return '/placeholder.svg';
  };
  
  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber).then(
      () => {
        toast({
          title: "Skopiowano",
          description: "Numer zamówienia został skopiowany do schowka.",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Błąd",
          description: "Nie udało się skopiować numeru zamówienia.",
          variant: "destructive",
        });
      }
    );
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="mb-8">
            <Link 
              to="/marketplace" 
              className="inline-flex items-center gap-2 text-rhythm-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do Rynku
            </Link>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isTestMode ? 'Rezerwacja testowa potwierdzona!' : 'Zamówienie złożone!'}
              </h1>
              <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
                {isTestMode 
                  ? 'Twoja rezerwacja testowa została pomyślnie potwierdzona. Szczegóły znajdziesz poniżej.' 
                  : 'Twoje zamówienie zostało pomyślnie złożone. Dziękujemy za zakup!'}
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm font-medium">Numer zamówienia: <span className="font-bold">{orderNumber}</span></span>
                <button 
                  onClick={handleCopyOrderNumber} 
                  className="text-primary hover:text-primary/80"
                  aria-label="Kopiuj numer zamówienia"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-sm text-rhythm-500">
                Szczegóły zostały wysłane na Twój adres email.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Podsumowanie zamówienia</h2>
                  
                  <div className="flex gap-4 border-b pb-4 mb-4">
                    <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={getProductImageUrl()} 
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isTestMode ? 'Test przez 7 dni' : 'Zakup produktu'}
                      </p>
                      <p className="font-medium">
                        {formatCurrency(productPrice)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Cena produktu</span>
                      <span>{formatCurrency(productPrice)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Dostawa</span>
                      <span>{formatCurrency(deliveryCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between py-2 font-bold">
                      <span>Razem</span>
                      <span>{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        {product.location ? (
                          <>
                            <MapPin className="h-4 w-4 text-primary" />
                            Dane sprzedawcy
                          </>
                        ) : (
                          <>
                            <Package className="h-4 w-4 text-primary" />
                            Dostawa
                          </>
                        )}
                      </h3>
                      {product.location ? (
                        <div className="text-sm space-y-1">
                          <p>{sellerInfo.name}</p>
                          <p>Lokalizacja: {product.location}</p>
                          <p>Email: {sellerInfo.email}</p>
                          <p>Telefon: {sellerInfo.phone}</p>
                        </div>
                      ) : (
                        <div className="text-sm space-y-1">
                          <p>Kurier</p>
                          <p>Szacowany czas dostawy: 1-2 dni robocze</p>
                          <p>Przewidywana data dostawy: {formatDate(estimatedDeliveryDate)}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" />
                        {isTestMode ? 'Informacje o teście' : 'Podsumowanie płatności'}
                      </h3>
                      {isTestMode ? (
                        <div className="text-sm space-y-1">
                          <p>Okres testu: 7 dni</p>
                          <p>Rozpoczęcie: {formatDate(new Date())}</p>
                          <p>Zakończenie: {formatDate(testEndDate)}</p>
                        </div>
                      ) : (
                        <div className="text-sm space-y-1">
                          <p>Metoda płatności: Karta płatnicza</p>
                          <p>Status: Opłacone</p>
                          <p>Data płatności: {formatDate(new Date())}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {isTestMode && (
                <Card className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Co dalej z Twoim testem?
                    </h2>
                    
                    <div className="space-y-4 text-blue-800 dark:text-blue-300">
                      <p>
                        Otrzymasz produkt na 7-dniowy okres testowy. W tym czasie możesz go przetestować i zdecydować:
                      </p>
                      
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Jeśli zdecydujesz się zatrzymać produkt, możesz dokonać pełnej płatności w dowolnym momencie.</li>
                        <li>Jeśli chcesz zwrócić produkt, musisz to zrobić przed upływem 7 dni.</li>
                        <li>Na 2 dni przed końcem testu otrzymasz przypomnienie.</li>
                      </ul>
                      
                      <div className="flex gap-4 flex-col sm:flex-row mt-6">
                        <Button className="gap-2" variant="outline" onClick={() => navigate('/orders')}>
                          <ArrowLeft className="h-4 w-4" />
                          Moje zamówienia
                        </Button>
                        <Button className="gap-2" onClick={() => navigate(`/marketplace/${id}`)}>
                          <ShoppingCart className="h-4 w-4" />
                          Kup teraz
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="text-center">
                <Button asChild size="lg">
                  <Link to="/marketplace">
                    Kontynuuj zakupy
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

