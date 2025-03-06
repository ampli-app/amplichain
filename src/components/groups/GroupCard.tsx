import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  ArrowRight,
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
  // Check if this group has more than 3 members to mark it as popular
  const isPopular = group.memberCount > 3;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl ${
        isPopular ? 'border-2 border-primary/50' : 'border border-rhythm-200'
      }`}
    >
      {isPopular && (
        <Badge className="absolute top-4 right-4 z-10 bg-primary">
          Popularne
        </Badge>
      )}
      
      <div className="aspect-[16/9] overflow-hidden">
        <img 
          src={group.coverImage} 
          alt={group.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-rhythm-500">
            <Users className="h-4 w-4" />
            <span>{group.memberCount.toLocaleString()} członków</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="font-medium">4.7</span> {/* Default rating */}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
        <p className="text-rhythm-600 mb-4">{group.description}</p>
        
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
