
import { GroupCard } from './GroupCard';
import { Users } from 'lucide-react';
import { Group } from '@/types/group';

interface GroupsGridProps {
  groups: Group[];
}

export function GroupsGrid({ groups }: GroupsGridProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium mb-2">Brak pasujących grup</h3>
        <p className="text-gray-500 mb-6">Spróbuj zmienić kryteria wyszukiwania</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group, i) => (
        <GroupCard 
          key={group.id} 
          group={group} 
          delay={i * 0.1}
        />
      ))}
    </div>
  );
}
