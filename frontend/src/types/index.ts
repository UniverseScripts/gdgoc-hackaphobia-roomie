export type UserRole = 'customer' | 'landlord' | 'admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  username: string;
  email: string;
  full_name?: string;
  age?: number;
  university?: string;
  profile_completed: boolean;
}

export interface Apartment {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  housing_type: string;
  price: number;
  size: number;
  district: string;
  address?: string;
  images: string[];
  amenities: string[];
  average_rating: number; // INJECTED FROM PHASE 3 BACKEND
  total_reviews: number;  // INJECTED FROM PHASE 3 BACKEND
}

export interface PendingApartment extends Omit<Apartment, 'average_rating' | 'total_reviews'> {
  status: 'pending_review';
}

export interface ChatMessage {
  id: string;
  thread_id: string; // INJECTED FROM PHASE 4 BACKEND
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
}
