
import { Badge } from '@/components/ui/badge';

interface CategoryBadgeProps {
  categorySlug: string;
  variant?: "default" | "secondary" | "outline" | "destructive";
}

// Mapowanie slugów kategorii na czytelne nazwy
const categoryNames: Record<string, string> = {
  'composition': 'Kompozycja',
  'arrangement': 'Aranżacja',
  'production': 'Produkcja muzyczna',
  'mixing': 'Mix i mastering',
  'theory': 'Teoria muzyki',
  'recording': 'Nagrywanie',
  'vocals': 'Wokal',
  'recording-studio': 'Studio nagrań',
  'mixing-mastering': 'Mix i mastering',
  'music-production': 'Produkcja muzyczna',
  'music-lessons': 'Lekcje muzyki',
  'songwriting': 'Kompozycja'
};

export function CategoryBadge({ categorySlug, variant = "outline" }: CategoryBadgeProps) {
  // Mapujemy slug na czytelną nazwę, jeśli istnieje, w przeciwnym razie używamy slugu
  const displayName = categoryNames[categorySlug] || categorySlug;
  
  return (
    <Badge variant={variant}>{displayName}</Badge>
  );
}
