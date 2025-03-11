
import { Badge } from "@/components/ui/badge";

interface ConsultationCategoriesProps {
  categories: string[];
  isOwner: boolean;
}

export const ConsultationCategories = ({ categories, isOwner }: ConsultationCategoriesProps) => {
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
      {categories && categories.map((category, index) => (
        <Badge key={index} variant="secondary" className="bg-white text-black">
          {category}
        </Badge>
      ))}
      
      {isOwner && (
        <Badge className="bg-green-500 hover:bg-green-500">
          Twój produkt
        </Badge>
      )}
    </div>
  );
};
