
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceCard } from './ServiceCard';
import { Service } from '@/types/messages';

interface ServicesListProps {
  services: Service[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  favorites: Record<string, boolean>;
  onPageChange: (page: number) => void;
  onToggleFavorite: (serviceId: string, isFavorite: boolean) => void;
  onAddServiceClick: () => void;
}

export function ServicesList({
  services,
  loading,
  currentPage,
  totalPages,
  favorites,
  onPageChange,
  onToggleFavorite,
  onAddServiceClick
}: ServicesListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  } 
  
  if (services.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <div className="mb-4">
          <Search className="h-12 w-12 mx-auto text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">Nie znaleziono usług</h3>
        <p className="text-muted-foreground mb-4">
          Spróbuj zmienić kryteria wyszukiwania lub dodaj swoją pierwszą usługę
        </p>
        <Button onClick={onAddServiceClick}>
          Dodaj usługę
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(service => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            isFavorite={favorites[service.id] || false}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Poprzednia
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Następna <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
}
