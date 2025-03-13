
import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/checkout-success/LoadingState';
import { ErrorState } from '@/components/checkout-success/ErrorState';
import { OrderHeader } from '@/components/checkout-success/OrderHeader';
import { OrderDetails } from '@/components/checkout-success/OrderDetails';
import { useOrderCreation } from '@/hooks/useOrderCreation';
import { useProductImage } from '@/hooks/useProductImage';
import { useSellerInfo } from '@/hooks/useSellerInfo';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Product } from '@/components/marketplace/types';

export default function CheckoutSuccess() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTestMode = location.search.includes('mode=test');
  
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  
  const { sellerInfo, fetchSellerInfo } = useSellerInfo();
  const { orderCreated, setOrderCreated, createOrder, testEndDate } = useOrderCreation(user?.id);
  
  const orderNumber = `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);
  
  useEffect(() => {
    if (!id || !user) return;
    
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
          setIsLoading(false);
          return;
        }
        
        if (data) {
          // Zapewnienie, że status produktu jest dostosowany do wymagań typu Product
          const productWithStatus: Product = {
            ...data,
            status: data.status as 'available' | 'reserved' | 'sold'
          };
          
          setProduct(productWithStatus);
          
          if (data.user_id) {
            fetchSellerInfo(data.user_id, data.location);
          }
          
          if (!orderCreated) {
            createOrder(productWithStatus, isTestMode);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductData();
  }, [id, user, orderCreated, isTestMode]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!product) {
    return <ErrorState />;
  }
  
  const { getProductImageUrl } = useProductImage(product);
  
  const productPrice = isTestMode && product.testing_price 
    ? parseFloat(product.testing_price.toString()) 
    : parseFloat(product.price.toString());
  
  const deliveryCost = 15.99;
  const totalCost = productPrice + deliveryCost;
  
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
            <OrderHeader 
              orderNumber={orderNumber}
              isTestMode={isTestMode}
            />
            
            <OrderDetails
              product={product}
              productPrice={productPrice}
              deliveryCost={deliveryCost}
              totalCost={totalCost}
              getProductImageUrl={getProductImageUrl}
              formatCurrency={formatCurrency}
              sellerInfo={sellerInfo}
              formatDate={formatDate}
              estimatedDeliveryDate={estimatedDeliveryDate}
              isTestMode={isTestMode}
              testEndDate={testEndDate}
              id={id || ''}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
