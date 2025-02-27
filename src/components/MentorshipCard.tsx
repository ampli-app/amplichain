
import { Users, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface MentorshipCardProps {
  title: string;
  description: string;
  image: string;
  members: number;
  rating: number;
  features: string[];
  popular?: boolean;
  delay?: number;
}

export function MentorshipCard({
  title,
  description,
  image,
  members,
  rating,
  features,
  popular = false,
  delay = 0
}: MentorshipCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl ${
        popular ? 'border-2 border-primary/50' : 'border border-rhythm-200'
      }`}
    >
      {popular && (
        <Badge className="absolute top-4 right-4 z-10 bg-primary">
          Popularne
        </Badge>
      )}
      
      <div className="aspect-[16/9] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-rhythm-500">
            <Users className="h-4 w-4" />
            <span>{members.toLocaleString()} członków</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-rhythm-600 mb-4">{description}</p>
        
        <div className="space-y-2 mb-6">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <Button className="w-full group">
          Dołącz do społeczności
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
}
