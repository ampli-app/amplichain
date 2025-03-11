import React from 'react';
import { XCircle } from 'lucide-react';

/**
 * Processes images from input element to be used in forms
 * @param event Input file change event
 * @param setImages Function to set images state
 * @param maxImages Maximum number of images allowed
 */
export function handleImagesChange(
  event: React.ChangeEvent<HTMLInputElement>,
  setImages: React.Dispatch<React.SetStateAction<File[]>>,
  maxImages: number = 8
) {
  if (event.target.files && event.target.files.length > 0) {
    const filesArray = Array.from(event.target.files);
    
    setImages(prevImages => {
      const totalImages = [...prevImages, ...filesArray];
      
      if (totalImages.length > maxImages) {
        const message = `Można dodać maksymalnie ${maxImages} zdjęć. Wybrano pierwsze ${maxImages}.`;
        alert(message);
        return totalImages.slice(0, maxImages);
      }
      
      return totalImages;
    });
  }
}

/**
 * Removes an image from the images array
 * @param index Index of the image to remove
 * @param setImages Function to set images state
 */
export function removeImage(
  index: number,
  setImages: React.Dispatch<React.SetStateAction<File[]>>
) {
  setImages(prevImages => prevImages.filter((_, i) => i !== index));
}

/**
 * Parses image URL string to array
 * @param imageUrl Image URL string or array
 * @returns Array of image URLs
 */
export function parseImageUrl(imageUrl: string | string[] | null | undefined): string[] {
  if (!imageUrl) return [];
  
  if (Array.isArray(imageUrl)) {
    return imageUrl;
  }
  
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed : [imageUrl];
  } catch (e) {
    return [imageUrl];
  }
}

/**
 * Gets a single preview URL for a product
 * @param imageUrl Image URL string or array
 */
export function getProductPreviewUrl(imageUrl: string | string[] | null | undefined): string {
  const images = parseImageUrl(imageUrl);
  return images.length > 0 
    ? images[0] 
    : 'https://placehold.co/600x400?text=Brak+zdjęcia';
}

interface MediaPreviewProps {
  files?: File[];
  imageUrls?: string[];
  onRemove?: (index: number) => void;
}

/**
 * Component to preview media (images)
 */
export function MediaPreview({ files, imageUrls, onRemove }: MediaPreviewProps) {
  const hasFiles = files && files.length > 0;
  const hasUrls = imageUrls && imageUrls.length > 0;
  
  if (!hasFiles && !hasUrls) return null;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
      {hasFiles && files.map((file, index) => (
        <div key={`file-${index}`} className="relative group">
          <div className="aspect-square rounded-md overflow-hidden border bg-muted/50">
            <img 
              src={URL.createObjectURL(file)} 
              alt={`Preview ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
      
      {hasUrls && imageUrls.map((url, index) => (
        <div key={`url-${index}`} className="relative group">
          <div className="aspect-square rounded-md overflow-hidden border bg-muted/50">
            <img 
              src={url} 
              alt={`Image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index + (files?.length || 0))}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
