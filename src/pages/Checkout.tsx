
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  CreditCard,
  Package, 
  MapPin,
  Loader2,
  ShieldCheck, 
  LockIcon,
  ArrowRight,
  Check,
  Smartphone,
  Building,
  Clock,
  Calendar,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
}

// Progress bar krok po kroku
const steps = [
  { id: 'personal', label: 'Dane osobowe' },
  { id: 'delivery', label: 'Dostawa' },
  { id: 'payment', label: 'Płatność' },
  { id: 'summary', label: 'Podsumowanie' }
];

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isTestMode = location.pathname.includes('/test');
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  // Stan ładowania
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stan produktu i płatności
  const [product, setProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('blik');
  const [activeStep, setActiveStep] = useState('personal');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  
  // Stan danych formularza
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    inpostPoint: '',
    comments: '',
    blikCode: '',
  });
  
  // Obsługa zmian w formularzu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Pobieranie danych przy inicjalizacji
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
  
  // Pobieranie danych produktu
  const fetchProductData = async () => {
    setIsLoading(true);
    
    try {
      console.log("Pobieranie produktu o ID:", id);
      
      // Pobierz dane produktu
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Błąd pobierania produktu:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych produktu.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (data) {
        console.log("Otrzymano dane produktu:", data);
        setProduct(data);
        
        // Pobierz opcje dostawy dla produktu
        await fetchDeliveryOptions(data.id);
      } else {
        console.error("Nie zwrócono danych produktu");
        toast({
          title: "Błąd",
          description: "Nie znaleziono produktu o podanym ID.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas pobierania danych produktu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Pobieranie opcji dostawy
  const fetchDeliveryOptions = async (productId: string) => {
    try {
      console.log("Pobieranie opcji dostawy dla produktu ID:", productId);
      
      // Pobierz opcje dostawy dla produktu
      const { data: productDeliveryData, error: productDeliveryError } = await supabase
        .from('product_delivery_options')
        .select('delivery_option_id')
        .eq('product_id', productId);
      
      if (productDeliveryError) {
        console.error('Błąd pobierania opcji dostawy produktu:', productDeliveryError);
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
          console.error('Błąd pobierania szczegółów opcji dostawy:', optionsError);
          return;
        }
        
        if (optionsData && optionsData.length > 0) {
          console.log("Otrzymano opcje dostawy:", optionsData);
          setDeliveryOptions(optionsData);
          
          // Ustaw pierwszą opcję dostawy jako domyślną (z wyjątkiem odbioru osobistego)
          const defaultOption = optionsData.find(opt => opt.name !== 'Odbiór osobisty') || optionsData[0];
          setDeliveryMethod(defaultOption.id);
          setSelectedDeliveryOption(defaultOption);
        }
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd pobierania opcji dostawy:', err);
    }
  };
  
  // Obsługa zmiany metody dostawy
  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value);
    const selected = deliveryOptions.find(option => option.id === value);
    if (selected) {
      setSelectedDeliveryOption(selected);
    }
  };
  
  // Przejście do następnego kroku
  const goToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      // Walidacja przed przejściem do następnego kroku
      if (activeStep === 'personal') {
        if (!validatePersonalData()) return;
      } else if (activeStep === 'delivery') {
        if (!validateDeliveryData()) return;
      } else if (activeStep === 'payment') {
        if (!validatePaymentData()) return;
      }
      
      setActiveStep(steps[currentIndex + 1].id);
    }
  };
  
  // Powrót do poprzedniego kroku
  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };
  
  // Walidacja danych osobowych
  const validatePersonalData = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Błąd walidacji",
          description: `Pole ${fieldLabels[field]} jest wymagane.`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    // Walidacja formatu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Błąd walidacji",
        description: "Wprowadź poprawny adres email.",
        variant: "destructive",
      });
      return false;
    }
    
    // Walidacja numeru telefonu
    const phoneRegex = /^\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      toast({
        title: "Błąd walidacji",
        description: "Wprowadź poprawny 9-cyfrowy numer telefonu.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Walidacja danych dostawy
  const validateDeliveryData = () => {
    if (!deliveryMethod) {
      toast({
        title: "Błąd walidacji",
        description: "Wybierz metodę dostawy.",
        variant: "destructive",
      });
      return false;
    }
    
    // Walidacja adresu dla dostawy kurierem
    const isCourierDelivery = selectedDeliveryOption?.name === 'Kurier';
    if (isCourierDelivery) {
      const requiredFields = ['address', 'city', 'postalCode'];
      
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          toast({
            title: "Błąd walidacji",
            description: `Pole ${fieldLabels[field]} jest wymagane.`,
            variant: "destructive",
          });
          return false;
        }
      }
      
      // Walidacja kodu pocztowego
      const postalCodeRegex = /^\d{2}-\d{3}$/;
      if (!postalCodeRegex.test(formData.postalCode)) {
        toast({
          title: "Błąd walidacji",
          description: "Wprowadź poprawny kod pocztowy w formacie XX-XXX.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    // Walidacja paczkomatu dla dostawy InPost
    const isInpostDelivery = selectedDeliveryOption?.name === 'Paczkomat InPost';
    if (isInpostDelivery && !formData.inpostPoint) {
      toast({
        title: "Błąd walidacji",
        description: "Wybierz paczkomat InPost.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Walidacja danych płatności
  const validatePaymentData = () => {
    if (!paymentMethod) {
      toast({
        title: "Błąd walidacji",
        description: "Wybierz metodę płatności.",
        variant: "destructive",
      });
      return false;
    }
    
    // Walidacja kodu BLIK
    if (paymentMethod === 'blik' && (!formData.blikCode || formData.blikCode.length !== 6)) {
      toast({
        title: "Błąd walidacji",
        description: "Wprowadź poprawny 6-cyfrowy kod BLIK.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Walidacja wszystkich danych przed złożeniem zamówienia
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
    
    return validatePersonalData() && validateDeliveryData() && validatePaymentData();
  };
  
  // Obsługa złożenia zamówienia
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja przed złożeniem zamówienia
    if (!validateForm()) {
      return;
    }
    
    // Symulacja przetwarzania płatności
    simulatePaymentProcessing();
  };
  
  // Symulacja przetwarzania płatności
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
  
  // Obsługa kodu rabatowego
  const handleApplyDiscount = () => {
    if (!discountCode) {
      toast({
        title: "Błąd",
        description: "Wprowadź kod rabatowy.",
        variant: "destructive",
      });
      return;
    }
    
    // Symulacja weryfikacji kodu rabatowego
    if (discountCode === "RABAT10") {
      setDiscountApplied(true);
      setDiscountValue(price * 0.1); // 10% zniżki
      toast({
        title: "Sukces",
        description: "Kod rabatowy został zastosowany! Otrzymujesz 10% zniżki.",
      });
    } else if (discountCode === "RABAT20") {
      setDiscountApplied(true);
      setDiscountValue(price * 0.2); // 20% zniżki
      toast({
        title: "Sukces",
        description: "Kod rabatowy został zastosowany! Otrzymujesz 20% zniżki.",
      });
    } else {
      toast({
        title: "Błąd",
        description: "Nieprawidłowy kod rabatowy.",
        variant: "destructive",
      });
    }
  };
  
  // Stan ładowania
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
  
  // Brak produktu
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
  
  // Brak opcji dostawy
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
  
  // Mapowanie nazw pól na etykiety
  const fieldLabels: Record<string, string> = {
    firstName: 'Imię',
    lastName: 'Nazwisko',
    email: 'Email',
    phone: 'Telefon',
    address: 'Adres',
    city: 'Miasto',
    postalCode: 'Kod pocztowy',
    inpostPoint: 'Paczkomat',
    blikCode: 'Kod BLIK',
    comments: 'Uwagi do zamówienia'
  };
  
  // Obliczenia cenowe
  const price = isTestMode && product.testing_price 
    ? parseFloat(product.testing_price) 
    : parseFloat(product.price);
  
  const deliveryCost = selectedDeliveryOption ? selectedDeliveryOption.price : 0;
  const discountAmount = discountApplied ? discountValue : 0;
  const totalCost = price + deliveryCost - discountAmount;
  
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
      console.error("Błąd parsowania URL obrazka:", e);
    }
    
    return '/placeholder.svg';
  };
  
  // Sprawdź czy wybrany jest odbiór osobisty
  const isPickupDelivery = selectedDeliveryOption?.name === 'Odbiór osobisty';
  const isInpostDelivery = selectedDeliveryOption?.name === 'Paczkomat InPost';
  const isCourierDelivery = selectedDeliveryOption?.name === 'Kurier';
  
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
          
          <h1 className="text-3xl font-bold mb-4 text-center">
            {isTestMode ? 'Rezerwacja testowa' : 'Finalizacja zakupu'}
          </h1>
          
          {/* Progress Bar */}
          <div className="mb-10 px-4">
            <div className="relative">
              {/* Linia postępu */}
              <div className="absolute inset-0 flex items-center">
                <div className="h-1 w-full mx-auto bg-muted"></div>
              </div>
              
              {/* Kroki */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const isActive = activeStep === step.id;
                  const isCompleted = steps.findIndex(s => s.id === activeStep) > index;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                          isActive || isCompleted 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className={`mt-2 text-xs sm:text-sm ${
                        isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lewa kolumna - formularz krok po kroku */}
              <div className="lg:col-span-2">
                {/* Krok 1: Dane osobowe */}
                <div className={activeStep === 'personal' ? 'block' : 'hidden'}>
                  <Card className="mb-8">
                    <CardHeader className="border-b bg-muted/40">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                        Dane kontaktowe
                      </h2>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Imię</Label>
                          <Input 
                            id="firstName"
                            name="firstName"
                            placeholder="Jan"
                            value={formData.firstName}
                            onChange={handleInputChange}
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
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            placeholder="jan.kowalski@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon</Label>
                          <Input 
                            id="phone"
                            name="phone"
                            placeholder="123456789"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comments">Uwagi do zamówienia (opcjonalnie)</Label>
                        <Textarea 
                          id="comments"
                          name="comments"
                          placeholder="Dodatkowe informacje do zamówienia..."
                          value={formData.comments}
                          onChange={handleInputChange}
                        />
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
                      <Button type="button" onClick={goToNextStep}>
                        Dalej
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {/* Krok 2: Dostawa */}
                <div className={activeStep === 'delivery' ? 'block' : 'hidden'}>
                  <Card className="mb-8">
                    <CardHeader className="border-b bg-muted/40">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                        Sposób dostawy
                      </h2>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange} className="space-y-3">
                        {deliveryOptions.map(option => (
                          <div 
                            key={option.id} 
                            className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors ${
                              deliveryMethod === option.id ? 'border-primary bg-primary/5' : ''
                            }`}
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
                                  ) : option.name === 'Paczkomat InPost' ? (
                                    <Building className="h-5 w-5 text-primary" />
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
                      
                      {/* Dodatkowe opcje dla wybranej metody dostawy */}
                      {isInpostDelivery && (
                        <div className="mt-6 p-4 border border-dashed rounded-lg">
                          <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            Wybierz paczkomat
                          </h3>
                          
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Wybierz paczkomat InPost, do którego zostanie wysłana Twoja przesyłka.
                            </p>
                            
                            <Select
                              value={formData.inpostPoint}
                              onValueChange={(value) => 
                                setFormData(prev => ({ ...prev, inpostPoint: value }))
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Wybierz paczkomat" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WAW123">Warszawa - Centrum (WAW123)</SelectItem>
                                <SelectItem value="WAW456">Warszawa - Mokotów (WAW456)</SelectItem>
                                <SelectItem value="KRK123">Kraków - Stare Miasto (KRK123)</SelectItem>
                                <SelectItem value="WRO123">Wrocław - Centrum (WRO123)</SelectItem>
                                <SelectItem value="POZ123">Poznań - Centrum (POZ123)</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <div className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                              <Info className="h-3.5 w-3.5" />
                              <span>
                                Pełna integracja z mapą paczkomatów InPost zostanie dodana wkrótce.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Adres dostawy dla kuriera */}
                      {isCourierDelivery && (
                        <div className="mt-6 space-y-4 p-4 border border-dashed rounded-lg">
                          <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            Adres dostawy
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="address">Ulica i numer</Label>
                              <Input 
                                id="address"
                                name="address"
                                placeholder="ul. Przykładowa 123/45"
                                value={formData.address}
                                onChange={handleInputChange}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="postalCode">Kod pocztowy</Label>
                                <Input 
                                  id="postalCode"
                                  name="postalCode"
                                  placeholder="00-000"
                                  value={formData.postalCode}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="city">Miasto</Label>
                                <Input 
                                  id="city"
                                  name="city"
                                  placeholder="Warszawa"
                                  value={formData.city}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between">
                      <Button type="button" variant="outline" onClick={goToPreviousStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Wstecz
                      </Button>
                      <Button type="button" onClick={goToNextStep}>
                        Dalej
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {/* Krok 3: Płatność */}
                <div className={activeStep === 'payment' ? 'block' : 'hidden'}>
                  <Card className="mb-8">
                    <CardHeader className="border-b bg-muted/40">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                        Metoda płatności
                      </h2>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                        <div 
                          className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors ${
                            paymentMethod === 'blik' ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <RadioGroupItem value="blik" id="blik" />
                          <Label htmlFor="blik" className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-primary" />
                                <span>BLIK</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Szybka płatność kodem BLIK z aplikacji bankowej
                            </p>
                          </Label>
                        </div>
                        
                        <div 
                          className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors ${
                            paymentMethod === 'p24' ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <RadioGroupItem value="p24" id="p24" />
                          <Label htmlFor="p24" className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <span>Przelewy24</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Szybki przelew online przez Przelewy24
                            </p>
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {/* Dodatkowe pola dla wybranej metody płatności */}
                      {paymentMethod === 'blik' && (
                        <div className="mt-6 p-4 border border-dashed rounded-lg">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="blikCode" className="font-medium">Kod BLIK</Label>
                              <span className="text-sm text-muted-foreground">
                                Wygeneruj kod w aplikacji bankowej
                              </span>
                            </div>
                            
                            <Input 
                              id="blikCode"
                              name="blikCode"
                              placeholder="Wpisz 6-cyfrowy kod"
                              maxLength={6}
                              className="text-center text-xl tracking-widest h-14"
                              value={formData.blikCode}
                              onChange={(e) => {
                                // Tylko cyfry
                                const sanitized = e.target.value.replace(/\D/g, '');
                                setFormData(prev => ({ ...prev, blikCode: sanitized }));
                              }}
                            />
                            
                            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 mt-2">
                              <Clock className="h-4 w-4" />
                              <span>Kod BLIK jest ważny przez 2 minuty</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {paymentMethod === 'p24' && (
                        <div className="mt-6 p-4 border border-dashed rounded-lg">
                          <div className="text-sm">
                            <p className="font-medium mb-2">Jak to działa?</p>
                            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                              <li>Po kliknięciu "Zapłać" zostaniesz przekierowany do serwisu Przelewy24</li>
                              <li>Wybierz swój bank</li>
                              <li>Zaloguj się i potwierdź płatność w banku</li>
                              <li>Po zakończeniu transakcji wrócisz na stronę potwierdzenia zamówienia</li>
                            </ol>
                            
                            <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                              <LockIcon className="h-4 w-4" />
                              <span>Bezpieczna płatność szyfrowana SSL</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between">
                      <Button type="button" variant="outline" onClick={goToPreviousStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Wstecz
                      </Button>
                      <Button type="button" onClick={goToNextStep}>
                        Dalej
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {/* Krok 4: Podsumowanie i finalizacja */}
                <div className={activeStep === 'summary' ? 'block' : 'hidden'}>
                  <Card className="mb-8">
                    <CardHeader className="border-b bg-muted/40">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
                        Podsumowanie zamówienia
                      </h2>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      {/* Dane osobowe */}
                      <div className="space-y-2">
                        <h3 className="text-base font-medium">Dane kontaktowe</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Imię i nazwisko:</span>
                          </div>
                          <div>{formData.firstName} {formData.lastName}</div>
                          
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                          </div>
                          <div>{formData.email}</div>
                          
                          <div>
                            <span className="text-muted-foreground">Telefon:</span>
                          </div>
                          <div>{formData.phone}</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Dostawa */}
                      <div className="space-y-2">
                        <h3 className="text-base font-medium">Dostawa</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Metoda dostawy:</span>
                          </div>
                          <div>{selectedDeliveryOption?.name}</div>
                          
                          {isPickupDelivery && product.location && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Miejsce odbioru:</span>
                              </div>
                              <div>{product.location}</div>
                            </>
                          )}
                          
                          {isInpostDelivery && formData.inpostPoint && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Paczkomat:</span>
                              </div>
                              <div>{formData.inpostPoint}</div>
                            </>
                          )}
                          
                          {isCourierDelivery && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Adres dostawy:</span>
                              </div>
                              <div>
                                {formData.address}, {formData.postalCode} {formData.city}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Płatność */}
                      <div className="space-y-2">
                        <h3 className="text-base font-medium">Płatność</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Metoda płatności:</span>
                          </div>
                          <div>
                            {paymentMethod === 'blik' ? 'BLIK' : 'Przelewy24'}
                          </div>
                          
                          {paymentMethod === 'blik' && formData.blikCode && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Kod BLIK:</span>
                              </div>
                              <div>{formData.blikCode}</div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {formData.comments && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h3 className="text-base font-medium">Uwagi do zamówienia</h3>
                            <p className="text-sm">{formData.comments}</p>
                          </div>
                        </>
                      )}
                      
                      <Separator />
                      
                      {/* Akceptacja regulaminu */}
                      <div className="flex items-start space-x-2">
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
                    </CardContent>
                    
                    <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between">
                      <Button type="button" variant="outline" onClick={goToPreviousStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Wstecz
                      </Button>
                      <Button type="submit" disabled={isProcessing}>
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
                    </CardFooter>
                  </Card>
                </div>
              </div>
              
              {/* Prawa kolumna - podsumowanie zamówienia */}
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
                      
                      {/* Kod rabatowy */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="discountCode">Kod rabatowy</Label>
                          {discountApplied && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              Rabat zastosowany
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            id="discountCode"
                            placeholder="Wpisz kod rabatowy"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            disabled={discountApplied}
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            variant={discountApplied ? "outline" : "default"}
                            onClick={discountApplied ? () => {
                              setDiscountCode('');
                              setDiscountApplied(false);
                              setDiscountValue(0);
                            } : handleApplyDiscount}
                            disabled={!discountCode && !discountApplied}
                          >
                            {discountApplied ? "Usuń" : "Zastosuj"}
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Cena produktu</span>
                          <span>{formatCurrency(price)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Dostawa</span>
                          <span>{formatCurrency(deliveryCost)}</span>
                        </div>
                        
                        {discountApplied && (
                          <div className="flex justify-between py-1 text-green-600 dark:text-green-400">
                            <span>Rabat</span>
                            <span>-{formatCurrency(discountValue)}</span>
                          </div>
                        )}
                        
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
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
