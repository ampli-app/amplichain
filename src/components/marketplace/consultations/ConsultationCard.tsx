
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, PenSquare, Trash2 } from 'lucide-react';
import { ConsultationCardProps } from '@/types/consultations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
    <Card className="overflow-hidden h-full flex flex-col relative group hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        {/* Badges w lewym górnym rogu */}
        {categories && categories.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
            {categories.slice(0, 2).map((category, idx) => (
              <Badge key={idx} variant="secondary" className="bg-white text-black">
                {category}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge variant="secondary" className="bg-white text-black">
                +{categories.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {/* Ikona serduszka w prawym górnym rogu */}
        <Button 
          variant="secondary"
          size="icon" 
          className="absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
          onClick={() => onToggleFavorite && onToggleFavorite(id, isFavorite)}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-red-500" : "text-zinc-400"}`} />
        </Button>
        
        {/* Badge "Twój produkt" dla właściciela */}
        {isOwner && (
          <Badge className="absolute top-3 left-3 z-10 bg-green-500 hover:bg-green-500">
            Twoja konsultacja
          </Badge>
        )}
        
        <Link to={`/consultation/${id}`}>
          <AspectRatio ratio={16/9}>
            <img
              src={displayImage}
              alt={title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          
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
            
            <div className="flex items-center text-sm mt-auto">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="font-medium">{price} PLN za godzinę</span>
            </div>
          </div>
        </Link>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0 mt-auto flex justify-between">
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
              <Link to={`/consultation/${id}`}>
                Szczegóły
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
