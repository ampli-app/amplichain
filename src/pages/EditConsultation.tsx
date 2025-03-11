
import { useParams, useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BasicInfoSection } from '@/components/consultations/BasicInfoSection';
import { AvailabilitySection } from '@/components/consultations/AvailabilitySection';
import { ContactMethodsSection } from '@/components/consultations/ContactMethodsSection';
import { MediaUploadSection } from '@/components/consultations/MediaUploadSection';
import { ConsultationFormContainer } from '@/components/consultations/ConsultationFormContainer';
import { ConsultationFormLoader } from '@/components/consultations/ConsultationFormLoader';
import { useConsultationData } from '@/hooks/useConsultationData';
import { useConsultationSubmit } from '@/hooks/useConsultationSubmit';

export default function EditConsultation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { form, isFetching } = useConsultationData(id);
  const { isLoading, handleSubmit } = useConsultationSubmit(id);
  
  if (isFetching) {
    return <ConsultationFormLoader />;
  }
  
  const toggleContactMethod = (method: string) => {
    form.setContactMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <ConsultationFormContainer
            title={id ? 'Edytuj konsultację' : 'Dodaj nową konsultację'}
            description={id 
              ? 'Zaktualizuj informacje o swojej ofercie konsultacji muzycznych'
              : 'Zaoferuj swoje konsultacje muzyczne i podziel się swoją wiedzą z innymi'}
            onCancel={() => navigate('/profile?tab=marketplace&marketplaceTab=consultations')}
            onSubmit={() => handleSubmit(form)}
            isLoading={isLoading}
            isEdit={!!id}
          >
            <BasicInfoSection
              title={form.title}
              setTitle={form.setTitle}
              description={form.description}
              setDescription={form.setDescription}
              price={form.price}
              setPrice={form.setPrice}
              categoryId={form.categoryId}
              setCategoryId={form.setCategoryId}
              subcategoryId={form.subcategoryId}
              setSubcategoryId={form.setSubcategoryId}
            />
            
            <Separator />
            
            <MediaUploadSection
              media={form.media}
              setMedia={form.setMedia}
              disabled={isLoading}
            />
            
            <Separator />
            
            <AvailabilitySection
              isOnline={form.isOnline}
              setIsOnline={form.setIsOnline}
              isInPerson={form.isInPerson}
              setIsInPerson={form.setIsInPerson}
              location={form.location}
              setLocation={form.setLocation}
            />
            
            <Separator />
            
            <ContactMethodsSection
              contactMethods={form.contactMethods}
              toggleContactMethod={toggleContactMethod}
            />
          </ConsultationFormContainer>
        </div>
      </main>
      <Footer />
    </div>
  );
}
