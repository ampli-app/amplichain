import { ServiceCard } from '@/components/marketplace/services/ServiceCard';
import { MarketplaceEmptyState } from './MarketplaceEmptyState';
import { Wrench } from 'lucide-react';

interface ServicesTabContentProps {
  services: any[];
  onDelete: (id: string) => void;
  onAddService: () => void;
}

export function ServicesTabContent({
  services,
  onDelete,
  onAddService
}: ServicesTabContentProps) {
  if (services.length === 0) {
    return (
      <MarketplaceEmptyState 
        icon={<Wrench className="h-12 w-12 text-primary/20" />}
        title="Brak usług"
        description="Nie masz jeszcze żadnych usług."
        buttonText="Dodaj pierwszą usługę"
        onButtonClick={onAddService}
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(service => (
        <ServiceCard 
          key={service.id}
          service={service} 
          isFavorite={false}
          isOwner={true}
          onToggleFavorite={() => {}}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
