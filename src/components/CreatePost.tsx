
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useSocial } from '@/contexts/SocialContext';
import { Image, Video, Send, X, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function CreatePost() {
  const { currentUser, createPost, loading } = useSocial();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<Array<{ url: string; type: 'image' | 'video' }>>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      console.log('Tworzenie posta:', {
        content,
        mediaUrl: media[0]?.url,
        mediaType: media[0]?.type,
        mediaFiles: media.length > 1 ? media : undefined
      });
      
      await createPost(
        content, 
        media[0]?.url || undefined, 
        media[0]?.type || undefined,
        media.length > 1 ? media : undefined
      );
      
      // Reset form
      setContent('');
      setMedia([]);
      setIsExpanded(false);
      
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
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  
  return (
    <div className="glass-card rounded-xl p-5 border">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={currentUser?.avatar} 
            alt={currentUser?.name || "Twój profil"} 
          />
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Podziel się czymś ze swoją siecią..."
            className="resize-none mb-3 min-h-24"
            onFocus={() => setIsExpanded(true)}
          />
          
          {media.length > 0 && (
            <div className={`grid ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-3`}>
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
          
          {isExpanded && (
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-rhythm-600"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={media.length >= 4 || loading}
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden md:inline">Media ({media.length}/4)</span>
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  multiple
                  onChange={handleFileUpload}
                />
              </div>
              
              <Button
                type="button"
                size="sm"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
