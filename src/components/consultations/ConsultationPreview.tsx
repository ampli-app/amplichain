
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { ConsultationFormData } from './types';

interface ConsultationPreviewProps {
  formData: ConsultationFormData;
}

export function ConsultationPreview({ formData }: ConsultationPreviewProps) {
  const { title, description, price, priceType, selectedCategories, contactMethods } = formData;
  
  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Podgląd oferty</h3>
      <Card className="p-4">
        <div className="mb-2">
          <h4 className="font-bold">{title || "Tytuł konsultacji"}</h4>
          <p className="text-sm text-muted-foreground">
            {description || "Opis konsultacji pojawi się tutaj..."}
          </p>
        </div>
        
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 my-2">
            {selectedCategories.map((cat, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center text-sm mt-2">
          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="font-medium">
            {price ? `${price} PLN` : "Cena"} {price ? priceType : ""}
          </span>
        </div>
        
        {contactMethods.length > 0 && (
          <div className="text-sm mt-2">
            <span className="font-medium">Metody kontaktu: </span>
            {contactMethods.join(', ')}
          </div>
        )}
      </Card>
    </div>
  );
}
