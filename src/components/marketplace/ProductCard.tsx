
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductImage } from './ProductImage';
import { ProductPrice } from './ProductPrice';

export interface ProductCardProps {
  product: any;
  isOwner?: boolean;
  onDelete?: () => void;
}

export function ProductCard({ product, isOwner = false, onDelete }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  
  const { id, title, description, price, category, images, sale_percentage, for_testing, testing_price } = product;
  
  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/marketplace/${id}`);
  };
  
  const handleEditProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-product/${id}`);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteDialog(false);
  };
  
  return (
    <>
      <Card 
        className="overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300"
        onClick={handleViewProduct}
      >
        <div className="relative">
          <ProductImage 
            image={images?.[0] || '/placeholder.svg'} 
            title={title}
          />
          
          {sale_percentage && sale_percentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              -{sale_percentage}%
            </Badge>
          )}
          
          {for_testing && (
            <Badge className="absolute top-2 left-2 bg-blue-500">
              Tester
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{title}</h3>
          
          <div className="flex items-center mb-2">
            <Badge variant="outline">{category}</Badge>
          </div>
          
          <ProductPrice 
            price={price} 
            sale={sale_percentage ? true : false} 
            salePercentage={sale_percentage} 
            forTesting={for_testing} 
            testingPrice={testing_price} 
          />
          
          {isOwner && (
            <div className="flex mt-4 gap-2 justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => handleEditProduct(e)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edytuj
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Usuń
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten produkt?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Produkt zostanie trwale usunięty z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
