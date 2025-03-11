
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactMethodsSectionProps {
  contactMethods: string[];
  toggleContactMethod: (method: string) => void;
}

export function ContactMethodsSection({
  contactMethods,
  toggleContactMethod,
}: ContactMethodsSectionProps) {
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
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="contact-live"
            checked={contactMethods.includes('live')}
            onCheckedChange={() => toggleContactMethod('live')}
          />
          <Label htmlFor="contact-live" className="font-normal cursor-pointer">
            Na żywo
          </Label>
        </div>
      </div>
    </div>
  );
}
