
export const useProductImage = (product: any) => {
  const getProductImageUrl = () => {
    if (!product || !product.image_url) return '/placeholder.svg';
    
    try {
      if (typeof product.image_url === 'string') {
        try {
          const images = JSON.parse(product.image_url);
          if (Array.isArray(images) && images.length > 0) {
            return images[0];
          }
        } catch (e) {
          return product.image_url;
        }
      } else if (Array.isArray(product.image_url) && product.image_url.length > 0) {
        return product.image_url[0];
      }
    } catch (e) {
      console.error("Error parsing image URL:", e);
    }
    
    return '/placeholder.svg';
  };
  
  const getThumbnailUrl = (imageUrl: string) => {
    if (!imageUrl || imageUrl === '/placeholder.svg') return '/placeholder.svg';
    
    // Jeśli URL zawiera parametry, dodaj &thumbnail=true, w przeciwnym razie ?thumbnail=true
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}thumbnail=true`;
  };
  
  return {
    getProductImageUrl,
    getThumbnailUrl
  };
};
