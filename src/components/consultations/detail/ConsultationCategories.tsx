
import { Badge } from "@/components/ui/badge";

interface ConsultationCategoriesProps {
  categories: string[];
  isOwner: boolean;
}

export const ConsultationCategories = ({ categories, isOwner }: ConsultationCategoriesProps) => {
  return (
    <div className="flex gap-2 items-center">
      {categories && categories.map((category, index) => (
        <Badge key={index} variant="outline" className="bg-gray-100">
          {category}
        </Badge>
      ))}
      
      {isOwner && (
        <Badge className="ml-auto bg-green-500 hover:bg-green-500">
          Twój produkt
        </Badge>
      )}
    </div>
  );
};
