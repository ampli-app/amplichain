
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  ArrowRight, 
  CheckCircle,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Group } from '@/types/group';

interface GroupCardProps {
  group: Group;
  delay?: number;
}

export function GroupCard({ group, delay = 0 }: GroupCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl ${
        group.popular ? 'border-2 border-primary/50' : 'border border-rhythm-200'
      }`}
    >
      {group.popular && (
        <Badge className="absolute top-4 right-4 z-10 bg-primary">
          Popularne
        </Badge>
      )}
      
      <div className="aspect-[16/9] overflow-hidden">
        <img 
          src={group.image} 
          alt={group.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-rhythm-500">
            <Users className="h-4 w-4" />
            <span>{group.members.toLocaleString()} członków</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="font-medium">{group.rating}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{group.title}</h3>
        <p className="text-rhythm-600 mb-4">{group.description}</p>
        
        <div className="space-y-2 mb-6">
          {group.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <Button className="w-full group" asChild>
          <Link to={`/groups/${group.id}`}>
            Dołącz do społeczności
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
