
import { useState, useRef } from 'react';
import { Group } from '@/types/group';
import { useSocial } from '@/contexts/SocialContext';
import { 
  Image, 
  FileText, 
  BarChart2, 
  Send, 
  X, 
  ChevronDown,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GroupPostCreateProps {
  group: Group;
}

type MediaFile = {
  url: string;
  type: 'image' | 'video' | 'document';
  name?: string;
  size?: number;
  fileType?: string;
};

export function GroupPostCreate({ group }: GroupPostCreateProps) {
  const { currentUser } = useSocial();
  const [content, setContent] = useState('');
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const togglePollMode = () => {
    if (isPollMode) {
      setPollOptions(['', '']);
    }
    setIsPollMode(!isPollMode);
  };
  
  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    } else {
      toast({
        title: "Limit opcji",
        description: "Możesz dodać maksymalnie 10 opcji do ankiety",
      });
    }
  };
  
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    } else {
      toast({
        title: "Minimum opcji",
        description: "Ankieta musi mieć co najmniej 2 opcje",
      });
    }
  };
  
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Check if we don't exceed the maximum files limit (6)
    if (media.length + files.length > 6) {
      toast({
        title: "Limit plików",
        description: "Możesz dodać maksymalnie 6 plików do jednego posta",
        variant: "destructive",
      });
      return;
    }
    
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isDocument = !isImage && !isVideo;
      
      const mediaType = isImage ? 'image' as const : 
                        isVideo ? 'video' as const : 
                        'document' as const;
      
      const url = URL.createObjectURL(file);
      
      setMedia(prev => [...prev, { 
        url, 
        type: mediaType,
        name: file.name,
        size: file.size,
        fileType: file.type
      }]);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };
  
  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleSubmit = () => {
    if (isPollMode) {
      // Validate poll options
      const filledOptions = pollOptions.filter(option => option.trim() !== '');
      if (filledOptions.length < 2) {
        toast({
          title: "Nieprawidłowa ankieta",
          description: "Ankieta musi mieć co najmniej 2 uzupełnione opcje",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!content.trim() && media.length === 0 && !isPollMode) {
      toast({
        title: "Pusty post",
        description: "Post musi zawierać tekst, ankietę lub media",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, here we would send the post to the server
    toast({
      title: "Post utworzony",
      description: "Twój post został pomyślnie opublikowany w grupie",
    });
    
    // Reset form
    setContent('');
    setIsPollMode(false);
    setPollOptions(['', '']);
    setMedia([]);
    setIsExpanded(false);
  };

  return (
    <div className="glass-card rounded-xl p-5 border shadow-sm">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
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
            placeholder={`Napisz coś do grupy "${group.name}"...`}
            className="resize-none mb-3 min-h-24"
            onFocus={() => setIsExpanded(true)}
          />
          
          {isPollMode && (
            <div className="space-y-3 mb-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <h3 className="font-medium">Opcje ankiety:</h3>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    placeholder={`Opcja ${index + 1}`}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  {pollOptions.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removePollOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addPollOption}
                disabled={pollOptions.length >= 10}
                className="w-full justify-center"
              >
                Dodaj opcję
              </Button>
            </div>
          )}
          
          {media.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {media.map((item, index) => (
                <div key={index} className="relative rounded-md overflow-hidden">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 opacity-90 z-10"
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
          )}
          
          {isExpanded && (
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5 text-rhythm-600"
                    >
                      <ChevronDown className="h-4 w-4" />
                      <span className="hidden md:inline">Rodzaj posta</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => setIsPollMode(false)}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Zwykły post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={togglePollMode}
                    >
                      <BarChart2 className="h-4 w-4" />
                      <span>Ankieta</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-rhythm-600"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={media.length >= 6}
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden md:inline">Media ({media.length}/6)</span>
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                  multiple
                  onChange={handleFileUpload}
                />
              </div>
              
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={handleSubmit}
                disabled={(isPollMode && pollOptions.filter(o => o.trim()).length < 2) && 
                          (!content.trim() && media.length === 0)}
              >
                <Send className="h-4 w-4" />
                Opublikuj
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
