
import { useState } from 'react';
import { GroupMedia } from '@/types/group';
import { 
  Dialog, 
  DialogContent, 
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Download } from 'lucide-react';

interface GroupMediaGridProps {
  media: GroupMedia[];
  searchQuery: string;
}

export function GroupMediaGrid({ media, searchQuery }: GroupMediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<GroupMedia | null>(null);
  
  // For real implementation, we would filter based on post content
  const filteredMedia = searchQuery ? 
    media.filter(item => item.url.toLowerCase().includes(searchQuery.toLowerCase())) : 
    media;
  
  if (filteredMedia.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <>
            <h3 className="text-lg font-medium mb-2">Brak wyników dla "{searchQuery}"</h3>
            <p className="text-muted-foreground">Spróbuj innych słów kluczowych</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2">Brak mediów</h3>
            <p className="text-muted-foreground">W tej grupie nie zostały jeszcze udostępnione żadne zdjęcia ani filmy.</p>
          </>
        )}
      </div>
    );
  }
  
  const openMedia = (media: GroupMedia) => {
    setSelectedMedia(media);
  };
  
  const closeMedia = () => {
    setSelectedMedia(null);
  };
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <div 
            key={item.id} 
            className="aspect-square rounded-md overflow-hidden cursor-pointer relative group"
            onClick={() => openMedia(item)}
          >
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt="Media" 
                className="w-full h-full object-cover"
              />
            ) : (
              <video 
                src={item.url} 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <Button 
                variant="secondary" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={!!selectedMedia} onOpenChange={closeMedia}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            <DialogClose className="absolute top-2 right-2 z-10">
              <Button variant="destructive" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
            
            <div className="bg-black flex items-center justify-center min-h-[300px] max-h-[80vh]">
              {selectedMedia?.type === 'image' ? (
                <img 
                  src={selectedMedia?.url} 
                  alt="Media" 
                  className="max-w-full max-h-[80vh] object-contain"
                />
              ) : (
                <video 
                  src={selectedMedia?.url} 
                  controls
                  className="max-w-full max-h-[80vh]"
                />
              )}
            </div>
            
            <div className="p-4 bg-background flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Opublikowano: {new Date(selectedMedia?.createdAt || '').toLocaleDateString()}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                Pobierz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
