
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Star, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  TruckIcon, 
  ArrowLeft,
  Heart,
  Share,
  Bookmark,
  PlayCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProductDetailProps {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  category: string | null;
  rating: number | null;
  review_count: number | null;
  user_id: string;
  for_testing: boolean | null;
  testing_price: number | null;
  sale: boolean | null;
  sale_percentage: number | null;
  created_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [purchaseType, setPurchaseType] = useState<'buy' | 'test'>('buy');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetailProps | null>(null);
  const [isUserProduct, setIsUserProduct] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({
    name: "Sprzedawca",
    image: "/placeholder.svg",
    rating: 4.5
  });

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
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
            description: "Nie udało się pobrać informacji o produkcie.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setProduct(data);
          
          // Check if this is the user's product
          if (user && data.user_id === user.id) {
            setIsUserProduct(true);
          }
          
          // Set initial purchase type based on testing availability
          if (data.for_testing) {
            setPurchaseType('test');
          }
          
          // Fetch seller info if available
          if (data.user_id) {
            fetchSellerInfo(data.user_id);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, user]);

  const fetchSellerInfo = async (userId: string) => {
    try {
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
        setSellerInfo({
          name: data.full_name || "Sprzedawca",
          image: data.avatar_url || "/placeholder.svg",
          rating: 4.5 // Example rating, could be added to profiles later
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching seller info:', err);
    }
  };

  const handleAddToCart = () => {
    toast({
      title: purchaseType === 'buy' ? "Dodano do koszyka" : "Dodano wynajem testowy",
      description: `${product?.title} został ${purchaseType === 'buy' ? 'dodany do koszyka' : 'zaplanowany do tygodniowego testu'}.`,
    });
  };

  const handleDelete = async () => {
    if (!product || !isUserProduct) return;
    
    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten produkt?");
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      
      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć produktu.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sukces",
        description: "Produkt został usunięty.",
      });
      
      navigate('/marketplace');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie informacji o produkcie...</p>
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
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">Produkt, którego szukasz, nie istnieje lub został usunięty.</p>
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

  // Prepare the display data
  const generateProductImages = (imageUrl: string) => {
    // If we have one image, duplicate it for the gallery
    return [imageUrl, imageUrl, imageUrl];
  };

  const productImages = generateProductImages(product.image_url || '/placeholder.svg');
  
  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(purchaseType === 'buy' ? product.price : (product.testing_price || 0));
  
  const originalPrice = product.sale && product.sale_percentage 
    ? product.price / (1 - product.sale_percentage / 100)
    : undefined;
    
  const formattedOriginalPrice = originalPrice 
    ? new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
      }).format(originalPrice)
    : undefined;

  // Generate specification items from the product data
  const specifications: Record<string, string> = {
    "Kategoria": product.category || "Nie określono",
    "Stan": "Nowy", // Example value, could be added to products later
    "Ocena": product.rating ? `${product.rating}/5` : "Brak ocen",
    "Liczba ocen": product.review_count ? product.review_count.toString() : "0",
    "Dostępny do testów": product.for_testing ? "Tak" : "Nie",
    "Cena testowa (tydzień)": product.testing_price ? 
      new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(product.testing_price) : 
      "Niedostępne"
  };

  // Example features, could be added to products table later
  const features = [
    "Produkt wysokiej jakości",
    "Szybka wysyłka",
    "Gwarancja satysfakcji",
    "Wsparcie przed i po zakupie",
    "Bezpieczne płatności"
  ];

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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Product Images */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="bg-rhythm-100/50 dark:bg-rhythm-800/20 rounded-lg border overflow-hidden aspect-[4/3]">
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal p-4"
                />
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded border overflow-hidden ${selectedImage === index ? 'ring-2 ring-primary' : ''}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} widok ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 justify-center mt-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Heart className="h-4 w-4" />
                  Ulubione
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share className="h-4 w-4" />
                  Udostępnij
                </Button>
                {product.for_testing && (
                  <Button variant="outline" size="sm" className="gap-1">
                    <PlayCircle className="h-4 w-4" />
                    Zobacz Demo
                  </Button>
                )}
              </div>
            </motion.div>
            
            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{product.category || "Inne"}</Badge>
                  {product.for_testing && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Calendar className="mr-1 h-3 w-3" />
                      Dostępne do testów
                    </Badge>
                  )}
                  {product.sale && product.sale_percentage && (
                    <Badge className="bg-red-500">
                      {product.sale_percentage}% ZNIŻKI
                    </Badge>
                  )}
                  {isUserProduct && (
                    <Badge className="bg-green-500">
                      Twój produkt
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium">{product.rating || "0"}</span>
                    <span className="text-rhythm-500">({product.review_count || 0} opinii)</span>
                  </div>
                </div>
                
                <p className="text-rhythm-700 dark:text-rhythm-300 mb-6">
                  {product.description || "Brak opisu produktu."}
                </p>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={sellerInfo.image} 
                      alt={sellerInfo.name}
                      className="h-8 w-8 rounded-full border"
                    />
                    <div>
                      <p className="text-sm font-medium">Sprzedawca: {sellerInfo.name}</p>
                      <div className="flex items-center gap-1 text-xs text-rhythm-500">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span>{sellerInfo.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {product.for_testing && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">Opcje zakupu</h3>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                          onClick={() => setPurchaseType('buy')}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            purchaseType === 'buy' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                          }`}
                        >
                          <DollarSign className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">Kup teraz</span>
                          <p className="text-xs mt-1">
                            {new Intl.NumberFormat('pl-PL', {
                              style: 'currency',
                              currency: 'PLN'
                            }).format(product.price)}
                          </p>
                        </button>
                        
                        <button
                          onClick={() => setPurchaseType('test')}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            purchaseType === 'test' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                          }`}
                        >
                          <Calendar className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">Testuj przez tydzień</span>
                          <p className="text-xs mt-1">
                            {new Intl.NumberFormat('pl-PL', {
                              style: 'currency',
                              currency: 'PLN'
                            }).format(product.testing_price || 0)}
                          </p>
                        </button>
                      </div>
                      
                      <p className="text-xs text-rhythm-500">
                        {purchaseType === 'test' ? 
                          "Wypróbuj przed zakupem! Testuj przez tydzień, a potem zdecyduj czy chcesz kupić." : 
                          "Kup nowy produkt z pełną gwarancją i naszą 30-dniową gwarancją satysfakcji."
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">{formattedPrice}</h3>
                      {formattedOriginalPrice && (
                        <p className="text-rhythm-500 line-through">{formattedOriginalPrice}</p>
                      )}
                      {purchaseType === 'test' && (
                        <p className="text-sm text-rhythm-600">za okres 1 tygodnia</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span>{purchaseType === 'buy' ? 'Bezpieczny zakup' : 'Ubezpieczony test'}</span>
                    </div>
                  </div>
                  
                  {isUserProduct ? (
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 gap-2"
                        variant="outline"
                        onClick={() => navigate(`/profile/edit-product/${product.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edytuj produkt
                      </Button>
                      <Button 
                        className="flex-1 gap-2"
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                        Usuń produkt
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full gap-2 py-6 text-base"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {purchaseType === 'buy' ? 'Dodaj do koszyka' : 'Dodaj wynajem testowy do koszyka'}
                    </Button>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-rhythm-600">
                    <TruckIcon className="h-4 w-4" />
                    <span>Darmowa dostawa • W magazynie • Wysyłka w ciągu 1-2 dni roboczych</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <Tabs defaultValue="features" className="mb-16">
            <TabsList className="grid grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="features">Funkcje</TabsTrigger>
              <TabsTrigger value="specifications">Specyfikacja</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="mt-6">
              <div className="max-w-3xl mx-auto glass-card rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">Cechy produktu</h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <div className="max-w-3xl mx-auto glass-card rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">Specyfikacja techniczna</h3>
                <div className="space-y-2">
                  {Object.entries(specifications).map(([key, value], index) => (
                    <div key={index} className="flex py-1 border-b border-muted last:border-0">
                      <div className="w-1/3 font-medium text-rhythm-700">{key}</div>
                      <div className="w-2/3 text-rhythm-600">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
