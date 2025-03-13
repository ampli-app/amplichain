
export interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | string[];
  category: string | null;
  category_id: string | null;
  rating: number | null;
  review_count: number | null;
  sale?: boolean | null;
  sale_percentage?: number | null;
  for_testing?: boolean | null;
  testing_price?: number | null;
  created_at?: string;
  user_id?: string;
  condition?: string;
  status?: 'available' | 'reserved' | 'sold' | string;
  description?: string;
  location?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string; // Changed from optional to required
}

export const productConditions = [
  "Nowy",
  "Jak nowy",
  "Bardzo dobry",
  "Dobry",
  "Zadowalający"
];

export const conditionMap: Record<string, string> = {
  "Nowy": "new",
  "Jak nowy": "like_new",
  "Bardzo dobry": "very_good",
  "Dobry": "good",
  "Zadowalający": "fair"
};

export const conditionDisplayMap: Record<string, string> = {
  "new": "Nowy",
  "like_new": "Jak nowy",
  "very_good": "Bardzo dobry",
  "good": "Dobry",
  "fair": "Zadowalający"
};
