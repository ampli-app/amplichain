
import { GraduationCapIcon, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

interface EducationTabProps {
  userEducation: Education[];
  isOwnProfile: boolean;
}

export function EducationTab({ userEducation, isOwnProfile }: EducationTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Edukacja</h2>
        {isOwnProfile && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Dodaj edukację
          </Button>
        )}
      </div>
      
      {userEducation.length > 0 ? (
        <div className="space-y-6">
          {userEducation.map((edu) => (
            <div key={edu.id} className="border p-6 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                      <GraduationCapIcon className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium">{edu.institution}</h3>
                    <p className="text-lg text-muted-foreground">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground mt-1">{edu.year}</p>
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
          <GraduationCapIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-medium mt-4">Brak edukacji</h3>
          <p className="text-muted-foreground mt-2">
            {isOwnProfile ? "Dodaj swoją historię edukacji, aby pokazać swoje wykształcenie." : "Ten użytkownik nie dodał jeszcze żadnej historii edukacji."}
          </p>
          {isOwnProfile && (
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-1" />
              Dodaj edukację
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
