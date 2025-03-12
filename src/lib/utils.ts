
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return '0,00 zł';
  
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amount);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    rok: 31536000,
    miesiąc: 2592000,
    tydzień: 604800,
    dzień: 86400,
    godzina: 3600,
    minuta: 60
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    
    if (interval >= 1) {
      if (unit === 'rok') {
        return interval === 1 ? '1 rok temu' : `${interval} lat${interval < 5 ? 'a' : ''} temu`;
      }
      if (unit === 'miesiąc') {
        return interval === 1 ? '1 miesiąc temu' : `${interval} miesiąc${interval < 5 ? 'e' : 'y'} temu`;
      }
      if (unit === 'tydzień') {
        return interval === 1 ? '1 tydzień temu' : `${interval} tygodni${interval < 5 ? 'e' : ''} temu`;
      }
      if (unit === 'dzień') {
        return interval === 1 ? '1 dzień temu' : `${interval} dni temu`;
      }
      if (unit === 'godzina') {
        return interval === 1 ? '1 godzinę temu' : `${interval} godzin${interval < 5 ? 'y' : ''} temu`;
      }
      if (unit === 'minuta') {
        return interval === 1 ? '1 minutę temu' : `${interval} minut${interval < 5 ? 'y' : ''} temu`;
      }
    }
  }
  
  return 'przed chwilą';
}
