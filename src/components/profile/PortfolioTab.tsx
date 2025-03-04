
import { FolderIcon, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
  tags: string[];
}

interface PortfolioTabProps {
  userProjects: Project[];
  isOwnProfile: boolean;
}

export function PortfolioTab({ userProjects, isOwnProfile }: PortfolioTabProps) {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Projekty i portfolio</h2>
        {isOwnProfile && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Dodaj projekt
          </Button>
        )}
      </div>
      
      {userProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              {project.image_url && (
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={project.image_url} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                {project.date && (
                  <CardDescription>{project.date}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                )}
                
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-background">
          <FolderIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-medium mt-4">Brak projektów</h3>
          <p className="text-muted-foreground mt-2">
            {isOwnProfile ? "Dodaj swoje projekty i portfolio, aby pokazać swoje umiejętności." : "Ten użytkownik nie ma jeszcze żadnych projektów w portfolio."}
          </p>
          {isOwnProfile && (
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-1" />
              Dodaj pierwszy projekt
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
