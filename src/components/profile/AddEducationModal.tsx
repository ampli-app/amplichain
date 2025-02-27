
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface EducationFormData {
  institution: string;
  degree: string;
  year: string;
}

interface AddEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEducationAdded: () => void;
}

export function AddEducationModal({ isOpen, onClose, onEducationAdded }: AddEducationModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EducationFormData>({
    institution: '',
    degree: '',
    year: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Use raw query for now since the TypeScript types don't know about our new tables
      const { error } = await supabase.rpc('insert_education', {
        p_profile_id: user.id,
        p_institution: formData.institution,
        p_degree: formData.degree,
        p_year: formData.year
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Education added',
        description: 'Your education information has been added successfully.',
      });
      
      // Reset form
      setFormData({
        institution: '',
        degree: '',
        year: '',
      });
      
      onEducationAdded();
      onClose();
    } catch (error: any) {
      console.error('Error adding education:', error);
      toast({
        title: 'Failed to add education',
        description: error.message || 'Failed to add education information. Please try again.',
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
          <DialogTitle>Add Education</DialogTitle>
          <DialogDescription>
            Add information about your educational background.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="e.g., Berklee College of Music"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="degree">Degree / Program</Label>
              <Input
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g., Bachelor of Music in Music Production"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g., 2020"
                required
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
                  Adding...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Add Education
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
