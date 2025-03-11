
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Video, MapPin, Clock, User } from 'lucide-react';

interface ConsultationFeaturesProps {
  isOnline: boolean;
  location?: string;
  experience?: string;
  contactMethods?: string[];
  getContactMethodIcon: (method: string) => JSX.Element | null;
  getContactMethodLabel: (method: string) => string;
}

export const ConsultationFeatures = ({
  isOnline,
  location,
  experience,
  contactMethods,
  getContactMethodIcon,
  getContactMethodLabel
}: ConsultationFeaturesProps) => {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
          {isOnline && (
            <div className="flex items-start gap-2">
              <Video className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Online</div>
                <div className="text-sm text-muted-foreground">Konsultacja zdalna</div>
              </div>
            </div>
          )}
          
          {location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Stacjonarnie</div>
                <div className="text-sm text-muted-foreground">{location}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium">Czas trwania</div>
              <div className="text-sm text-muted-foreground">60 minut</div>
            </div>
          </div>
          
          {experience && (
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Doświadczenie</div>
                <div className="text-sm text-muted-foreground">{experience} lat</div>
              </div>
            </div>
          )}
        </div>
        
        {contactMethods && contactMethods.length > 0 && (
          <>
            <Separator className="my-4" />
            <h3 className="font-medium mb-2">Dostępne metody kontaktu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-2">
                  {getContactMethodIcon(method)}
                  <span>{getContactMethodLabel(method)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
