import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { db } from '@/shared/services/firebase'; // Assuming shared firebase config

export interface PropertyListing {
  id: string;
  title: string;
  price: number;
  size: number;
  district: string;
  imageUrl?: string;
}

export const useProperties = (districtFilter?: string) => {
  return useQuery({
    queryKey: ['properties', districtFilter],
    queryFn: async () => {
      const dbRef = collection(db, 'properties');
      
      const q = districtFilter 
        ? query(dbRef, where('district', '==', districtFilter), limit(50))
        : query(dbRef, limit(50));

      // Bypasses Cloud Run / API, fetches strictly from Edge directly mapping into the 5 min stale cache
      const snapshots = await getDocs(q);
      
      return snapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PropertyListing[];
    },
    // Force aggressive caching configuration via TanStack overrides locally
    staleTime: 5 * 60 * 1000,
  });
};
