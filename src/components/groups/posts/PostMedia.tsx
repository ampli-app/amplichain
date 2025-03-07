
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Media {
  url: string;
  type: 'image' | 'video';
}

interface PostMediaProps {
  media: Media[];
}

export function PostMedia({ media }: PostMediaProps) {
  if (!media || media.length === 0) return null;
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleMediaClick = (index: number) => {
    setCurrentIndex(index);
    setOpenDialog(true);
  };
  
  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };
  
  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };
  
  const handleMainImageClick = () => {
    // Otwieranie podglądu zamiast przewijania
    setOpenDialog(true);
  };

  return (
    <>
      {/* Main media display */}
      <div className="mb-4 relative">
        <div 
          className="relative rounded-md overflow-hidden cursor-pointer w-full h-64 lg:h-80"
          onClick={handleMainImageClick}
        >
          {media[currentIndex].type === 'video' ? (
            <video 
              src={media[currentIndex].url}
              className="w-full h-full object-cover rounded-md"
              controls
            />
          ) : (
            <img 
              src={media[currentIndex].url} 
              alt={`Media ${currentIndex + 1}`} 
              className="w-full h-full object-cover rounded-md" 
              onError={(e) => {
                console.error("Błąd ładowania obrazu:", media[currentIndex].url);
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          )}
          
          {/* Navigation arrows - only shown if there are multiple media */}
          {media.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/40 hover:bg-black/60" 
                onClick={(e) => {
                  e.stopPropagation();
                  prevMedia();
                }}
              >
                <ChevronLeft />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/40 hover:bg-black/60" 
                onClick={(e) => {
                  e.stopPropagation();
                  nextMedia();
                }}
              >
                <ChevronRight />
              </Button>
            </>
          )}
        </div>
        
        {/* Pagination indicator */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
            {media.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Thumbnails navigation - shown only if there are multiple media */}
        {media.length > 1 && (
          <div className="flex mt-2 space-x-2 overflow-x-auto pb-2">
            {media.map((item, idx) => (
              <div 
                key={idx} 
                className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${
                  idx === currentIndex ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-white text-xs">Wideo</span>
                  </div>
                ) : (
                  <img 
                    src={item.url} 
                    alt={`Miniatura ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Fullscreen media dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10 text-white bg-black/40 hover:bg-black/60" 
              onClick={() => setOpenDialog(false)}
            >
              <X />
            </Button>
            
            {/* Navigation buttons */}
            {media.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/40 hover:bg-black/60" 
                  onClick={prevMedia}
                >
                  <ChevronLeft />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/40 hover:bg-black/60" 
                  onClick={nextMedia}
                >
                  <ChevronRight />
                </Button>
              </>
            )}
            
            {/* Current media display */}
            <div className="flex items-center justify-center h-[80vh] w-full">
              {media[currentIndex].type === 'video' ? (
                <video 
                  src={media[currentIndex].url}
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <img 
                  src={media[currentIndex].url} 
                  alt={`Media ${currentIndex + 1}`} 
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    console.error("Błąd ładowania obrazu w podglądzie:", media[currentIndex].url);
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              )}
            </div>
            
            {/* Pagination indicator */}
            {media.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                {media.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
