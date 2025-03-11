
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const ConsultationNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Konsultacja nie znaleziona</h1>
      <p className="text-muted-foreground mb-6">
        Konsultacja, której szukasz, nie istnieje lub została usunięta.
      </p>
      <Button onClick={() => navigate('/marketplace?tab=consultations')}>
        Wróć do listy konsultacji
      </Button>
    </div>
  );
};
