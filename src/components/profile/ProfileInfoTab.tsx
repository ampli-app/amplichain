
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioTab } from '@/components/profile/PortfolioTab';
import { ExperienceTab } from '@/components/profile/ExperienceTab';
import { EducationTab } from '@/components/profile/EducationTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { AddProjectModal } from './AddProjectModal';
import { AddExperienceModal } from './AddExperienceModal';
import { AddEducationModal } from './AddEducationModal';

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
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  
  return (
    <Tabs defaultValue="projects" className="mb-8">
      <TabsList className="mb-6">
        <TabsTrigger value="projects">Projekty</TabsTrigger>
        <TabsTrigger value="experience">Doświadczenie</TabsTrigger>
        <TabsTrigger value="education">Edukacja</TabsTrigger>
      </TabsList>
      
      <TabsContent value="projects">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projekty</CardTitle>
              <CardDescription>Lista projektów, w których brał udział użytkownik</CardDescription>
            </div>
            {isOwnProfile && (
              <Button variant="outline" onClick={() => setShowAddProjectModal(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Dodaj projekt
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <PortfolioTab 
              userProjects={userProjects} 
              isOwnProfile={isOwnProfile} 
            />
          </CardContent>
        </Card>
        
        {isOwnProfile && (
          <AddProjectModal 
            isOpen={showAddProjectModal} 
            onClose={() => setShowAddProjectModal(false)}
          />
        )}
      </TabsContent>
      
      <TabsContent value="experience">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Doświadczenie zawodowe</CardTitle>
              <CardDescription>Historia zatrudnienia i doświadczenie branżowe</CardDescription>
            </div>
            {isOwnProfile && (
              <Button variant="outline" onClick={() => setShowAddExperienceModal(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Dodaj doświadczenie
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ExperienceTab 
              userExperience={userExperience} 
              isOwnProfile={isOwnProfile} 
            />
          </CardContent>
        </Card>
        
        {isOwnProfile && (
          <AddExperienceModal 
            isOpen={showAddExperienceModal} 
            onClose={() => setShowAddExperienceModal(false)}
          />
        )}
      </TabsContent>
      
      <TabsContent value="education">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Edukacja</CardTitle>
              <CardDescription>Wykształcenie formalne i kursy specjalistyczne</CardDescription>
            </div>
            {isOwnProfile && (
              <Button variant="outline" onClick={() => setShowAddEducationModal(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Dodaj edukację
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <EducationTab 
              userEducation={userEducation} 
              isOwnProfile={isOwnProfile} 
            />
          </CardContent>
        </Card>
        
        {isOwnProfile && (
          <AddEducationModal 
            isOpen={showAddEducationModal} 
            onClose={() => setShowAddEducationModal(false)}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
