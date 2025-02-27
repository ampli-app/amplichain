
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ExperienceFormData {
  position: string;
  company: string;
  period: string;
}

interface AddExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExperienceAdded: () => void;
}

export function AddExperienceModal({ isOpen, onClose, onExperienceAdded }: AddExperienceModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ExperienceFormData>({
    position: '',
    company: '',
    period: '',
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
      const { error } = await supabase
        .from('experience')
        .insert({
          profile_id: user.id,
          position: formData.position,
          company: formData.company,
          period: formData.period
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Experience added',
        description: 'Your work experience has been added successfully.',
      });
      
      // Reset form
      setFormData({
        position: '',
        company: '',
        period: '',
      });
      
      onExperienceAdded();
      onClose();
    } catch (error: any) {
      console.error('Error adding experience:', error);
      toast({
        title: 'Failed to add experience',
        description: error.message || 'Failed to add work experience. Please try again.',
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
          <DialogTitle>Add Work Experience</DialogTitle>
          <DialogDescription>
            Add information about your professional experience.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g., Lead Producer"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company / Studio</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., Echo Studios"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="period">Time Period</Label>
              <Input
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                placeholder="e.g., 2018 - Present"
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
                  Add Experience
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
