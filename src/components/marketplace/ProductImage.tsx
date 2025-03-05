
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageProps {
  image: string | string[];
  title: string;
}

export function ProductImage({ image, title }: ProductImageProps) {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (typeof image === 'string') {
      try {
        // Check if image is a JSON string of array
        const parsedImages = JSON.parse(image);
        if (Array.isArray(parsedImages)) {
          setImages(parsedImages);
        } else {
          setImages([image]);
        }
      } catch (e) {
        // If not valid JSON, treat as a single image URL
        setImages([image]);
      }
    } else if (Array.isArray(image)) {
      setImages(image);
    } else {
      setImages(['/placeholder.svg']);
    }
  }, [image]);

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <img 
          src="/placeholder.svg" 
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      <img 
        src={images[currentIndex] || '/placeholder.svg'} 
        alt={`${title} - zdjęcie ${currentIndex + 1} z ${images.length}`}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }}
      />
      
      {images.length > 1 && (
        <>
          <Button 
            variant="secondary"
            size="icon" 
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 z-10 bg-white/80 dark:bg-black/60 rounded-full"
            onClick={goToPrevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="secondary"
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 z-10 bg-white/80 dark:bg-black/60 rounded-full"
            onClick={goToNextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-primary' : 'bg-white/60 dark:bg-zinc-600'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
