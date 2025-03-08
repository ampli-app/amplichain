
import { Heart, Share2, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Service } from '@/types/messages';

export interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  isOwner?: boolean;
  onToggleFavorite: (serviceId: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
}

export function ServiceCard({ service, isFavorite, isOwner = false, onToggleFavorite, onDelete }: ServiceCardProps) {
  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-all group">
      <Button 
        variant="secondary"
        size="icon" 
        className="absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
        onClick={() => onToggleFavorite(service.id, isFavorite)}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-red-500" : "text-zinc-400"}`} />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute bottom-3 right-3 opacity-70 hover:opacity-100 z-10"
        onClick={() => {
          const serviceUrl = `${window.location.origin}/services/${service.id}`;
          navigator.clipboard.writeText(serviceUrl);
          toast({
            title: "Link skopiowany",
            description: "Link do usługi został skopiowany do schowka.",
          });
        }}
      >
        <Share2 className="h-4 w-4" />
      </Button>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage 
              src={service.profiles?.avatar_url || undefined} 
              alt={service.profiles?.full_name || "Użytkownik"} 
            />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{service.profiles?.full_name || "Użytkownik"}</h3>
            <p className="text-sm text-muted-foreground">@{service.profiles?.username || "użytkownik"}</p>
          </div>
        </div>
        
        <h4 className="text-lg font-medium mb-2">{service.title}</h4>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {service.category && (
            <Badge variant="secondary">
              {service.category}
            </Badge>
          )}
          
          {service.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {service.location}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="font-semibold text-lg bg-primary/10 px-2 py-1 rounded text-primary">
            {new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN'
            }).format(service.price)}
          </div>
          
          {isOwner && onDelete ? (
            <Button variant="destructive" onClick={() => onDelete(service.id)}>Usuń</Button>
          ) : (
            <Button>Kontakt</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
