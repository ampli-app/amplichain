import { useNavigate } from 'react-router-dom';
import { ProductImage } from './ProductImage';
import { ProductPrice } from './ProductPrice';
import { ProductBadges } from './ProductBadges';
import { ProductActions } from './ProductActions';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | string[];
  category: string;
  category_id: string;
  sale?: boolean;
  sale_percentage?: number;
  rating: number;
  review_count: number;
  user_id: string;
  location?: string;
  condition?: string;
}

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
      <ProductImage imageUrl={product.image_url} title={product.title} />
      <ProductBadges product={product} />
      
      <div className="p-4">
        <h3 className="font-medium mb-1 line-clamp-2">{product.title}</h3>
        <ProductPrice 
          price={product.price} 
          sale={product.sale}
          salePercentage={product.sale_percentage}
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
