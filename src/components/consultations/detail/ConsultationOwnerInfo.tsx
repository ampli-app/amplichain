
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileInfo {
  id?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface ConsultationOwnerInfoProps {
  owner: ProfileInfo | null;
  experience?: string;
}

export const ConsultationOwnerInfo = ({ owner, experience }: ConsultationOwnerInfoProps) => {
  return (
    <div className="flex items-center">
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={owner?.avatar_url || ''} alt={owner?.full_name} />
        <AvatarFallback>{owner?.full_name?.substring(0, 2) || 'XX'}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">Sprzedawca: {owner?.full_name || 'Nieznany ekspert'}</div>
        <div className="text-sm text-muted-foreground">
          {experience ? `${experience} lat doświadczenia` : 'Ekspert'}
        </div>
      </div>
    </div>
  );
};
