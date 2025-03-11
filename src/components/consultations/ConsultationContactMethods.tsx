
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ConsultationFormData } from './types';

interface ConsultationContactMethodsProps {
  formData: ConsultationFormData;
  onChange: (field: keyof ConsultationFormData, value: any) => void;
}

export function ConsultationContactMethods({ formData, onChange }: ConsultationContactMethodsProps) {
  const { contactMethods } = formData;
  
  const toggleContactMethod = (method: string) => {
    const updated = contactMethods.includes(method)
      ? contactMethods.filter(m => m !== method)
      : [...contactMethods, method];
    
    onChange('contactMethods', updated);
  };
  
  return (
    <div className="grid gap-3">
      <Label>Metody kontaktu</Label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="contact-video"
            checked={contactMethods.includes('video')}
            onCheckedChange={() => toggleContactMethod('video')}
          />
          <Label htmlFor="contact-video" className="font-normal cursor-pointer">
            Rozmowa wideo (Zoom, Google Meet, itp.)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="contact-phone"
            checked={contactMethods.includes('phone')}
            onCheckedChange={() => toggleContactMethod('phone')}
          />
          <Label htmlFor="contact-phone" className="font-normal cursor-pointer">
            Rozmowa telefoniczna
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="contact-chat"
            checked={contactMethods.includes('chat')}
            onCheckedChange={() => toggleContactMethod('chat')}
          />
          <Label htmlFor="contact-chat" className="font-normal cursor-pointer">
            Czat tekstowy
          </Label>
        </div>
      </div>
    </div>
  );
}
