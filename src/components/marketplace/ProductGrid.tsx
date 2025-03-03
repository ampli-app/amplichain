
import { useState } from 'react';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { Button } from '@/components/ui/button';
import { PaginationControls } from './PaginationControls';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | string[];
  category: string | null;
  category_id: string | null;
  rating: number | null;
  review_count: number | null;
  sale?: boolean | null;
  sale_percentage?: number | null;
  for_testing?: boolean | null;
  testing_price?: number | null;
  created_at?: string;
  user_id?: string;
  condition?: string;
}

interface ProductGridProps {
  displayedProducts: Product[];
  filteredProducts: Product[];
  loading: boolean;
  products: Product[];
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  handleAddProductClick: () => void;
}

export function ProductGrid({
  displayedProducts,
  filteredProducts,
  loading,
  products,
  currentPage,
  totalPages,
  handlePageChange,
  handleAddProductClick
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 animate-pulse">
            <div className="aspect-square bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="p-5 space-y-3">
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-2/3"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3"></div>
              <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">Nie znaleziono produktów</h3>
        <p className="text-zinc-600 mb-6">
          {filteredProducts.length === 0 && products.length > 0 
            ? "Spróbuj zmienić filtry aby zobaczyć więcej produktów." 
            : "Nie ma jeszcze żadnych produktów. Dodaj pierwszy produkt!"}
        </p>
        <Button onClick={handleAddProductClick}>Dodaj produkt</Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProducts.map((item, index) => (
          <MarketplaceItem
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price}
            image={item.image_url}
            category={item.category || "Inne"}
            userId={item.user_id}
            rating={item.rating || 0}
            reviewCount={item.review_count || 0}
            sale={item.sale || false}
            salePercentage={item.sale_percentage}
            forTesting={item.for_testing || false}
            testingPrice={item.testing_price}
            delay={index * 0.05}
          />
        ))}
      </div>
      
      <PaginationControls 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </>
  );
}
