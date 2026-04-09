import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { db } from '@/shared/services/firebase';
import { useAuthStore } from '@/features/auth/store';

export const useMatches = () => {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: ['matches', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const dbRef = collection(db, 'matches');
      
      // We rely strictly on Firebase modular approach
      const q = query(dbRef, where('users', 'array-contains', user.uid), limit(20));

      const snapshots = await getDocs(q);
      
      return snapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!user?.uid, // Prevent fetching before hydration completes
    staleTime: 5 * 60 * 1000, // Sync with 5m latency constraints
  });
};
