
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useSocial } from '@/contexts/SocialContext';
import { Image, Video, Send, X, User } from 'lucide-react';

export function CreatePost() {
  const { currentUser, createPost } = useSocial();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl) return;
    
    createPost(
      content, 
      mediaUrl || undefined, 
      mediaType || undefined
    );
    
    // Reset form
    setContent('');
    setMediaUrl('');
    setMediaType(null);
    setIsExpanded(false);
  };
  
  const handleMediaUpload = (type: 'image' | 'video') => {
    // In a real app, this would open a file picker and upload the file
    // For this demo, we'll just simulate by using a placeholder URL
    setMediaType(type);
    
    if (type === 'image') {
      setMediaUrl('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop');
    } else {
      setMediaUrl('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop');
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
              <img 
                src={mediaUrl} 
                alt="Upload preview" 
                className="w-full h-auto max-h-64 object-cover rounded-md" 
              />
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
                  onClick={() => handleMediaUpload('image')}
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden md:inline">Image</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-rhythm-600"
                  onClick={() => handleMediaUpload('video')}
                >
                  <Video className="h-4 w-4" />
                  <span className="hidden md:inline">Video</span>
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                />
              </div>
              
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={handleSubmit}
                disabled={!content.trim() && !mediaUrl}
              >
                <Send className="h-4 w-4" />
                Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
