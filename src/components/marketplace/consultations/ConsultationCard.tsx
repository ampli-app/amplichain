
import { Heart, Share2, User, Clock, Video, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface ConsultationCardProps {
  consultation: {
    id: string;
    title: string;
    price: number;
    description?: string;
    categories?: string[];
    experience?: string;
    is_online?: boolean;
    location?: string;
    profiles?: {
      avatar_url?: string;
      full_name?: string;
      username?: string;
    };
    user_id: string;
  };
  isFavorite: boolean;
  onToggleFavorite: (consultationId: string, isFavorite: boolean) => void;
}

export function ConsultationCard({ consultation, isFavorite, onToggleFavorite }: ConsultationCardProps) {
  const navigate = useNavigate();
  
  // Określ ikony dla preferowanych form kontaktu
  const contactIcons = {
    video: <Video className="h-3 w-3 text-blue-500" />,
    phone: <Phone className="h-3 w-3 text-green-500" />,
    chat: <MessageCircle className="h-3 w-3 text-purple-500" />
  };
  
  // Określ preferowane formy kontaktu na podstawie danych konsultacji
  const contactMethods = consultation.is_online 
    ? ['video', 'chat'] 
    : consultation.location ? ['phone', 'video'] : ['chat'];
    
  const handleCardClick = (e: React.MouseEvent) => {
    // Jeśli kliknięcie nie było na przycisku, nawiguj do strony szczegółów
    if (!(e.target as HTMLElement).closest('button')) {
      navigate(`/consultations/${consultation.id}`);
    }
  };
  
  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-all group cursor-pointer" onClick={handleCardClick}>
      <Button 
        variant="secondary"
        size="icon" 
        className="absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(consultation.id, isFavorite);
        }}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-red-500" : "text-zinc-400"}`} />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute bottom-3 right-3 opacity-70 hover:opacity-100 z-10"
        onClick={(e) => {
          e.stopPropagation();
          const consultationUrl = `${window.location.origin}/consultations/${consultation.id}`;
          navigator.clipboard.writeText(consultationUrl);
          toast({
            title: "Link skopiowany",
            description: "Link do konsultacji został skopiowany do schowka.",
          });
        }}
      >
        <Share2 className="h-4 w-4" />
      </Button>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage 
              src={consultation.profiles?.avatar_url || undefined} 
              alt={consultation.profiles?.full_name || "Ekspert"} 
            />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{consultation.profiles?.full_name || "Ekspert"}</h3>
            <p className="text-sm text-muted-foreground">@{consultation.profiles?.username || "użytkownik"}</p>
          </div>
        </div>
        
        <h4 className="text-lg font-medium mb-2">{consultation.title}</h4>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{consultation.description || ""}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {consultation.categories && consultation.categories.map((category, idx) => (
            <Badge key={`${category}-${idx}`} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
        
        {/* Dostępne formy kontaktu */}
        <div className="flex gap-2 mb-4">
          {contactMethods.map((method) => (
            <Badge key={method} variant="outline" className="flex items-center gap-1">
              {contactIcons[method as keyof typeof contactIcons]}
              <span className="capitalize text-xs">{method === 'video' ? 'Wideo' : method === 'phone' ? 'Telefon' : 'Chat'}</span>
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="font-semibold text-lg bg-primary/10 px-2 py-1 rounded text-primary">
            {new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN'
            }).format(consultation.price)}
          </div>
          
          <Button>Zobacz szczegóły</Button>
        </div>
      </CardContent>
    </Card>
  );
}
