
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useSocial } from '@/contexts/SocialContext';
import { Image, Video, Send, X, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function CreatePost() {
  const { currentUser, createPost } = useSocial();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = async () => {
    if (!content.trim() && !mediaUrl) {
      toast({
        title: "Błąd",
        description: "Post musi zawierać tekst lub media",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createPost(
        content, 
        mediaUrl || undefined, 
        mediaType || undefined
      );
      
      // Reset form
      setContent('');
      setMediaUrl('');
      setMediaType(null);
      setIsExpanded(false);
      
      toast({
        title: "Sukces",
        description: "Post został utworzony",
      });
    } catch (error) {
      console.error("Błąd podczas tworzenia posta:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas tworzenia posta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const type = file.type.startsWith('image/') ? 'image' as const : 'video' as const;
    const url = URL.createObjectURL(file);
    
    setMediaType(type);
    setMediaUrl(url);
    
    // Resetuj input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeMedia = () => {
    setMediaUrl('');
    setMediaType(null);
  };
  
  return (
    <div className="glass-card rounded-xl p-5 border">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={currentUser?.avatar} 
            alt={currentUser?.name || "Your profile"} 
          />
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with your network..."
            className="resize-none mb-3 min-h-24"
            onFocus={() => setIsExpanded(true)}
          />
          
          {mediaUrl && (
            <div className="relative rounded-md overflow-hidden mb-3">
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-7 w-7 opacity-90"
                onClick={removeMedia}
              >
                <X className="h-4 w-4" />
              </Button>
              {mediaType === 'image' ? (
                <img 
                  src={mediaUrl} 
                  alt="Upload preview" 
                  className="w-full h-auto max-h-64 object-cover rounded-md" 
                />
              ) : (
                <video 
                  src={mediaUrl}
                  controls
                  className="w-full h-auto max-h-64 object-cover rounded-md"
                />
              )}
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
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden md:inline">Image</span>
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={handleFileUpload}
                />
              </div>
              
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={handleSubmit}
                disabled={isSubmitting || (!content.trim() && !mediaUrl)}
              >
                {isSubmitting ? "Tworzenie..." : (
                  <>
                    <Send className="h-4 w-4" />
                    Post
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
