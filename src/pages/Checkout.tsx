
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  Package, 
  MapPin,
  Clock, 
  Info, 
  Calendar, 
  Loader2,
  ShieldCheck, 
  LockIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
}

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isTestMode = location.pathname.includes('/test');
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
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
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [id, isLoggedIn, user?.email]);
  
  const fetchProductData = async () => {
    setIsLoading(true);
    
    try {
      console.log("Fetching product with ID:", id);
      
      // Pobierz dane produktu
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
        console.log("Received product data:", data);
        setProduct(data);
        
        // Pobierz opcje dostawy dla produktu
        await fetchDeliveryOptions(data.id);
      } else {
        console.error("No product data returned");
        toast({
          title: "Błąd",
          description: "Nie znaleziono produktu o podanym ID.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas pobierania danych produktu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDeliveryOptions = async (productId: string) => {
    try {
      console.log("Fetching delivery options for product ID:", productId);
      
      // Pobierz opcje dostawy dla produktu
      const { data: productDeliveryData, error: productDeliveryError } = await supabase
        .from('product_delivery_options')
        .select('delivery_option_id')
        .eq('product_id', productId);
      
      if (productDeliveryError) {
        console.error('Error fetching product delivery options:', productDeliveryError);
        return;
      }
      
      // Pobierz szczegóły opcji dostawy
      if (productDeliveryData && productDeliveryData.length > 0) {
        const deliveryOptionIds = productDeliveryData.map(option => option.delivery_option_id);
        
        const { data: optionsData, error: optionsError } = await supabase
          .from('delivery_options')
          .select('*')
          .in('id', deliveryOptionIds);
        
        if (optionsError) {
          console.error('Error fetching delivery option details:', optionsError);
          return;
        }
        
        if (optionsData && optionsData.length > 0) {
          console.log("Received delivery options:", optionsData);
          setDeliveryOptions(optionsData);
          
          // Ustaw pierwszą opcję dostawy jako domyślną (z wyjątkiem odbioru osobistego)
          const defaultOption = optionsData.find(opt => opt.name !== 'Odbiór osobisty') || optionsData[0];
          setDeliveryMethod(defaultOption.id);
          setSelectedDeliveryOption(defaultOption);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching delivery options:', err);
    }
  };
  
  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value);
    const selected = deliveryOptions.find(option => option.id === value);
    if (selected) {
      setSelectedDeliveryOption(selected);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja podstawowych pól
    if (!validateForm()) {
      return;
    }
    
    // Symulacja przetwarzania płatności
    simulatePaymentProcessing();
  };
  
  const validateForm = () => {
    // Walidacja zgody na regulamin
    if (!agreeToTerms) {
      toast({
        title: "Błąd",
        description: "Musisz zaakceptować regulamin, aby kontynuować.",
        variant: "destructive",
      });
      return false;
    }
    
    // Sprawdź czy wybrana metoda dostawy
    if (!deliveryMethod) {
      toast({
        title: "Błąd",
        description: "Wybierz metodę dostawy.",
        variant: "destructive",
      });
      return false;
    }
    
    // Dla odbioru osobistego nie potrzebujemy adresu
    const isPickupDelivery = selectedDeliveryOption?.name === 'Odbiór osobisty';
    
    // Walidacja podstawowych pól formularza
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const addressFields = isPickupDelivery ? [] : ['address', 'city', 'postalCode'];
    const allRequiredFields = [...requiredFields, ...addressFields];
    
    for (const field of allRequiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Błąd",
          description: `Pole ${field} jest wymagane.`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    // Walidacja płatności kartą
    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        toast({
          title: "Błąd",
          description: "Wypełnij wszystkie dane karty płatniczej.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };
  
  const simulatePaymentProcessing = () => {
    setIsProcessing(true);
    
    // Symulacja opóźnienia przetwarzania płatności
    setTimeout(() => {
      setIsProcessing(false);
      
      // Zakładamy sukces płatności i przekierowujemy do potwierdzenia
      toast({
        title: "Płatność zaakceptowana",
        description: "Twoje zamówienie zostało złożone pomyślnie!",
      });
      
      // Przekierowanie na stronę potwierdzenia
      const url = isTestMode 
        ? `/checkout/success/${id}?mode=test` 
        : `/checkout/success/${id}?mode=buy`;
      
      navigate(url);
    }, 1500);
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
            <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie danych produktu...</p>
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
            <h2 className="text-2xl font-bold mb-4">Błąd pobrania produktu</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
              Nie udało się pobrać informacji o produkcie. Spróbuj ponownie później.
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
  
  if (deliveryOptions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Brak opcji dostawy</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
              Dla tego produktu nie skonfigurowano opcji dostawy. Skontaktuj się ze sprzedawcą.
            </p>
            <Button asChild>
              <Link to={`/marketplace/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do produktu
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Obliczenia cenowe
  const price = isTestMode && product.testing_price 
    ? parseFloat(product.testing_price) 
    : parseFloat(product.price);
  
  const deliveryCost = selectedDeliveryOption ? selectedDeliveryOption.price : 0;
  const totalCost = price + deliveryCost;
  
  // Formatowanie walutowe
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };
  
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
  
  // Sprawdź czy wybrany jest odbiór osobisty
  const isPickupDelivery = selectedDeliveryOption?.name === 'Odbiór osobisty';
  
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
          
          <h1 className="text-3xl font-bold mb-8 text-center">
            {isTestMode ? 'Rezerwacja testowa' : 'Finalizacja zakupu'}
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formularz zamówienia - 2 kolumny na dużych ekranach */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <Card className="mb-8">
                  <CardHeader className="border-b bg-muted/40">
                    <h2 className="text-xl font-semibold">Dane kontaktowe</h2>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Imię</Label>
                        <Input 
                          id="firstName"
                          name="firstName"
                          placeholder="Jan"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nazwisko</Label>
                        <Input 
                          id="lastName"
                          name="lastName"
                          placeholder="Kowalski"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          placeholder="jan.kowalski@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          placeholder="123 456 789"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mb-8">
                  <CardHeader className="border-b bg-muted/40">
                    <h2 className="text-xl font-semibold">Sposób dostawy</h2>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange}>
                      {deliveryOptions.map(option => (
                        <div 
                          key={option.id} 
                          className="flex items-center space-x-2 border rounded-lg p-4 mb-3 cursor-pointer hover:bg-muted/20 transition-colors"
                        >
                          <RadioGroupItem value={option.id} id={`delivery-${option.id}`} />
                          <Label 
                            htmlFor={`delivery-${option.id}`} 
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {option.name === 'Odbiór osobisty' ? (
                                  <MapPin className="h-5 w-5 text-primary" />
                                ) : (
                                  <Package className="h-5 w-5 text-primary" />
                                )}
                                <span>{option.name}</span>
                                {option.name === 'Odbiór osobisty' && product.location && (
                                  <span className="text-sm text-muted-foreground">({product.location})</span>
                                )}
                              </div>
                              <span className="font-medium">
                                {option.price > 0 
                                  ? formatCurrency(option.price) 
                                  : 'Darmowa'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {option.name === 'Kurier' && 'Dostawa w ciągu 1-2 dni roboczych'}
                              {option.name === 'Paczkomat InPost' && 'Dostawa do paczkomatu w ciągu 1-2 dni roboczych'}
                              {option.name === 'Odbiór osobisty' && 'Odbiór osobisty w lokalizacji sprzedawcy'}
                            </p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
                
                {/* Dane adresowe - tylko jeśli nie wybrano odbioru osobistego */}
                {!isPickupDelivery && (
                  <Card className="mb-8">
                    <CardHeader className="border-b bg-muted/40">
                      <h2 className="text-xl font-semibold">Dane do wysyłki</h2>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Adres</Label>
                        <Input 
                          id="address"
                          name="address"
                          placeholder="ul. Przykładowa 123/45"
                          value={formData.address}
                          onChange={handleInputChange}
                          required={!isPickupDelivery}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Miasto</Label>
                          <Input 
                            id="city"
                            name="city"
                            placeholder="Warszawa"
                            value={formData.city}
                            onChange={handleInputChange}
                            required={!isPickupDelivery}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Kod pocztowy</Label>
                          <Input 
                            id="postalCode"
                            name="postalCode"
                            placeholder="00-000"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required={!isPickupDelivery}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="mb-8">
                  <CardHeader className="border-b bg-muted/40">
                    <h2 className="text-xl font-semibold">Metoda płatności</h2>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mb-4">
                      <div className="flex items-center space-x-2 border rounded-lg p-4 mb-3 cursor-pointer hover:bg-muted/20 transition-colors">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <span>Karta płatnicza</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Visa, Mastercard, American Express</p>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-primary" />
                            <span>Przelew bankowy</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Szybki przelew online</p>
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    {paymentMethod === 'card' && (
                      <div className="space-y-4 mt-6 border-t pt-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Numer karty</Label>
                            <Input 
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Data ważności</Label>
                            <Input 
                              id="expiryDate"
                              name="expiryDate"
                              placeholder="MM/RR"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cvv">Kod CVV</Label>
                            <Input 
                              id="cvv"
                              name="cvv"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <LockIcon className="h-4 w-4" />
                          <span>Bezpieczna płatność szyfrowana 256-bit SSL</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="flex items-start space-x-2 mb-8">
                  <Checkbox 
                    id="terms" 
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Akceptuję regulamin i politykę prywatności
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Składając zamówienie, akceptujesz {" "}
                      <a href="#" className="text-primary underline hover:text-primary/90">regulamin</a> {" "}
                      i zgadzasz się na przetwarzanie danych zgodnie z naszą {" "}
                      <a href="#" className="text-primary underline hover:text-primary/90">polityką prywatności</a>.
                    </p>
                  </div>
                </div>
                
                <Button type="submit" className="w-full py-6" size="lg" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Przetwarzanie płatności...
                    </>
                  ) : (
                    <>
                      {isTestMode ? 'Rezerwuj test' : 'Zapłać i zamów'} ({formatCurrency(totalCost)})
                    </>
                  )}
                </Button>
              </form>
            </div>
            
            {/* Podsumowanie zamówienia - 1 kolumna */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="border-b bg-muted/40">
                  <h2 className="text-xl font-semibold">Podsumowanie</h2>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex gap-4 border-b pb-4">
                      <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={getProductImageUrl()} 
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {isTestMode ? 'Test przez 7 dni' : 'Zakup produktu'}
                        </p>
                        <p className="font-medium mt-1">
                          {formatCurrency(price)}
                        </p>
                      </div>
                    </div>
                    
                    {isTestMode && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 flex gap-2">
                        <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-500" />
                        <div className="text-sm">
                          <p className="font-medium">Informacja o teście</p>
                          <p className="mt-1">Produkt zostanie dostarczony na 7 dni. Po tym czasie musisz go odesłać lub opłacić pełną wartość produktu.</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Cena produktu</span>
                        <span>{formatCurrency(price)}</span>
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
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <span>Bezpieczne płatności</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4 text-green-500" />
                        <span>Szybka dostawa</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span>30-dniowe prawo zwrotu</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
