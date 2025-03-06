
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type MediaFile = {
  url: string;
  type: 'image' | 'video' | 'document';
  name?: string;
  size?: number;
  fileType?: string;
  file?: File;
};

interface MediaPreviewProps {
  media: MediaFile[];
  onRemoveMedia: (index: number) => void;
  disabled?: boolean;
}

export function MediaPreview({ media, onRemoveMedia, disabled = false }: MediaPreviewProps) {
  if (media.length === 0) return null;
  
  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
      {media.map((item, index) => (
        <div key={index} className="relative rounded-md overflow-hidden">
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 h-7 w-7 opacity-90 z-10"
            onClick={() => onRemoveMedia(index)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {item.type === 'image' ? (
            <img 
              src={item.url} 
              alt={`Załącznik ${index + 1}`} 
              className="w-full h-auto max-h-48 object-cover rounded-md" 
            />
          ) : item.type === 'video' ? (
            <video 
              src={item.url}
              controls
              className="w-full h-auto max-h-48 object-cover rounded-md"
            />
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md flex flex-col items-center justify-center min-h-[100px]">
              <FileText className="h-10 w-10 mb-2 text-slate-500" />
              <p className="text-sm font-medium truncate max-w-full">{item.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
