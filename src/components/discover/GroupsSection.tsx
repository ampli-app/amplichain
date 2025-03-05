
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="mb-10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Popularne grupy</h3>
        <Link to="/groups" className="no-underline">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Zobacz wszystkie
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.slice(0, 6).map((group) => (
          <Link 
            key={group.id} 
            to={`/groups/${group.id}`}
            className="no-underline"
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
              <CardContent className="p-0 flex flex-col h-full">
                <div 
                  className="w-full h-28 bg-gray-200"
                  style={{
                    backgroundImage: `url(${group.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1">{group.name}</h4>
                  {group.memberCount && (
                    <Badge variant="secondary" className="text-xs">
                      {group.memberCount} członków
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
