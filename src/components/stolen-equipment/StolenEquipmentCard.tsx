
import { MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { StolenEquipmentItem } from '@/hooks/useStolenEquipment';

interface StolenEquipmentCardProps {
  item: StolenEquipmentItem;
}

export function StolenEquipmentCard({ item }: StolenEquipmentCardProps) {
  const getStatusBadge = () => {
    switch (item.status) {
      case 'verified':
        return <Badge className="absolute top-2 left-2 bg-yellow-500">Zweryfikowany</Badge>;
      case 'unverified':
        return <Badge className="absolute top-2 left-2 bg-gray-500">Oczekuje weryfikacji</Badge>;
      case 'recovered':
        return <Badge className="absolute top-2 left-2 bg-green-500">Odzyskany</Badge>;
      default:
        return null;
    }
  };

  const getStatusButton = () => {
    switch (item.status) {
      case 'verified':
        return (
          <Button variant="outline" className="w-full">
            Mam informację
          </Button>
        );
      case 'unverified':
        return (
          <Button variant="outline" className="w-full text-yellow-600 border-yellow-600">
            Oczekuje weryfikacji
          </Button>
        );
      case 'recovered':
        return (
          <Button variant="outline" className="w-full text-green-600 border-green-600">
            Odzyskany
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300 animate-fade-up relative">
      <div className="relative">
        {getStatusBadge()}
        <Badge className="absolute top-2 right-2 bg-blue-500">
          {item.category_name || 'Inne'}
        </Badge>
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-1">{item.title}</h3>
        
        <div className="flex flex-col space-y-1 mb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
            {item.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1 text-primary" />
            {item.date}
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex space-x-2">
          {getStatusButton()}
          
          <Button variant="outline" className="flex-shrink-0">
            Zobacz historię
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
