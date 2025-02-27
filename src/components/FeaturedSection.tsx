
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeaturedSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: 'default' | 'alternate';
}

export function FeaturedSection({
  title,
  description,
  children,
  className,
  id,
  variant = 'default',
}: FeaturedSectionProps) {
  return (
    <section 
      id={id}
      className={cn(
        'py-16 md:py-24',
        variant === 'alternate' && 'bg-rhythm-50 dark:bg-rhythm-950/50',
        className
      )}
    >
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h2>
          <p className="text-rhythm-600 text-lg">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
