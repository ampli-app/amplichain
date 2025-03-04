
import { BriefcaseIcon, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
}

interface ExperienceTabProps {
  userExperience: Experience[];
  isOwnProfile: boolean;
}

export function ExperienceTab({ userExperience, isOwnProfile }: ExperienceTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Doświadczenie zawodowe</h2>
        {isOwnProfile && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Dodaj doświadczenie
          </Button>
        )}
      </div>
      
      {userExperience.length > 0 ? (
        <div className="space-y-6">
          {userExperience.map((exp) => (
            <div key={exp.id} className="border p-6 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                      <BriefcaseIcon className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium">{exp.position}</h3>
                    <p className="text-lg text-muted-foreground">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mt-1">{exp.period}</p>
                  </div>
                </div>
                
                {isOwnProfile && (
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-background">
          <BriefcaseIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-medium mt-4">Brak doświadczenia</h3>
          <p className="text-muted-foreground mt-2">
            {isOwnProfile ? "Dodaj swoje doświadczenie zawodowe, aby pokazać swoją historię pracy." : "Ten użytkownik nie dodał jeszcze żadnego doświadczenia zawodowego."}
          </p>
          {isOwnProfile && (
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-1" />
              Dodaj doświadczenie
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
