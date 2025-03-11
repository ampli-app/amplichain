
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, PenSquare, Trash2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ConsultationCardProps } from '@/types/consultations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ConsultationCard({ 
  consultation, 
  isFavorite, 
  isOwner = false,
  onToggleFavorite,
  onDelete
}: ConsultationCardProps) {
  const { id, title, description, price, categories, profiles, images } = consultation;
  const displayImage = images && images.length > 0 
    ? images[0] 
    : "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop";

  // Limit description length
  const shortDescription = description && description.length > 120 
    ? description.substring(0, 120) + '...' 
    : description;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-0">
        <Link to={`/consultations/${id}`}>
          <div className="relative">
            <AspectRatio ratio={16/9}>
              <img
                src={displayImage}
                alt={title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            
            {isOwner && (
              <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded-md text-xs font-medium">
                Twoja konsultacja
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src={profiles?.avatar_url || ''} />
                <AvatarFallback>{profiles?.full_name?.substring(0, 2) || '??'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{profiles?.full_name || 'Ekspert'}</h3>
                <p className="text-sm text-muted-foreground">{profiles?.username || 'użytkownik'}</p>
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-2 line-clamp-2">{title}</h2>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {shortDescription || 'Brak opisu'}
            </p>
            
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {categories.slice(0, 3).map((category, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {categories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{categories.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center text-sm mt-auto">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="font-medium">{price} PLN za godzinę</span>
            </div>
          </div>
        </Link>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0 mt-auto flex justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorite(id, isFavorite)}
          className={isFavorite ? 'text-red-500 hover:text-red-600' : ''}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`} />
        </Button>
        
        <div className="flex gap-2">
          {isOwner && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/edit-consultation/${id}`}>
                  <PenSquare className="h-4 w-4 mr-1" />
                  Edytuj
                </Link>
              </Button>
              
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Usuń
                </Button>
              )}
            </>
          )}
          
          {!isOwner && (
            <Button asChild>
              <Link to={`/consultations/${id}`}>
                Szczegóły
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
