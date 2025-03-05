
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  backgroundImage?: string;
  onClick: () => void;
  buttonText: string;
}

export function FeatureCard({ 
  title, 
  description, 
  backgroundImage,
  onClick,
  buttonText
}: FeatureCardProps) {
  return (
    <div 
      className="w-full h-64 rounded-xl overflow-hidden relative mb-8 group"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(to right, #4f46e5, #7c3aed)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-white/80 mb-4 max-w-xl">{description}</p>
        <Button 
          onClick={onClick}
          className="w-fit bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20"
        >
          {buttonText}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
