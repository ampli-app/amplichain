
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Popularne grupy</h2>
        <Link to="/groups" className="no-underline">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Zobacz wszystkie
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="relative">
        <ScrollArea className="w-full overflow-x-auto" orientation="horizontal" type="always">
          <div className="flex space-x-4 pb-6 min-w-full">
            {groups.slice(0, 10).map((group) => (
              <div key={group.id} className="w-[250px] flex-none">
                <Link 
                  to={`/groups/${group.id}`}
                  className="no-underline text-foreground"
                >
                  <Card className="h-full overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-[1.5/1] overflow-hidden relative">
                      <img 
                        src={group.image} 
                        alt={group.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <h3 className="text-white font-bold text-lg">{group.name}</h3>
                        {group.memberCount && (
                          <p className="text-white/80 text-sm">
                            {group.memberCount} {group.memberCount === 1 ? 'członek' : 
                              group.memberCount % 10 >= 2 && group.memberCount % 10 <= 4 && 
                              (group.memberCount % 100 < 10 || group.memberCount % 100 > 20) ? 
                              'członków' : 'członków'}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
