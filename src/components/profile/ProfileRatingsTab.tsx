
import { useState, useEffect } from 'react';
import { Loader2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileRatingsTabProps {
  profileId: string;
}

export function ProfileRatingsTab({ profileId }: ProfileRatingsTabProps) {
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [serviceReviews, setServiceReviews] = useState<any[]>([]);
  const [consultationReviews, setConsultationReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    products: true,
    services: true,
    consultations: true,
  });
  
  useEffect(() => {
    if (profileId) {
      // Używamy tymczasowego rozwiązania do czasu prawidłowego zastosowania migracji
      fetchProductReviews();
      fetchServiceReviews();
      fetchConsultationReviews();
    }
  }, [profileId]);
  
  const fetchProductReviews = async () => {
    try {
      // Sprawdzamy, czy tabela istnieje, jeśli nie - po prostu kończymy ładowanie
      const { count, error: checkError } = await supabase
        .from('product_reviews')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        console.log('Tabela product_reviews nie istnieje lub wystąpił błąd:', checkError);
        setLoading(prev => ({ ...prev, products: false }));
        return;
      }
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profile:user_id (id, full_name, username, avatar_url),
          product:product_id (title, image_url)
        `)
        .eq('product_user_id', profileId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Błąd podczas pobierania recenzji produktów:', error);
      } else {
        setProductReviews(data || []);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };
  
  const fetchServiceReviews = async () => {
    try {
      // Sprawdzamy, czy tabela istnieje, jeśli nie - po prostu kończymy ładowanie
      const { count, error: checkError } = await supabase
        .from('service_reviews')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        console.log('Tabela service_reviews nie istnieje lub wystąpił błąd:', checkError);
        setLoading(prev => ({ ...prev, services: false }));
        return;
      }
      
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          profile:user_id (id, full_name, username, avatar_url),
          service:service_id (title, image_url)
        `)
        .eq('service_user_id', profileId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Błąd podczas pobierania recenzji usług:', error);
      } else {
        setServiceReviews(data || []);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };
  
  const fetchConsultationReviews = async () => {
    try {
      // Sprawdzamy, czy tabela istnieje, jeśli nie - po prostu kończymy ładowanie
      const { count, error: checkError } = await supabase
        .from('consultation_reviews')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        console.log('Tabela consultation_reviews nie istnieje lub wystąpił błąd:', checkError);
        setLoading(prev => ({ ...prev, consultations: false }));
        return;
      }
      
      const { data, error } = await supabase
        .from('consultation_reviews')
        .select(`
          *,
          profile:user_id (id, full_name, username, avatar_url),
          consultation:consultation_id (title)
        `)
        .eq('consultation_user_id', profileId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Błąd podczas pobierania recenzji konsultacji:', error);
      } else {
        setConsultationReviews(data || []);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
    } finally {
      setLoading(prev => ({ ...prev, consultations: false }));
    }
  };
  
  const isLoading = loading.products || loading.services || loading.consultations;
  const hasAnyReviews = productReviews.length > 0 || serviceReviews.length > 0 || consultationReviews.length > 0;
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!hasAnyReviews) {
    return (
      <div className="text-center p-12 bg-muted/30 rounded-lg border">
        <h3 className="text-lg font-medium mb-2">Brak ocen</h3>
        <p className="text-muted-foreground">
          Ten użytkownik nie otrzymał jeszcze żadnych ocen.
        </p>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-3">
        <TabsTrigger value="products">Produkty ({productReviews.length})</TabsTrigger>
        <TabsTrigger value="services">Usługi ({serviceReviews.length})</TabsTrigger>
        <TabsTrigger value="consultations">Konsultacje ({consultationReviews.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="products">
        {productReviews.length > 0 ? (
          <div className="space-y-6">
            {productReviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                </div>
                <p className="text-sm mb-4">{review.comment}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Od: {review.profile?.full_name || 'Anonimowy użytkownik'}
                  </span>
                  <span>
                    Produkt: {review.product?.title || 'Usunięty produkt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-muted/20 rounded-lg">
            <p>Brak ocen dla produktów</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="services">
        {serviceReviews.length > 0 ? (
          <div className="space-y-6">
            {serviceReviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                </div>
                <p className="text-sm mb-4">{review.comment}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Od: {review.profile?.full_name || 'Anonimowy użytkownik'}
                  </span>
                  <span>
                    Usługa: {review.service?.title || 'Usunięta usługa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-muted/20 rounded-lg">
            <p>Brak ocen dla usług</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="consultations">
        {consultationReviews.length > 0 ? (
          <div className="space-y-6">
            {consultationReviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                </div>
                <p className="text-sm mb-4">{review.comment}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Od: {review.profile?.full_name || 'Anonimowy użytkownik'}
                  </span>
                  <span>
                    Konsultacja: {review.consultation?.title || 'Usunięta konsultacja'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-muted/20 rounded-lg">
            <p>Brak ocen dla konsultacji</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
