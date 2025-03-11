
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConsultationFormContainerProps {
  title: string;
  description: string;
  children: ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isEdit: boolean;
}

export function ConsultationFormContainer({
  title,
  description,
  children,
  onCancel,
  onSubmit,
  isLoading,
  isEdit
}: ConsultationFormContainerProps) {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Anuluj
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Zapisz zmiany' : 'Dodaj konsultację'}
        </Button>
      </CardFooter>
    </Card>
  );
}
