
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ProfileData } from '@/types/profile';
import { Product, Service, Consultation } from '@/types/messages';

export interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
  tags: string[];
}

export function useProfileData(profileId: string | undefined, isOwnProfile: boolean) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [userConsultations, setUserConsultations] = useState<Consultation[]>([]);
  const [userEducation, setUserEducation] = useState<Education[]>([]);
  const [userExperience, setUserExperience] = useState<Experience[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      fetchProfileData(profileId);
    } else {
      setIsLoading(false);
    }
  }, [profileId]);

  const fetchProfileData = async (id: string) => {
    console.log("Fetching profile data for:", id);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych profilu.",
          variant: "destructive",
        });
      } else if (data) {
        console.log("Profile data fetched successfully:", data);
        setProfileData(data);
      }

      if (isOwnProfile) {
        fetchUserProducts(id);
        fetchUserServices(id);
        fetchUserConsultations(id);
      }
      
      fetchEducation(id);
      fetchExperience(id);
      fetchProjects(id);
      
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProducts = async (userId: string) => {
    console.log("Fetching products for user:", userId);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user products:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać produktów użytkownika.",
        variant: "destructive",
      });
    } else {
      console.log("User products fetched:", data?.length || 0, data);
      setUserProducts(data || []);
    }
  };
  
  const fetchUserServices = async (userId: string) => {
    console.log("Fetching services for user:", userId);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user services:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać usług użytkownika.",
        variant: "destructive",
      });
    } else {
      console.log("User services fetched:", data?.length || 0, data);
      setUserServices(data || []);
    }
  };
  
  const fetchUserConsultations = async (userId: string) => {
    console.log("Fetching consultations for user:", userId);
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user consultations:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać konsultacji użytkownika.",
        variant: "destructive",
      });
    } else {
      console.log("User consultations fetched:", data?.length || 0, data);
      setUserConsultations(data || []);
    }
  };
  
  const fetchEducation = async (profileId: string) => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('profile_id', profileId);
      
    if (error) {
      console.error('Error fetching education:', error);
    } else {
      console.log("Education records fetched:", data?.length || 0);
      setUserEducation(data || []);
    }
  };
  
  const fetchExperience = async (profileId: string) => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('profile_id', profileId);
      
    if (error) {
      console.error('Error fetching experience:', error);
    } else {
      console.log("Experience records fetched:", data?.length || 0);
      setUserExperience(data || []);
    }
  };
  
  const fetchProjects = async (profileId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', profileId);
      
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      console.log("Projects fetched:", data?.length || 0);
      setUserProjects(data || []);
    }
  };

  return {
    profileData,
    userProducts,
    userServices,
    userConsultations,
    userEducation,
    userExperience,
    userProjects,
    isLoading,
    fetchProfileData,
    fetchUserProducts,
    fetchUserServices,
    fetchUserConsultations
  };
}
