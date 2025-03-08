
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Rating {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  product_name: string;
  reviewer_name: string;
  reviewer_avatar: string;
}

interface ProfileRatingsTabProps {
  profileId: string;
}

export function ProfileRatingsTab({ profileId }: ProfileRatingsTabProps) {
  const [productRatings, setProductRatings] = useState<Rating[]>([]);
  const [serviceRatings, setServiceRatings] = useState<Rating[]>([]);
  const [consultationRatings, setConsultationRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchRatings() {
      setLoading(true);
      
      try {
        // Próba pobrania ocen produktów
        try {
          const { data: productData, error: productError } = await supabase
            .from('product_reviews')
            .select(`
              id,
              rating,
              comment,
              created_at,
              product_id,
              products(title),
              profiles(full_name, avatar_url)
            `)
            .eq('product_user_id', profileId);
            
          if (productError) {
            console.error('Błąd pobierania ocen produktów:', productError);
            setProductRatings([]);
          } else {
            const formattedProductRatings: Rating[] = (productData || []).map((review: any) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment || '',
              created_at: review.created_at,
              product_name: review.products?.title || 'Produkt',
              reviewer_name: review.profiles?.full_name || 'Użytkownik',
              reviewer_avatar: review.profiles?.avatar_url || ''
            }));
            
            setProductRatings(formattedProductRatings);
          }
        } catch (err) {
          console.error('Nieoczekiwany błąd pobierania ocen produktów:', err);
          setProductRatings([]);
        }
        
        // Próba pobrania ocen usług
        try {
          const { data: serviceData, error: serviceError } = await supabase
            .from('service_reviews')
            .select(`
              id,
              rating,
              comment,
              created_at,
              service_id,
              services(title),
              profiles(full_name, avatar_url)
            `)
            .eq('service_user_id', profileId);
            
          if (serviceError) {
            console.error('Błąd pobierania ocen usług:', serviceError);
            setServiceRatings([]);
          } else {
            const formattedServiceRatings: Rating[] = (serviceData || []).map((review: any) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment || '',
              created_at: review.created_at,
              product_name: review.services?.title || 'Usługa',
              reviewer_name: review.profiles?.full_name || 'Użytkownik',
              reviewer_avatar: review.profiles?.avatar_url || ''
            }));
            
            setServiceRatings(formattedServiceRatings);
          }
        } catch (err) {
          console.error('Nieoczekiwany błąd pobierania ocen usług:', err);
          setServiceRatings([]);
        }
        
        // Próba pobrania ocen konsultacji
        try {
          const { data: consultationData, error: consultationError } = await supabase
            .from('consultation_reviews')
            .select(`
              id,
              rating,
              comment,
              created_at,
              consultation_id,
              consultations(title),
              profiles(full_name, avatar_url)
            `)
            .eq('consultation_user_id', profileId);
            
          if (consultationError) {
            console.error('Błąd pobierania ocen konsultacji:', consultationError);
            setConsultationRatings([]);
          } else {
            const formattedConsultationRatings: Rating[] = (consultationData || []).map((review: any) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment || '',
              created_at: review.created_at,
              product_name: review.consultations?.title || 'Konsultacja',
              reviewer_name: review.profiles?.full_name || 'Użytkownik',
              reviewer_avatar: review.profiles?.avatar_url || ''
            }));
            
            setConsultationRatings(formattedConsultationRatings);
          }
        } catch (err) {
          console.error('Nieoczekiwany błąd pobierania ocen konsultacji:', err);
          setConsultationRatings([]);
        }
        
      } catch (error) {
        console.error('Globalny błąd:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (profileId) {
      fetchRatings();
    }
  }, [profileId]);
  
  const calculateAverageRating = (ratings: Rating[]) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <StarIcon 
        key={i} 
        className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
      />
    ));
  };
  
  const renderRatingsList = (ratings: Rating[]) => {
    if (ratings.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Brak ocen do wyświetlenia.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="bg-card rounded-lg p-4 border">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={rating.reviewer_avatar} alt={rating.reviewer_name} />
                  <AvatarFallback>{rating.reviewer_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{rating.reviewer_name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(rating.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex">{renderStars(rating.rating)}</div>
            </div>
            
            <p className="mt-3 text-sm text-muted-foreground">
              Produkt: <span className="font-medium text-foreground">{rating.product_name}</span>
            </p>
            
            {rating.comment && (
              <p className="mt-2 text-sm">{rating.comment}</p>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const totalRatings = productRatings.length + serviceRatings.length + consultationRatings.length;
  
  if (totalRatings === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg border border-muted">
        <StarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Brak ocen</h3>
        <p className="text-muted-foreground mt-1">
          Ten użytkownik nie ma jeszcze żadnych ocen.
        </p>
      </div>
    );
  }
  
  // Ogólna średnia ocena
  const overallRating = (
    calculateAverageRating(productRatings) * productRatings.length + 
    calculateAverageRating(serviceRatings) * serviceRatings.length + 
    calculateAverageRating(consultationRatings) * consultationRatings.length
  ) / totalRatings;
  
  return (
    <div>
      {/* Ogólna ocena */}
      <div className="bg-card rounded-lg p-6 border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Ogólna ocena</h3>
            <p className="text-muted-foreground text-sm">Na podstawie {totalRatings} {totalRatings === 1 ? 'oceny' : 'ocen'}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <span className="text-2xl font-bold mr-2">{overallRating.toFixed(1)}</span>
              <div className="flex">{renderStars(overallRating)}</div>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Produkty</p>
            <div className="flex items-center justify-center">
              <span className="font-bold mr-1">{calculateAverageRating(productRatings).toFixed(1)}</span>
              <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{productRatings.length} {productRatings.length === 1 ? 'ocena' : 'ocen'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Usługi</p>
            <div className="flex items-center justify-center">
              <span className="font-bold mr-1">{calculateAverageRating(serviceRatings).toFixed(1)}</span>
              <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{serviceRatings.length} {serviceRatings.length === 1 ? 'ocena' : 'ocen'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Konsultacje</p>
            <div className="flex items-center justify-center">
              <span className="font-bold mr-1">{calculateAverageRating(consultationRatings).toFixed(1)}</span>
              <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{consultationRatings.length} {consultationRatings.length === 1 ? 'ocena' : 'ocen'}</p>
          </div>
        </div>
      </div>
      
      {/* Zakładki z ocenami */}
      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="products">Produkty ({productRatings.length})</TabsTrigger>
          <TabsTrigger value="services">Usługi ({serviceRatings.length})</TabsTrigger>
          <TabsTrigger value="consultations">Konsultacje ({consultationRatings.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          {renderRatingsList(productRatings)}
        </TabsContent>
        
        <TabsContent value="services">
          {renderRatingsList(serviceRatings)}
        </TabsContent>
        
        <TabsContent value="consultations">
          {renderRatingsList(consultationRatings)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
