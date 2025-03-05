
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ProductActionsProps {
  id: string;
  isUserProduct: boolean;
}

export function ProductActions({ id, isUserProduct }: ProductActionsProps) {
  const navigate = useNavigate();
  
  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/marketplace/${id}`);
  };
  
  const handleEditProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-product/${id}`);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/marketplace/${id}`;
    navigator.clipboard.writeText(productUrl);
    toast({
      title: "Link skopiowany",
      description: "Link do produktu został skopiowany do schowka.",
    });
  };

  return (
    <div className="flex justify-between mt-4">
      {/* Button container to ensure proper alignment */}
      <div>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 h-9"
          onClick={handleViewProduct}
        >
          <Eye className="h-4 w-4" />
          Zobacz produkt
        </Button>
      </div>
      
      <div className="flex gap-2">
        {/* Edit button only for user's products */}
        {isUserProduct && (
          <Button 
            variant="default" 
            size="sm"
            className="bg-[#9E9D1B] hover:bg-[#7e7c14] flex items-center gap-1 h-9"
            onClick={handleEditProduct}
          >
            <Pencil className="h-4 w-4" />
            Edytuj
          </Button>
        )}
        
        {/* Share button - dodana przestrzeń */}
        <Button 
          variant="secondary" 
          size="icon"
          className="h-9 w-9"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
