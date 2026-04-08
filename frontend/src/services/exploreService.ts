import api from './api';

// --- Interfaces (Types) ---

// 1. Profile Type (Matches what we defined in routers/matches.py)
export interface ExploreProfile {
  id: number;
  name: string;
  age: number;
  city: string;
  university: string;
  image: string;
  compatibility: number;
  major: string;
}

// 2. Listing Type (Matches what we defined in routers/listings.py)
export interface ExploreListing {
  id: number;
  title: string;
  price: number;
  size: number;
  location: string;
  images: string[];
  fitScore: number;
  host: {
    name: string;
    image: string;
    compatibility: number;
  };
  features: string[];
  description: string;
}

// --- API Functions ---

// Fetch Roommate Matches
export const getExploreProfiles = async (): Promise<ExploreProfile[]> => {
  // Calls the endpoint we updated to use Vector Similarity
  const response = await api.get('/matches/my-matches');
  
  // Transform Backend snake_case to Frontend camelCase/Interface format
  return response.data.map((user: any) => ({
    id: user.user_id,
    name: user.full_name || user.username,
    age: user.age,
    city: user.district,
    university: user.university,
    major: user.major,
    image: user.avatar_url,
    compatibility: user.match_score
  }));
};

// Fetch Apartment Listings
export const getExploreListings = async (): Promise<ExploreListing[]> => {
  // Calls the endpoint we created with the Price/Location algorithm
  const response = await api.get('/listings/recommendations');
  return response.data;
};