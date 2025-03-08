
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Star, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileRatingsTabProps {
  profileId: string;
}

export function ProfileRatingsTab({ profileId }: ProfileRatingsTabProps) {
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [serviceReviews, setServiceReviews] = useState<any[]>([]);
  const [consultationReviews, setConsultationReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (profileId) {
      fetchReviews();
    }
  }, [profileId]);
  
  const fetchReviews = async () => {
    setLoading(true);
    await Promise.all([
      fetchProductReviews(),
      fetchServiceReviews(),
      fetchConsultationReviews()
    ]);
    setLoading(false);
  };
  
  const fetchProductReviews = async () => {
    try {
      // Check if table exists before querying
      const { count, error: checkError } = await supabase
        .from('product_reviews')
        .select('id', { count: 'exact', head: true });
      
      if (checkError) {
        console.log('Table product_reviews may not exist:', checkError);
        return;
      }
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          user:user_id (id, username, full_name, avatar_url),
          product:product_id (id, title)
        `)
        .eq('product_user_id', profileId);
        
      if (error) {
        console.error('Error fetching product reviews:', error);
      } else {
        setProductReviews(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching product reviews:', err);
    }
  };
  
  const fetchServiceReviews = async () => {
    try {
      // Check if table exists before querying
      const { count, error: checkError } = await supabase
        .from('service_reviews')
        .select('id', { count: 'exact', head: true });
      
      if (checkError) {
        console.log('Table service_reviews may not exist:', checkError);
        return;
      }
      
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          user:user_id (id, username, full_name, avatar_url),
          service:service_id (id, title)
        `)
        .eq('service_user_id', profileId);
        
      if (error) {
        console.error('Error fetching service reviews:', error);
      } else {
        setServiceReviews(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching service reviews:', err);
    }
  };
  
  const fetchConsultationReviews = async () => {
    try {
      // Check if table exists before querying
      const { count, error: checkError } = await supabase
        .from('consultation_reviews')
        .select('id', { count: 'exact', head: true });
      
      if (checkError) {
        console.log('Table consultation_reviews may not exist:', checkError);
        return;
      }
      
      const { data, error } = await supabase
        .from('consultation_reviews')
        .select(`
          *,
          user:user_id (id, username, full_name, avatar_url),
          consultation:consultation_id (id, title)
        `)
        .eq('consultation_user_id', profileId);
        
      if (error) {
        console.error('Error fetching consultation reviews:', error);
      } else {
        setConsultationReviews(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching consultation reviews:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const totalReviews = productReviews.length + serviceReviews.length + consultationReviews.length;
  
  if (totalReviews === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-medium mb-2">Brak ocen</h3>
        <p className="text-muted-foreground">
          Ten użytkownik nie otrzymał jeszcze żadnych ocen.
        </p>
      </Card>
    );
  }
  
  return (
    <Tabs defaultValue="products">
      <TabsList className="mb-6">
        <TabsTrigger value="products">Produkty ({productReviews.length})</TabsTrigger>
        <TabsTrigger value="services">Usługi ({serviceReviews.length})</TabsTrigger>
        <TabsTrigger value="consultations">Konsultacje ({consultationReviews.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="products">
        <div className="space-y-4">
          {productReviews.length > 0 ? (
            productReviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                type="product" 
              />
            ))
          ) : (
            <Card className="p-4 text-center text-muted-foreground">
              Brak ocen dla produktów
            </Card>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="services">
        <div className="space-y-4">
          {serviceReviews.length > 0 ? (
            serviceReviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                type="service" 
              />
            ))
          ) : (
            <Card className="p-4 text-center text-muted-foreground">
              Brak ocen dla usług
            </Card>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="consultations">
        <div className="space-y-4">
          {consultationReviews.length > 0 ? (
            consultationReviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                type="consultation" 
              />
            ))
          ) : (
            <Card className="p-4 text-center text-muted-foreground">
              Brak ocen dla konsultacji
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

interface ReviewCardProps {
  review: any;
  type: 'product' | 'service' | 'consultation';
}

function ReviewCard({ review, type }: ReviewCardProps) {
  const item = type === 'product' 
    ? review.product 
    : type === 'service' 
      ? review.service 
      : review.consultation;

  return (
    <Card className="p-4">
      <div className="flex items-start">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={review.user?.avatar_url} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{review.user?.full_name || review.user?.username}</p>
              <div className="flex items-center gap-1 text-amber-500 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'stroke-current fill-none opacity-40'}`} 
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              {type === 'product' ? 'Produkt' : type === 'service' ? 'Usługa' : 'Konsultacja'}: 
              <span className="font-medium text-foreground ml-1">
                {item?.title || 'Usunięty'}
              </span>
            </p>
            {review.comment && (
              <p className="mt-2 text-sm">{review.comment}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
