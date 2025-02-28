
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  Clock, 
  Calendar, 
  Truck, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

// Definiujemy typy dla dostępnych metod płatności
type PaymentMethod = 'card' | 'transfer' | 'blik';
// Definiujemy typy dla trybu zakupu
type PurchaseMode = 'buy' | 'test';

export default function Checkout() {
  const { id, mode = 'buy' } = useParams<{ id: string; mode?: PurchaseMode }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Dane produktu
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  
  // Dane formularza
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Stany walidacji
  const [errors, setErrors] = useState({
    shippingAddress: '',
    contactPhone: '',
    terms: ''
  });
  
  // Pobierz dane produktu i sprzedawcy
  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby dokonać zakupu.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (!id) {
      navigate('/marketplace');
      return;
    }
    
    fetchProductData();
  }, [id, isLoggedIn, user]);
  
  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(*)')
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
      
      if (!data) {
        toast({
          title: "Produkt nie znaleziony",
          description: "Nie znaleziono produktu o podanym ID.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      // Sprawdź, czy ten produkt nie należy do aktualnego użytkownika
      if (user?.id === data.user_id) {
        toast({
          title: "To Twój produkt",
          description: "Nie możesz kupić własnego produktu.",
          variant: "destructive",
        });
        navigate(`/marketplace/${id}`);
        return;
      }
      
      // Sprawdź, czy produkt jest dostępny do testów, jeśli wybrano tryb testowy
      if (mode === 'test' && !data.for_testing) {
        toast({
          title: "Produkt niedostępny do testów",
          description: "Ten produkt nie jest dostępny w opcji testowej.",
          variant: "destructive",
        });
        navigate(`/marketplace/${id}`);
        return;
      }
      
      setProduct(data);
      
      // Pobierz dane sprzedawcy
      fetchSellerData(data.user_id);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchSellerData = async (sellerId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sellerId)
        .single();
      
      if (error) {
        console.error('Error fetching seller data:', error);
        return;
      }
      
      setSeller(data);
    } catch (err) {
      console.error('Error fetching seller:', err);
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      shippingAddress: '',
      contactPhone: '',
      terms: ''
    };
    
    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = 'Podaj adres dostawy';
      isValid = false;
    }
    
    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Podaj numer telefonu kontaktowego';
      isValid = false;
    } else if (!/^\d{9}$/.test(contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Podaj poprawny 9-cyfrowy numer telefonu';
      isValid = false;
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'Musisz zaakceptować regulamin';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Tutaj byłaby integracja z systemem płatności
      // Na potrzeby demonstracji, symulujemy opóźnienie
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Po udanej płatności zapisujemy zamówienie w bazie danych
      const orderData = {
        product_id: id,
        buyer_id: user?.id,
        seller_id: product.user_id,
        purchase_type: mode,
        price: mode === 'buy' ? product.price : product.testing_price,
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        contact_phone: contactPhone,
        additional_info: additionalInfo,
        status: 'paid', // Na potrzeby demonstracji, status od razu jest "opłacony"
        created_at: new Date().toISOString()
      };
      
      console.log('Dane zamówienia:', orderData);
      
      // Symulujemy udaną operację
      toast({
        title: "Zamówienie zrealizowane!",
        description: mode === 'buy' 
          ? "Dziękujemy za zakup! Sprzedawca zostanie powiadomiony o Twoim zamówieniu."
          : "Dziękujemy za zamówienie! Produkt będzie dostępny do testowania przez 7 dni.",
      });
      
      // Przekieruj do strony potwierdzenia
      setTimeout(() => {
        navigate(`/checkout/success/${id}?mode=${mode}`);
      }, 500);
      
    } catch (err) {
      console.error('Error processing payment:', err);
      toast({
        title: "Błąd płatności",
        description: "Wystąpił problem z przetwarzaniem płatności. Spróbuj ponownie później.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Produkt nie został znaleziony</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">Nie udało się załadować informacji o zamawianym produkcie.</p>
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
  
  // Format ceny
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(price);
  };
  
  // Określ cenę w zależności od trybu zakupu
  const purchasePrice = mode === 'buy' ? product.price : product.testing_price;
  const deliveryFee = 15; // Przykładowa opłata za dostawę
  const totalPrice = purchasePrice + deliveryFee;
  
  // Określ tytuł i opis w zależności od trybu zakupu
  const pageTitle = mode === 'buy' ? 'Finalizacja zakupu' : 'Rezerwacja testu';
  const actionButtonText = mode === 'buy' ? 'Zapłać i zamów' : 'Zapłać i zarezerwuj test';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="mb-8">
            <Link 
              to={`/marketplace/${id}`} 
              className="inline-flex items-center gap-2 text-rhythm-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do produktu
            </Link>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              {mode === 'buy' 
                ? 'Wprowadź dane do dostawy i wybierz metodę płatności' 
                : 'Rezerwujesz produkt do testów na okres 7 dni'}
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSubmit}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Dane dostawy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="shipping-address">Adres dostawy</Label>
                        <Textarea 
                          id="shipping-address" 
                          placeholder="Podaj pełny adres dostawy (ulica, numer, kod pocztowy, miasto)" 
                          rows={3}
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className={errors.shippingAddress ? "border-red-500" : ""}
                        />
                        {errors.shippingAddress && (
                          <p className="text-sm text-red-500">{errors.shippingAddress}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Telefon kontaktowy</Label>
                        <Input 
                          id="contact-phone" 
                          type="tel" 
                          placeholder="Numer telefonu (np. 555 555 555)" 
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className={errors.contactPhone ? "border-red-500" : ""}
                        />
                        {errors.contactPhone && (
                          <p className="text-sm text-red-500">{errors.contactPhone}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="additional-info">Dodatkowe informacje (opcjonalnie)</Label>
                        <Textarea 
                          id="additional-info" 
                          placeholder="Wpisz dodatkowe informacje dla sprzedawcy lub dotyczące dostawy" 
                          rows={2}
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                        />
                      </div>
                    </CardContent>
                    <CardHeader>
                      <CardTitle>Metoda płatności</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup 
                        value={paymentMethod} 
                        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 border rounded-md p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer">
                          <RadioGroupItem value="card" id="payment-card" />
                          <Label htmlFor="payment-card" className="flex items-center cursor-pointer">
                            <CreditCard className="h-5 w-5 mr-2 text-primary" />
                            Płatność kartą
                          </Label>
                          <p className="ml-auto text-sm text-zinc-500">Visa, Mastercard, inne</p>
                        </div>
                        
                        <div className="flex items-center space-x-3 border rounded-md p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer">
                          <RadioGroupItem value="transfer" id="payment-transfer" />
                          <Label htmlFor="payment-transfer" className="flex items-center cursor-pointer">
                            <Banknote className="h-5 w-5 mr-2 text-blue-500" />
                            Przelew bankowy
                          </Label>
                          <p className="ml-auto text-sm text-zinc-500">Wszystkie banki</p>
                        </div>
                        
                        <div className="flex items-center space-x-3 border rounded-md p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer">
                          <RadioGroupItem value="blik" id="payment-blik" />
                          <Label htmlFor="payment-blik" className="flex items-center cursor-pointer">
                            <span className="font-bold mr-2 text-zinc-800 dark:text-zinc-200">BLIK</span>
                            Płatność BLIK
                          </Label>
                          <p className="ml-auto text-sm text-zinc-500">Szybka płatność kodem</p>
                        </div>
                      </RadioGroup>
                      
                      <div className="mt-6 flex items-start space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                          className={errors.terms ? "border-red-500" : ""}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor="terms" 
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Akceptuję regulamin serwisu oraz warunki zakupu
                          </Label>
                          {errors.terms && (
                            <p className="text-sm text-red-500">{errors.terms}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full gap-2 py-6 text-lg"
                        disabled={isProcessing}
                      >
                        {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {actionButtonText}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Podsumowanie zamówienia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800">
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
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-zinc-500">{product.category}</p>
                      </div>
                    </div>
                    
                    {mode === 'test' && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <Calendar className="h-5 w-5 flex-shrink-0" />
                          <p className="text-sm font-medium">
                            Rezerwujesz ten produkt na 7-dniowy test
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
                          Po zakończeniu testu produkt należy zwrócić w nienaruszonym stanie.
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {mode === 'buy' ? 'Cena produktu' : 'Cena testu (7 dni)'}
                        </span>
                        <span className="font-medium">{formatPrice(purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Dostawa</span>
                        <span className="font-medium">{formatPrice(deliveryFee)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold">
                        <span>Razem do zapłaty</span>
                        <span className="text-primary">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                    
                    {seller && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Sprzedawca</h4>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                            {seller.avatar_url ? (
                              <img 
                                src={seller.avatar_url} 
                                alt={seller.full_name || "Sprzedawca"} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-500 bg-zinc-200 dark:bg-zinc-700">
                                {(seller.full_name || "S").charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{seller.full_name || "Sprzedawca"}</p>
                            <p className="text-xs text-zinc-500">Dołączył: {new Date(seller.joined_date).toLocaleDateString('pl-PL')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Bezpieczne zakupy</p>
                          <p className="text-xs text-zinc-500">Twoja płatność jest zabezpieczona</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Truck className="h-5 w-5 text-zinc-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Szybka dostawa</p>
                          <p className="text-xs text-zinc-500">Wysyłka w ciągu 24 godzin od płatności</p>
                        </div>
                      </div>
                      {mode === 'test' && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-5 w-5 text-zinc-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Okres testowy: 7 dni</p>
                            <p className="text-xs text-zinc-500">Testuj produkt przez tydzień</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex items-center justify-center">
                  <Info className="h-4 w-4 text-zinc-400 mr-2" />
                  <p className="text-xs text-zinc-500">
                    Potrzebujesz pomocy? <a href="#" className="text-primary underline">Skontaktuj się z nami</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
