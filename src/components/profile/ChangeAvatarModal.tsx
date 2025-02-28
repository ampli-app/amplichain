
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Image, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarChanged: (newAvatarUrl: string) => void;
  currentAvatarUrl: string;
}

export function ChangeAvatarModal({ isOpen, onClose, onAvatarChanged, currentAvatarUrl }: ChangeAvatarModalProps) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>(currentAvatarUrl);
  const [uploading, setUploading] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Sprawdź, czy używane jest domyślne zdjęcie profilowe
  const isDefaultAvatar = avatarUrl === '/placeholder.svg';

  useEffect(() => {
    setAvatarUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [imageFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Sprawdź typ pliku
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Nieprawidłowy typ pliku",
          description: "Proszę wybrać plik graficzny (JPG, PNG, itp.)",
          variant: "destructive",
        });
        return;
      }
      
      // Sprawdź rozmiar pliku (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Plik jest za duży",
          description: "Maksymalny rozmiar pliku to 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
    }
  };

  const uploadAvatar = async () => {
    if (!user || !imageFile) return;
    
    setUploading(true);
    
    try {
      // Przygotowanie nazwy pliku z ID użytkownika jako prefiks
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Usuń poprzednie zdjęcie jeśli istnieje i nie jest domyślne
      if (avatarUrl && !avatarUrl.includes('placeholder.svg') && avatarUrl.includes('profile_avatars')) {
        const oldPath = avatarUrl.split('/').slice(-1)[0];
        if (oldPath) {
          const { error: deleteError } = await supabase
            .storage
            .from('profile_avatars')
            .remove([`${user.id}/${oldPath}`]);
            
          if (deleteError) {
            console.error('Błąd usuwania poprzedniego zdjęcia:', deleteError);
          }
        }
      }
      
      // Wyślij plik do Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('profile_avatars')
        .upload(filePath, imageFile);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Uzyskaj publiczny URL dla przesłanego zdjęcia
      const { data } = await supabase
        .storage
        .from('profile_avatars')
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      // Aktualizuj profil użytkownika z nowym URL zdjęcia
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Zaktualizuj stan i powiadom rodzica
      setAvatarUrl(publicUrl);
      onAvatarChanged(publicUrl);
      
      toast({
        title: "Zdjęcie zaktualizowane",
        description: "Twoje zdjęcie profilowe zostało pomyślnie zaktualizowane.",
      });
      
      onClose();
    } catch (error: any) {
      console.error('Błąd aktualizacji zdjęcia:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować zdjęcia profilowego. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  const removeAvatar = async () => {
    if (!user || isDefaultAvatar) return;
    
    setUploading(true);
    
    try {
      // Usuń zdjęcie ze storage, jeśli nie jest domyślne
      if (avatarUrl && !avatarUrl.includes('placeholder.svg') && avatarUrl.includes('profile_avatars')) {
        const pathParts = avatarUrl.split('/');
        const filename = pathParts[pathParts.length - 1];
        const filePath = `${user.id}/${filename}`;
        
        const { error: deleteError } = await supabase
          .storage
          .from('profile_avatars')
          .remove([filePath]);
          
        if (deleteError) {
          console.error('Błąd usuwania zdjęcia:', deleteError);
        }
      }
      
      // Ustaw domyślne zdjęcie w profilu
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: '/placeholder.svg' })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Zaktualizuj stan i powiadom rodzica
      setAvatarUrl('/placeholder.svg');
      onAvatarChanged('/placeholder.svg');
      
      toast({
        title: "Zdjęcie usunięte",
        description: "Twoje zdjęcie profilowe zostało usunięte.",
      });
      
      onClose();
    } catch (error: any) {
      console.error('Błąd usuwania zdjęcia:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć zdjęcia profilowego. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zmień zdjęcie profilowe</DialogTitle>
          <DialogDescription>
            Wybierz nowe zdjęcie profilowe lub usuń obecne.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={previewUrl || avatarUrl} alt="Podgląd" />
              <AvatarFallback>
                <Image className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-2">
            <label 
              htmlFor="avatar-upload" 
              className="flex cursor-pointer justify-center rounded-lg border border-dashed p-6 hover:border-primary"
            >
              <div className="flex flex-col items-center gap-1 text-center">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Przeciągnij i upuść lub kliknij, aby przesłać
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG (maks. 2MB)
                </span>
              </div>
              <Input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="sr-only" 
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            type="button"
            variant="destructive"
            onClick={removeAvatar}
            disabled={uploading || isDefaultAvatar} // Blokujemy usuwanie domyślnej ikony
            className="order-1 sm:order-none"
          >
            {isDefaultAvatar ? (
              "Nie można usunąć domyślnego zdjęcia"
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Usuń zdjęcie
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={uploading}
            >
              Anuluj
            </Button>
            <Button 
              type="button" 
              onClick={uploadAvatar} 
              disabled={!imageFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Przesyłanie...
                </>
              ) : (
                "Zapisz zmiany"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
