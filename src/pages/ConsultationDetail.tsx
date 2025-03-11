
import { useParams } from 'react-router-dom';
import { ConsultationDetailHeader } from '@/components/consultations/detail/ConsultationDetailHeader';
import { ConsultationOwnerInfo } from '@/components/consultations/detail/ConsultationOwnerInfo';
import { ConsultationPrice } from '@/components/consultations/detail/ConsultationPrice';
import { ConsultationActions } from '@/components/consultations/detail/ConsultationActions';
import { ConsultationFeatures } from '@/components/consultations/detail/ConsultationFeatures';
import { ConsultationDescription } from '@/components/consultations/detail/ConsultationDescription';
import { ConsultationBuyDialog } from '@/components/consultations/detail/ConsultationBuyDialog';
import { ConsultationCategories } from '@/components/consultations/detail/ConsultationCategories';
import { ConsultationLoading } from '@/components/consultations/detail/ConsultationLoading';
import { ConsultationNotFound } from '@/components/consultations/detail/ConsultationNotFound';
import { useConsultationDetail } from '@/components/consultations/detail/useConsultationDetail';
import { ProductImage } from '@/components/marketplace/ProductImage';
import { Music } from 'lucide-react';

export function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    consultation,
    owner,
    isOwner,
    loading,
    isFavorite,
    buyDialogOpen,
    setBuyDialogOpen,
    toggleFavorite,
    handleEditConsultation,
    handleShareConsultation,
    handleBuyConsultation,
    getContactMethodIcon,
    getContactMethodLabel,
    navigate
  } = useConsultationDetail(id);

  if (loading) {
    return <ConsultationLoading />;
  }

  if (!consultation) {
    return <ConsultationNotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ConsultationDetailHeader onBack={() => navigate('/marketplace?tab=consultations')} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg overflow-hidden">
            {consultation.images && consultation.images.length > 0 ? (
              <ProductImage 
                image={consultation.images} 
                title={consultation.title} 
              />
            ) : (
              <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
                <Music className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex flex-col space-y-4">
            <ConsultationCategories 
              categories={consultation.categories || []} 
              isOwner={isOwner} 
            />
            
            <h1 className="text-3xl font-bold">{consultation.title}</h1>
            
            <ConsultationOwnerInfo 
              owner={owner} 
              experience={consultation.experience} 
            />
            
            <ConsultationPrice price={consultation.price} />
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              <ConsultationActions 
                isOwner={isOwner}
                isFavorite={isFavorite}
                onEdit={handleEditConsultation}
                onShare={handleShareConsultation}
                onToggleFavorite={toggleFavorite}
                onBuy={() => setBuyDialogOpen(true)}
              />
            </div>
            
            <ConsultationFeatures 
              isOnline={consultation.is_online}
              location={consultation.location}
              experience={consultation.experience}
              contactMethods={consultation.contact_methods}
              getContactMethodIcon={getContactMethodIcon}
              getContactMethodLabel={getContactMethodLabel}
            />
          </div>
        </div>
      </div>
      
      <ConsultationDescription description={consultation.description} />
      
      <ConsultationBuyDialog 
        open={buyDialogOpen}
        onOpenChange={setBuyDialogOpen}
        title={consultation.title}
        ownerName={owner?.full_name}
        price={consultation.price}
        onBuy={handleBuyConsultation}
      />
    </div>
  );
}

export default ConsultationDetail;
