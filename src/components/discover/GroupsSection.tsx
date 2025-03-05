
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Popularne grupy</h3>
        <Link to="/groups" className="no-underline">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Zobacz wszystkie
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
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
