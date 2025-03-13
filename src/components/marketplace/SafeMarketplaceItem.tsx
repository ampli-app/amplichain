
import { MarketplaceItem as OriginalMarketplaceItem } from '@/components/MarketplaceItem';

interface MarketplaceItemProps {
  id: string;
  title: string;
  price: number;
  image: string | string[];
  category: string;
  userId?: string;
  rating?: number;
  reviewCount?: number;
  sale?: boolean;
  salePercentage?: number;
  forTesting?: boolean;
  testingPrice?: number;
  delay?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string, isFavorite: boolean) => void;
  favoriteButtonClass?: string;
}

export function SafeMarketplaceItem(props: Partial<MarketplaceItemProps>) {
  // Ensure all required properties have safe defaults
  const safeProps = {
    id: props.id || "",
    title: props.title || "Produkt bez nazwy",
    price: props.price || 0,
    image: props.image || "/placeholder.svg",
    category: props.category || "Inne",
    userId: props.userId,
    rating: props.rating || 0,
    reviewCount: props.reviewCount || 0,
    sale: props.sale || false,
    salePercentage: props.salePercentage,
    forTesting: props.forTesting || false,
    testingPrice: props.testingPrice,
    delay: props.delay || 0,
    isFavorite: props.isFavorite || false,
    onToggleFavorite: props.onToggleFavorite,
    favoriteButtonClass: props.favoriteButtonClass,
  };

  return <OriginalMarketplaceItem {...safeProps} />;
}
