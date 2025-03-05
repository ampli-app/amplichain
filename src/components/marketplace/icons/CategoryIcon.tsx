
import { Music, Mic, Headphones, Guitar, Piano, Drum } from 'lucide-react';
import { ReactNode } from 'react';

interface CategoryIconProps {
  categoryName: string;
  className?: string;
}

export function CategoryIcon({ categoryName, className = "h-5 w-5" }: CategoryIconProps) {
  const lowerName = categoryName.toLowerCase();
  
  if (lowerName.includes('produkcj')) return <Music className={className} />;
  if (lowerName.includes('wokal')) return <Mic className={className} />;
  if (lowerName.includes('realizac')) return <Headphones className={className} />;
  if (lowerName.includes('gitar')) return <Guitar className={className} />;
  if (lowerName.includes('pianin') || lowerName.includes('keyboard')) return <Piano className={className} />;
  if (lowerName.includes('perkus') || lowerName.includes('bębn')) return <Drum className={className} />;
  
  // Domyślna ikona
  return <Music className={className} />;
}
