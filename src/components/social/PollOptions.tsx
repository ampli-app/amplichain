
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface PollOptionsProps {
  options: string[];
  onUpdateOptions: (options: string[]) => void;
  disabled?: boolean;
}

export function PollOptions({ options, onUpdateOptions, disabled = false }: PollOptionsProps) {
  const addPollOption = () => {
    if (options.length < 10) {
      onUpdateOptions([...options, '']);
    } else {
      toast({
        title: "Limit opcji",
        description: "Możesz dodać maksymalnie 10 opcji do ankiety",
      });
    }
  };
  
  const removePollOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      onUpdateOptions(newOptions);
    } else {
      toast({
        title: "Minimum opcji",
        description: "Ankieta musi mieć co najmniej 2 opcje",
      });
    }
  };
  
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdateOptions(newOptions);
  };
  
  return (
    <div className="space-y-3 mb-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
      <h3 className="font-medium">Opcje ankiety:</h3>
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={option}
            onChange={(e) => updatePollOption(index, e.target.value)}
            placeholder={`Opcja ${index + 1}`}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={disabled}
          />
          {options.length > 2 && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removePollOption(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={addPollOption}
        disabled={options.length >= 10 || disabled}
        className="w-full justify-center"
      >
        Dodaj opcję
      </Button>
    </div>
  );
}
