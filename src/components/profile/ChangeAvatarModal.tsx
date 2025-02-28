
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Upload, Image, Loader2, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarChanged: (newAvatarUrl: string) => void;
  currentAvatarUrl?: string;
}

export function ChangeAvatarModal({ isOpen, onClose, onAvatarChanged, currentAvatarUrl }: ChangeAvatarModalProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Sprawdź typ pliku (akceptujemy tylko obrazy)
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Błąd",
          description: "Proszę wybrać plik obrazu (jpg, png, gif, itp.)",
          variant: "destructive",
        });
        return;
      }
      
      // Sprawdź rozmiar pliku (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Plik jest za duży",
          description: "Maksymalny rozmiar zdjęcia to 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Utwórz podgląd wybranego zdjęcia
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    setIsUploading(true);
    
    try {
      // Przygotuj ścieżkę pliku: userId/randomUUID.rozszerzenie
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      // Uploaduj plik do bucketu profile_avatars
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile_avatars')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Pobierz publiczny URL do pliku
      const { data: urlData } = await supabase.storage
        .from('profile_avatars')
        .getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Nie udało się uzyskać publicznego URL do zdjęcia');
      }
      
      // Zaktualizuj pole avatar_url w profilu użytkownika
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Powiadom o sukcesie
      toast({
        title: "Sukces",
        description: "Zdjęcie profilowe zostało zaktualizowane",
      });
      
      // Przekaż nowy URL avatara
      onAvatarChanged(urlData.publicUrl);
      onClose();
      
    } catch (error: any) {
      console.error('Błąd podczas aktualizacji zdjęcia profilowego:', error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zaktualizować zdjęcia profilowego",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;
    
    setIsUploading(true);
    
    try {
      // Zaktualizuj pole avatar_url w profilu użytkownika na null lub domyślną wartość
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Powiadom o sukcesie
      toast({
        title: "Sukces",
        description: "Zdjęcie profilowe zostało usunięte",
      });
      
      // Przekaż pusty URL avatara
      onAvatarChanged('/placeholder.svg');
      onClose();
      
    } catch (error: any) {
      console.error('Błąd podczas usuwania zdjęcia profilowego:', error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się usunąć zdjęcia profilowego",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zmień zdjęcie profilowe</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex items-center justify-center mb-4">
            {previewUrl ? (
              <div className="relative">
                <Avatar className="h-32 w-32 rounded-full border-4 border-background">
                  <AvatarImage src={previewUrl} alt="Podgląd" className="object-cover" />
                </Avatar>
                <button 
                  onClick={resetSelection}
                  className="absolute -top-2 -right-2 bg-background rounded-full shadow-sm hover:text-destructive"
                  aria-label="Usuń wybrane zdjęcie"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Avatar className="h-32 w-32 rounded-full border-4 border-background">
                <AvatarImage src={currentAvatarUrl} alt="Obecne zdjęcie" className="object-cover" />
                <AvatarFallback className="text-4xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={triggerFileInput}
                className="w-full max-w-xs"
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Wybierz zdjęcie
              </Button>
              
              {currentAvatarUrl && currentAvatarUrl !== '/placeholder.svg' && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDeleteAvatar}
                  className="w-full max-w-xs text-destructive hover:text-destructive"
                  disabled={isUploading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Usuń obecne zdjęcie
                </Button>
              )}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Dozwolone formaty: JPG, PNG, GIF</p>
              <p>Maksymalny rozmiar: 2MB</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={isUploading}
          >
            Anuluj
          </Button>
          <Button 
            type="button" 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Image className="mr-2 h-4 w-4" />
                Zapisz zdjęcie
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
