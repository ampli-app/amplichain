
import { Button } from "@/components/ui/button";
import { Edit, Share2, Heart } from 'lucide-react';

interface ConsultationActionsProps {
  isOwner: boolean;
  isFavorite: boolean;
  onEdit: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
  onBuy: () => void;
}

export const ConsultationActions = ({ 
  isOwner, 
  isFavorite, 
  onEdit, 
  onShare, 
  onToggleFavorite, 
  onBuy 
}: ConsultationActionsProps) => {
  if (isOwner) {
    return (
      <div className="flex gap-4">
        <Button 
          variant="default" 
          className="bg-[#9E9D1B] hover:bg-[#7e7c14] flex-1 gap-2"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
          Edytuj produkt
        </Button>
        
        <Button 
          variant="secondary" 
          className="gap-2"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
          Udostępnij
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button 
        variant="secondary"
        size="icon" 
        className="absolute -top-14 right-3 opacity-70 hover:opacity-100 z-10"
        onClick={onToggleFavorite}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-red-500" : "text-zinc-400"}`} />
      </Button>
      
      <Button 
        className="w-full gap-2 mt-4"
        onClick={onBuy}
      >
        Kup teraz
      </Button>
      
      <Button 
        variant="secondary" 
        className="w-full gap-2 mt-2"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" />
        Udostępnij
      </Button>
    </div>
  );
};
