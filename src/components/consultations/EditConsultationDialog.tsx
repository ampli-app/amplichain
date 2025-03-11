
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Consultation } from '@/types/consultations';
import { Loader2 } from 'lucide-react';
import { useConsultationForm } from './useConsultationForm';
import { ConsultationBasicInfo } from './ConsultationBasicInfo';
import { ConsultationLocationOptions } from './ConsultationLocationOptions';
import { ConsultationContactMethods } from './ConsultationContactMethods';
import { ConsultationMediaUpload } from './ConsultationMediaUpload';
import { ConsultationCategories } from './ConsultationCategories';
import { ConsultationTags } from './ConsultationTags';
import { ConsultationPreview } from './ConsultationPreview';

interface EditConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation | null;
}

export function EditConsultationDialog({ open, onOpenChange, consultation }: EditConsultationDialogProps) {
  const {
    formData,
    isLoading,
    handleChange,
    handleSubmit,
    resetForm
  } = useConsultationForm(consultation, () => onOpenChange(false));
  
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj konsultację</DialogTitle>
          <DialogDescription>
            Zaktualizuj swoją ofertę konsultacji muzycznych.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <ConsultationBasicInfo 
            formData={formData} 
            onChange={handleChange} 
          />
          
          <ConsultationLocationOptions 
            formData={formData} 
            onChange={handleChange} 
          />
          
          <ConsultationContactMethods 
            formData={formData} 
            onChange={handleChange} 
          />
          
          <ConsultationMediaUpload 
            formData={formData} 
            onChange={handleChange} 
            isLoading={isLoading} 
          />
          
          <Separator />
          
          <ConsultationCategories 
            formData={formData} 
            onChange={handleChange} 
          />
          
          <ConsultationTags 
            formData={formData} 
            onChange={handleChange} 
          />
          
          <ConsultationPreview formData={formData} />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
