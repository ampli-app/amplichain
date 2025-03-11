
export interface ConsultationFormData {
  title: string;
  description: string;
  price: string;
  priceType: string;
  selectedCategories: string[];
  experienceYears: string;
  isOnline: boolean;
  isInPerson: boolean;
  location: string;
  contactMethods: string[];
  tags: string[];
  media: MediaFile[];
}

export interface MediaFile {
  file?: File;
  preview?: string;
  url?: string;
  type?: string;
}

export interface MediaUploadResult {
  publicUrl: string;
  type: string;
}
