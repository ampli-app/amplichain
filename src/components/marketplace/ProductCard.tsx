
import { useNavigate } from 'react-router-dom';
import { ProductImage } from './ProductImage';
import { ProductPrice } from './ProductPrice';
import { ProductBadges } from './ProductBadges';
import { ProductActions } from './ProductActions';
import { Product } from './types';
import { toast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: Product;
  isOwner: boolean;
}

export function ProductCard({ product, isOwner }: ProductCardProps) {
  const navigate = useNavigate();
  
  // Ensure product has all required properties with fallback values
  const safeProduct = {
    ...product,
    id: product.id || "",
    title: product.title || "Produkt bez nazwy",
    price: product.price || 0,
    image_url: product.image_url || "/placeholder.svg",
    for_testing: product.for_testing || false,
    sale: product.sale || false,
    sale_percentage: product.sale_percentage,
    testing_price: product.testing_price
  };
  
  // Validate that ID is a proper UUID
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  const handleCardClick = () => {
    if (isValidUUID(safeProduct.id)) {
      navigate(`/marketplace/${safeProduct.id}`);
    } else {
      console.error("Invalid product ID format:", safeProduct.id);
      toast({
        title: "Błąd",
        description: "Nieprawidłowy format ID produktu. Prosimy o kontakt z administracją.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div 
      className="group relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      onClick={handleCardClick}
    >
      <ProductImage 
        image={safeProduct.image_url} 
        title={safeProduct.title} 
      />
      <ProductBadges 
        forTesting={safeProduct.for_testing}
        isUserProduct={isOwner}
        sale={safeProduct.sale}
        salePercentage={safeProduct.sale_percentage}
      />
      
      <div className="p-4">
        <h3 className="font-medium mb-1 line-clamp-2">{safeProduct.title}</h3>
        <ProductPrice 
          price={safeProduct.price} 
          sale={safeProduct.sale}
          salePercentage={safeProduct.sale_percentage}
          forTesting={safeProduct.for_testing}
          testingPrice={safeProduct.testing_price}
        />
        <ProductActions 
          id={safeProduct.id}
          isUserProduct={isOwner}
          product={safeProduct}
        />
      </div>
    </div>
  );
}
