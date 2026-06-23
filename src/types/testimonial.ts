export interface Testimonial {
  id: number;
  name: string;
  review: string;
  location: string | null;
  designation: string | null;
  rating: number | null;
  display_order: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TestimonialPayload {
  name: string;
  review: string;
  location?: string | null;
  designation?: string | null;
  rating?: number | null;
  display_order?: number;
  status?: boolean;
}
