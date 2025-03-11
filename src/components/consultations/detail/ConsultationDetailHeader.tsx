
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsultationDetailHeaderProps {
  onBack: () => void;
}

export const ConsultationDetailHeader = ({ onBack }: ConsultationDetailHeaderProps) => {
  return (
    <Button 
      variant="ghost" 
      className="mb-4 gap-1"
      onClick={onBack}
    >
      <ArrowLeft className="h-4 w-4" />
      Wróć do Rynku
    </Button>
  );
};
