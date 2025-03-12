
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';

interface StolenEquipmentHeaderProps {
  onReportClick: () => void;
}

export function StolenEquipmentHeader({ onReportClick }: StolenEquipmentHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border mb-8">
      <div className="px-8 py-10">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-gray-800 dark:text-gray-100">Baza </span>
          <span className="text-primary">skradzionych sprzętów </span>
          <span className="text-gray-800 dark:text-gray-100">muzycznych</span>
        </h1>
        
        <p className="text-rhythm-600 dark:text-rhythm-400 text-lg mb-8 max-w-3xl">
          Nasza społeczność łączy siły, aby pomóc odzyskać skradzione
          instrumenty i sprzęt muzyczny. Wspólnie możemy zwalczać kradzieże
          w branży muzycznej i chronić cenne instrumenty.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            className="gap-2"
            onClick={onReportClick}
          >
            <Plus className="h-4 w-4" />
            Zgłoś kradzież
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Sprawdź bazę
          </Button>
        </div>
      </div>
    </div>
  );
}
