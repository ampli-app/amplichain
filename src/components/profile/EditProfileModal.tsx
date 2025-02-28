
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Check, Loader2, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChangeAvatarModal } from './ChangeAvatarModal';

interface ProfileFormData {
  full_name: string;
  username: string;
  website: string;
  bio: string;
  location: string;
  role: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
  currentProfile: any;
}

export function EditProfileModal({ isOpen, onClose, onProfileUpdated, currentProfile }: EditProfileModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    username: '',
    website: '',
    bio: '',
    location: '',
    role: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('/placeholder.svg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        full_name: currentProfile.full_name || '',
        username: currentProfile.username || '',
        website: currentProfile.website || '',
        bio: currentProfile.bio || '',
        location: currentProfile.location || '',
        role: currentProfile.role || '',
      });
      setAvatarUrl(currentProfile.avatar_url || '/placeholder.svg');
    }
  }, [currentProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Use standard update method instead of RPC
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          website: formData.website,
          bio: formData.bio,
          location: formData.location,
          role: formData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Profil zaktualizowany',
        description: 'Twoje informacje profilowe zostały pomyślnie zaktualizowane.',
      });
      
      onProfileUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Błąd aktualizacji',
        description: error.message || 'Nie udało się zaktualizować profilu. Spróbuj ponownie.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarClick = () => {
    setIsChangeAvatarOpen(true);
  };

  const handleAvatarChanged = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    // Dodajemy natychmiastową aktualizację profilu w Supabase po zmianie avatara
    if (user) {
      supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating avatar in profile:', error);
          } else {
            // Powiadamiamy rodzica o aktualizacji, aby odświeżyć widok
            onProfileUpdated();
          }
        });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edytuj profil</DialogTitle>
            <DialogDescription>
              Zaktualizuj swoje dane osobowe i zawodowe.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                  <AvatarFallback>
                    {formData.full_name ? formData.full_name.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
                <button 
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                  aria-label="Zmień zdjęcie profilowe"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Imię i nazwisko</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Twoje imię i nazwisko"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Nazwa użytkownika</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="nazwa_użytkownika"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rola zawodowa</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="np. Producent muzyczny, Autor tekstów"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Opowiedz coś o sobie"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Lokalizacja</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Miasto, Kraj"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Strona internetowa</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://twojastrona.pl"
                />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Zapisz zmiany
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <ChangeAvatarModal 
        isOpen={isChangeAvatarOpen}
        onClose={() => setIsChangeAvatarOpen(false)}
        onAvatarChanged={handleAvatarChanged}
        currentAvatarUrl={avatarUrl}
      />
    </>
  );
}
