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
  Pencil,
  Trash2,
  MapPin,
  Package,
  Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

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
  location: string | null;
}

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
}

const getImageUrls = (imageData: string | string[] | null): string[] => {
  if (!imageData) return ['/placeholder.svg'];
  
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        return parsed.length > 0 ? parsed : ['/placeholder.svg'];
      }
      return [imageData];
    } catch (e) {
      return [imageData];
    }
  } else if (Array.isArray(imageData)) {
    return imageData.length > 0 ? imageData : ['/placeholder.svg'];
  }
  
  return ['/placeholder.svg'];
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [purchaseType, setPurchaseType] = useState<'buy' | 'test'>('buy');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetailProps | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [isUserProduct, setIsUserProduct] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({
    name: "Sprzedawca",
    image: "/placeholder.svg",
    rating: 4.5
  });
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      setIsLoading(true);
      
      try {
        console.log("Fetching product with ID:", id);
        
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
          console.log("Received product data:", data);
          setProduct(data);
          
          if (user && data.user_id === user.id) {
            setIsUserProduct(true);
          }
          
          if (data.user_id) {
            fetchSellerInfo(data.user_id);
          }
          
          // Pobierz opcje dostawy dla produktu
          fetchDeliveryOptions(data.id);
        } else {
          console.error('No product data found');
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
    
    fetchProduct();
  }, [id, user]);

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
        
        if (optionsData) {
          console.log("Received delivery options:", optionsData);
          setDeliveryOptions(optionsData);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching delivery options:', err);
    }
  };

  const fetchSellerInfo = async (userId: string) => {
    try {
      console.log("Fetching seller info for user ID:", userId);
      
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
        console.log("Received seller data:", data);
        setSellerInfo({
          name: data.full_name || "Sprzedawca",
          image: data.avatar_url || "/placeholder.svg",
          rating: 4.5
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching seller info:', err);
    }
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }
    
    if (product) {
      try {
        // Dodajemy console.log dla debugowania
        console.log("Navigating to checkout:", purchaseType, id);
        
        if (purchaseType === 'test' && product.testing_price) {
          // Tworzymy zamówienie dla produktu testowego
          createOrder(product.testing_price);
        } else {
          // Tworzymy zamówienie dla normalnego zakupu
          createOrder(product.price);
        }
      } catch (err) {
        console.error("Navigation error:", err);
        toast({
          title: "Błąd",
          description: "Wystąpił problem podczas przechodzenia do finalizacji zakupu.",
          variant: "destructive",
        });
      }
    } else {
      console.error("Can't navigate to checkout - product is null");
      toast({
        title: "Błąd",
        description: "Brak danych produktu - nie można kontynuować.",
        variant: "destructive",
      });
    }
  };

  const createOrder = async (price: number) => {
    if (!user || !product) return;
    
    setIsProcessing(true);
    
    try {
      // Pobieramy informacje o opcji dostawy, jeśli została wybrana
      let deliveryOptionId = null;
      let deliveryPrice = 0;
      
      if (selectedDeliveryOption) {
        deliveryOptionId = selectedDeliveryOption.id;
        deliveryPrice = selectedDeliveryOption.price;
      }
      
      // Obliczamy łączną wartość zamówienia
      const totalAmount = price + deliveryPrice;
      
      // Tworzymy zamówienie
      const { data, error } = await supabase
        .from('product_orders')
        .insert({
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.user_id,
          total_amount: totalAmount,
          delivery_option_id: deliveryOptionId,
          status: 'oczekujące',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Sukces",
        description: "Zamówienie zostało złożone pomyślnie.",
      });
      
      // Przekierowujemy do strony ze szczegółami zamówienia
      navigate(`/order-details/${data.id}`);
    } catch (error) {
      console.error('Błąd podczas tworzenia zamówienia:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się złożyć zamówienia. Spróbuj ponownie później.",
       

