
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface Group {
  id: string;
  name: string;
  image: string;
  memberCount?: number;
}

interface GroupsSectionProps {
  groups: Group[];
}

export function GroupsSection({ groups }: GroupsSectionProps) {
  return (
    <div className="mb-12">
      <h3 className="text-lg font-medium mb-3">Popularne grupy</h3>
      <div className="grid grid-cols-3 gap-4">
        {groups.slice(0, 6).map((group) => (
          <Link 
            key={group.id} 
            to={`/groups/${group.id}`}
            className="no-underline"
          >
            <Card className="h-32 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0 h-full">
                <div 
                  className="w-full h-full bg-gray-200"
                  style={{
                    backgroundImage: `url(${group.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
