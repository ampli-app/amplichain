
import { Calendar, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

interface TestModeInfoProps {
  isTestMode: boolean;
  id: string;
}

export const TestModeInfo = ({ isTestMode, id }: TestModeInfoProps) => {
  const navigate = useNavigate();
  
  if (!isTestMode) return null;
  
  return (
    <Card className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Co dalej z Twoim testem?
        </h2>
        
        <div className="space-y-4 text-blue-800 dark:text-blue-300">
          <p>
            Otrzymasz produkt na 7-dniowy okres testowy. W tym czasie możesz go przetestować i zdecydować:
          </p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>Jeśli zdecydujesz się zatrzymać produkt, możesz dokonać pełnej płatności w dowolnym momencie.</li>
            <li>Jeśli chcesz zwrócić produkt, musisz to zrobić przed upływem 7 dni.</li>
            <li>Na 2 dni przed końcem testu otrzymasz przypomnienie.</li>
          </ul>
          
          <div className="flex gap-4 flex-col sm:flex-row mt-6">
            <Button className="gap-2" variant="outline" onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-4 w-4" />
              Moje zamówienia
            </Button>
            <Button className="gap-2" onClick={() => navigate(`/marketplace/${id}`)}>
              <ShoppingCart className="h-4 w-4" />
              Kup teraz
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
