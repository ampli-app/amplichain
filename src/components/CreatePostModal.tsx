
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Image, X, Send, FileUp } from 'lucide-react';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from '@/components/ui/use-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const { createPost, loading } = useSocial();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Sprawdź, czy nie przekraczamy limitu 4 plików
    if (media.length + files.length > 4) {
      toast({
        title: "Błąd",
        description: "Możesz dodać maksymalnie 4 pliki",
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach(file => {
      // W prawdziwej aplikacji tutaj byłoby wysyłanie pliku do serwera i pobranie URL
      // Dla potrzeb demonstracji tworzymy tymczasowy URL
      const type = file.type.startsWith('image/') ? 'image' as const : 'video' as const;
      const url = URL.createObjectURL(file);
      
      setMedia(prev => [...prev, { url, type }]);
    });
    
    // Resetuj input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      toast({
        title: "Błąd",
        description: "Post musi zawierać tekst lub media",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Tworzenie posta z modalu:', {
        content,
        mediaUrl: media[0]?.url,
        mediaType: media[0]?.type,
        mediaFiles: media.length > 1 ? media : undefined
      });
      
      await createPost(
        content,
        media[0]?.url,
        media[0]?.type,
        media.length > 1 ? media : undefined
      );
      
      // Resetuj formularz
      setContent('');
      setMedia([]);
      
      // Zamknij modal
      onClose();
      
      toast({
        title: "Sukces",
        description: "Post został utworzony pomyślnie"
      });
    } catch (error) {
      console.error("Błąd podczas tworzenia posta:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas tworzenia posta",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nowy post</DialogTitle>
          <DialogDescription>
            Podziel się czymś ze społecznością
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Co chcesz opublikować?"
            className="resize-none min-h-24"
          />
          
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {media.map((item, index) => (
                <div key={index} className="relative rounded-md overflow-hidden">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 opacity-90"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={`Załącznik ${index + 1}`} 
                      className="w-full h-auto max-h-48 object-cover rounded-md" 
                    />
                  ) : (
                    <video 
                      src={item.url} 
                      controls 
                      className="w-full h-auto max-h-48 object-cover rounded-md"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="gap-1.5 text-rhythm-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={media.length >= 4 || loading}
            >
              <FileUp className="h-4 w-4" />
              <span>Dodaj pliki ({media.length}/4)</span>
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*" 
              multiple
              onChange={handleMediaUpload}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            className="gap-1.5"
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && media.length === 0)}
          >
            {loading ? "Tworzenie..." : (
              <>
                <Send className="h-4 w-4" />
                Opublikuj
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
