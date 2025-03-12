
import { useNavigate } from 'react-router-dom';
import { ProductImage } from './ProductImage';
import { ProductPrice } from './ProductPrice';
import { ProductBadges } from './ProductBadges';
import { ProductActions } from './ProductActions';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
  isOwner: boolean;
}

export function ProductCard({ product, isOwner }: ProductCardProps) {
  const navigate = useNavigate();
  
  const handleBuyNow = () => {
    navigate(`/checkout/${product.id}`);
  };
  
  return (
    <div className="group relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <ProductImage 
        image={product.image_url} 
        title={product.title} 
      />
      <ProductBadges 
        forTesting={product.for_testing || false}
        isUserProduct={isOwner}
        sale={product.sale || false}
        salePercentage={product.sale_percentage}
      />
      
      <div className="p-4">
        <h3 className="font-medium mb-1 line-clamp-2">{product.title}</h3>
        <ProductPrice 
          price={product.price} 
          sale={product.sale || false}
          salePercentage={product.sale_percentage}
          forTesting={product.for_testing || false}
          testingPrice={product.testing_price}
        />
        <ProductActions 
          id={product.id}
          isUserProduct={isOwner}
          onBuyNow={handleBuyNow}
        />
      </div>
    </div>
  );
}
