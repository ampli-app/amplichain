
import { Heart, Calendar, User, MapPin, Share2, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Consultation } from '@/types/consultations';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export interface ConsultationCardProps {
  consultation: Consultation;
  isFavorite: boolean;
  isOwner?: boolean;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
}

export function ConsultationCard({ 
  consultation, 
  isFavorite, 
  isOwner = false,
  onToggleFavorite, 
  onDelete 
}: ConsultationCardProps) {
  const navigate = useNavigate();
  
  const handleViewClick = () => {
    console.log("Navigating to consultation details:", consultation.id);
    navigate(`/consultations/${consultation.id}`);
  };
  
  const handleEditClick = () => {
    console.log("Navigating to edit consultation:", consultation.id);
    navigate(`/consultations/edit/${consultation.id}`);
  };
  
  const handleShareClick = () => {
    const consultationUrl = `${window.location.origin}/consultations/${consultation.id}`;
    navigator.clipboard.writeText(consultationUrl);
    toast({
      title: "Link skopiowany",
      description: "Link do konsultacji został skopiowany do schowka.",
    });
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      {isOwner && (
        <Badge className="absolute top-3 left-3 z-10 bg-primary text-white">
          Twoja konsultacja
        </Badge>
      )}
      
      <Button 
        variant="secondary"
        size="icon" 
        className="absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
        onClick={() => onToggleFavorite(consultation.id, isFavorite)}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-red-500" : "text-zinc-400"}`} />
      </Button>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage 
              src={consultation.profiles?.avatar_url || undefined} 
              alt={consultation.profiles?.full_name || "Użytkownik"} 
            />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{consultation.profiles?.full_name || "Użytkownik"}</h3>
            <p className="text-sm text-muted-foreground">@{consultation.profiles?.username || "użytkownik"}</p>
          </div>
        </div>
        
        <h4 className="text-lg font-medium mb-2">{consultation.title}</h4>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{consultation.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {consultation.categories?.length > 0 && (
            <Badge variant="secondary">
              {consultation.categories[0]}
            </Badge>
          )}
          
          {consultation.is_online ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">Online</Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {consultation.location}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mt-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {consultation.availability?.length > 0 ? `Dostępne terminy: ${consultation.availability.length}` : "Brak dostępnych terminów"}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="font-semibold text-lg bg-primary/10 px-2 py-1 rounded text-primary">
            {new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN'
            }).format(consultation.price)}
          </div>
          
          {isOwner ? (
            <div className="flex gap-2">
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={() => onDelete(consultation.id)}>
                  Usuń
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleViewClick}>
                <Eye className="h-4 w-4 mr-1" />
                Zobacz
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Pencil className="h-4 w-4 mr-1" />
                Edytuj
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareClick}>
                <Share2 className="h-4 w-4 mr-1" />
                Udostępnij
              </Button>
            </div>
          ) : (
            <Button onClick={handleViewClick}>Rezerwuj</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
