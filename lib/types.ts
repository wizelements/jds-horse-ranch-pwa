export interface Contact {
  id: string;
  type: "call" | "email";
  source?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  duration_minutes?: number;
  age_requirement?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  text: string;
  rating?: number;
  image_url?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value?: string;
  updated_at: string;
}
