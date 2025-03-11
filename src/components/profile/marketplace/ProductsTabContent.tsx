
import { ProductCard } from '@/components/marketplace/ProductCard';
import { MarketplaceEmptyState } from './MarketplaceEmptyState';

interface ProductsTabContentProps {
  products: any[];
  isOwner: boolean;
  onDelete: (id: string) => void;
  onAddProduct: () => void;
}

export function ProductsTabContent({
  products,
  isOwner,
  onDelete,
  onAddProduct
}: ProductsTabContentProps) {
  if (products.length === 0) {
    return (
      <MarketplaceEmptyState 
        title="Brak produktów"
        description="Nie masz jeszcze żadnych produktów."
        buttonText="Dodaj pierwszy produkt"
        onButtonClick={onAddProduct}
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product} 
          isOwner={isOwner}
          onDelete={() => onDelete(product.id)}
        />
      ))}
    </div>
  );
}
