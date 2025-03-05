
import { useState, useEffect } from 'react';

interface ProductImageProps {
  image: string | string[];
  title: string;
}

export function ProductImage({ image, title }: ProductImageProps) {
  const [mainImage, setMainImage] = useState<string>('');
  
  useEffect(() => {
    if (typeof image === 'string') {
      setMainImage(image);
    } else if (Array.isArray(image) && image.length > 0) {
      setMainImage(image[0]);
    } else {
      setMainImage('/placeholder.svg');
    }
  }, [image]);

  return (
    <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      <img 
        src={mainImage || '/placeholder.svg'} 
        alt={title}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }}
      />
    </div>
  );
}
