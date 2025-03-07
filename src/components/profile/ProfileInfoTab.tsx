
import { Experience } from '@/components/profile/ExperienceTab';
import { Education } from '@/components/profile/EducationTab';
import { Badge } from '@/components/ui/badge';
import { 
  BriefcaseIcon, 
  GraduationCap, 
  Award, 
  Calendar, 
  MapPin,
  Music
} from 'lucide-react';

interface ProfileInfoTabProps {
  userExperience: any[];
  userEducation: any[];
  userProjects: any[];
  isOwnProfile: boolean;
}

export function ProfileInfoTab({ 
  userExperience,
  userEducation,
  userProjects,
  isOwnProfile 
}: ProfileInfoTabProps) {
  
  // Lista umiejętności (przykładowe)
  const skills = [
    'Produkcja muzyczna',
    'Mixing',
    'Mastering',
    'Vocal processing',
    'Kompozycja',
    'Sound design',
    'Ableton Live',
    'Logic Pro',
    'FL Studio',
    'Pro Tools'
  ];
  
  return (
    <div className="space-y-8">
      {/* Sekcja doświadczenia */}
      <section>
        <div className="flex items-center mb-4">
          <BriefcaseIcon className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-xl font-semibold">Doświadczenie zawodowe</h2>
        </div>
        
        <div className="space-y-4">
          {userExperience && userExperience.length > 0 ? (
            userExperience.map(exp => (
              <div key={exp.id} className="bg-card rounded-lg p-4 border">
                <h3 className="font-medium">{exp.position}</h3>
                <p className="text-muted-foreground">{exp.company}</p>
                <p className="text-sm text-muted-foreground mt-1">{exp.period}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Brak informacji o doświadczeniu zawodowym.</p>
          )}
        </div>
      </section>
      
      {/* Sekcja edukacji */}
      <section>
        <div className="flex items-center mb-4">
          <GraduationCap className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-xl font-semibold">Edukacja</h2>
        </div>
        
        <div className="space-y-4">
          {userEducation && userEducation.length > 0 ? (
            userEducation.map(edu => (
              <div key={edu.id} className="bg-card rounded-lg p-4 border">
                <h3 className="font-medium">{edu.degree}</h3>
                <p className="text-muted-foreground">{edu.institution}</p>
                <p className="text-sm text-muted-foreground mt-1">{edu.year}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Brak informacji o edukacji.</p>
          )}
        </div>
      </section>
      
      {/* Sekcja projektów */}
      <section>
        <div className="flex items-center mb-4">
          <Music className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-xl font-semibold">Projekty</h2>
        </div>
        
        <div className="space-y-4">
          {userProjects && userProjects.length > 0 ? (
            userProjects.map(project => (
              <div key={project.id} className="bg-card rounded-lg p-4 border">
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-muted-foreground mt-1">{project.description}</p>
                {project.date && (
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{project.date}</span>
                  </div>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Brak informacji o projektach.</p>
          )}
        </div>
      </section>
      
      {/* Sekcja umiejętności */}
      <section>
        <div className="flex items-center mb-4">
          <Award className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-xl font-semibold">Umiejętności</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="px-3 py-1">
              {skill}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
