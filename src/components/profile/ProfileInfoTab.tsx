
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddProjectModal } from '@/components/profile/AddProjectModal';
import { AddExperienceModal } from '@/components/profile/AddExperienceModal';
import { AddEducationModal } from '@/components/profile/AddEducationModal';
import { PortfolioTab } from '@/components/profile/PortfolioTab';
import { ExperienceTab } from '@/components/profile/ExperienceTab';
import { EducationTab } from '@/components/profile/EducationTab';

interface ProfileInfoTabProps {
  userProjects: any[];
  userExperience: any[];
  userEducation: any[];
  isOwnProfile: boolean;
}

export function ProfileInfoTab({ 
  userProjects,
  userExperience,
  userEducation,
  isOwnProfile
}: ProfileInfoTabProps) {
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddEducation, setShowAddEducation] = useState(false);
  
  const handleProjectAdded = () => {
    // Dodano nowy projekt - można tutaj odświeżyć dane
  };
  
  const handleExperienceAdded = () => {
    // Dodano nowe doświadczenie - można tutaj odświeżyć dane
  };
  
  const handleEducationAdded = () => {
    // Dodano nową edukację - można tutaj odświeżyć dane
  };

  return (
    <div className="space-y-8">
      {/* Sekcja Projektów */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Portfolio</h3>
          {isOwnProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddProject(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj projekt
            </Button>
          )}
        </div>
        
        <PortfolioTab 
          userProjects={userProjects}
          isOwnProfile={isOwnProfile}
        />
      </div>

      <AddProjectModal 
        isOpen={showAddProject} 
        onClose={() => setShowAddProject(false)}
        onProjectAdded={handleProjectAdded}
      />
      
      {/* Sekcja Doświadczenia */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Doświadczenie</h3>
          {isOwnProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddExperience(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj doświadczenie
            </Button>
          )}
        </div>
        
        <ExperienceTab 
          userExperience={userExperience}
          isOwnProfile={isOwnProfile}
        />
      </div>

      <AddExperienceModal 
        isOpen={showAddExperience} 
        onClose={() => setShowAddExperience(false)}
        onExperienceAdded={handleExperienceAdded}
      />
      
      {/* Sekcja Edukacji */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edukacja</h3>
          {isOwnProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddEducation(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj edukację
            </Button>
          )}
        </div>
        
        <EducationTab 
          userEducation={userEducation}
          isOwnProfile={isOwnProfile}
        />
      </div>

      <AddEducationModal 
        isOpen={showAddEducation} 
        onClose={() => setShowAddEducation(false)}
        onEducationAdded={handleEducationAdded}
      />
    </div>
  );
}
