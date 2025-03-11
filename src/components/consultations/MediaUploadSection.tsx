
import { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MediaPreview, MediaFile } from '@/components/social/MediaPreview';
import { handleFileUpload } from '@/utils/mediaUtils';
import { Upload, PlusCircle, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaUploadSectionProps {
  media: MediaFile[];
  setMedia: (media: MediaFile[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export function MediaUploadSection({ 
  media, 
  setMedia, 
  disabled = false,
  maxFiles = 6 
}: MediaUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleAddImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    setMedia(updatedMedia);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const event = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileUpload(event, media, setMedia, fileInputRef);
    }
  };
  
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label>Zdjęcia konsultacji ({media.length}/{maxFiles})</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddImageClick}
          disabled={disabled || media.length >= maxFiles}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Dodaj zdjęcie
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e, media, setMedia, fileInputRef)}
        disabled={disabled || media.length >= maxFiles}
      />
      
      {/* Drop zone for images */}
      {media.length < maxFiles && (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 hover:border-primary dark:border-gray-800'
          }`}
          onClick={handleAddImageClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium">
            Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Możesz dodać maksymalnie {maxFiles} zdjęć (pozostało {maxFiles - media.length})
          </p>
        </div>
      )}
      
      {/* Image previews */}
      {media.length > 0 && (
        <ScrollArea className="h-44 rounded-md border p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden border bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={item.url || URL.createObjectURL(item.file!)} 
                    alt={`Podgląd ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon" 
                  className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
