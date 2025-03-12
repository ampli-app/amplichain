
import { Info } from 'lucide-react';

export function StolenEquipmentInfo() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-6 my-8">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Info className="h-6 w-6 text-blue-500" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Jak to działa?</h3>
          <p className="text-rhythm-600 dark:text-rhythm-400">
            Przeglądaj bazę skradzionych sprzętów. Jeśli rozpoznasz instrument lub masz jakiekolwiek informacje, skontaktuj się bezpiecznie z właścicielem przez naszą platformę.
          </p>
        </div>
      </div>
    </div>
  );
}
