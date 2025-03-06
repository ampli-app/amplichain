
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GroupSearch } from '@/components/groups/GroupSearch';
import { GroupsGrid } from '@/components/groups/GroupsGrid';
import { GroupLoadingSkeleton } from '@/components/groups/GroupLoadingSkeleton';
import { useGroupsData } from '@/hooks/useGroupsData';
import { useAuth } from '@/contexts/AuthContext';

export default function Groups() {
  const { user } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    filteredGroups,
    loading
  } = useGroupsData();

  // Filter groups by user membership
  const userGroups = filteredGroups.filter(group => group.isMember);
  const discoverGroups = filteredGroups.filter(group => !group.isMember);
  
  // Check if there are any user groups to show the section
  const showUserGroups = userGroups.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold">Grupy</h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
                  Dołącz do społeczności tematycznych i rozwijaj swoje pasje muzyczne.
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              <GroupSearch 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
              />
            </div>
            
            {loading ? (
              <GroupLoadingSkeleton />
            ) : (
              <div className="space-y-12">
                {showUserGroups && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Twoje grupy</h2>
                    <GroupsGrid groups={userGroups} />
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-bold mb-6">Odkrywaj społeczności</h2>
                  <GroupsGrid groups={discoverGroups} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
