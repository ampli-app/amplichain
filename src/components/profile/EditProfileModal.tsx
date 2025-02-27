
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
    full_name: currentProfile?.name || '',
    username: currentProfile?.username || '',
    website: currentProfile?.website || '',
    bio: currentProfile?.bio || '',
    location: currentProfile?.location || '',
    role: currentProfile?.role || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        full_name: currentProfile.name || '',
        username: currentProfile.username || '',
        website: currentProfile.website || '',
        bio: currentProfile.bio || '',
        location: currentProfile.location || '',
        role: currentProfile.role || '',
      });
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
      // Since we can't update the types file, we'll use a REST call with custom fields
      const { error } = await supabase.rpc('update_profile', {
        p_full_name: formData.full_name,
        p_username: formData.username,
        p_website: formData.website,
        p_bio: formData.bio,
        p_location: formData.location,
        p_role: formData.role,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
      
      onProfileUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and professional details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Professional Role</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Music Producer, Songwriter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
