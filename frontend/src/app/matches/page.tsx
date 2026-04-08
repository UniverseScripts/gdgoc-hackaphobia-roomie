'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getExploreProfiles } from '@/services/exploreService'; 
import MatchesHeader from '@/components/MatchesHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, X, MapPin, Home, User, MessageCircle} from 'lucide-react';

export default function MatchesPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [studentCount, setStudentCount] = useState(0); 
  const [starredItems, setStarredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- GET CURRENT USER ID (For Storage Namespacing) ---
  // We use this to ensure User A doesn't see User B's stars on the same browser
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    // 1. Load Dynamic Explore Count
    getExploreProfiles()
      .then(profiles => {
        setStudentCount(profiles.length);
        setLoading(false);
      })
      .catch(err => {
        console.log("Explore count error", err);
        setLoading(false);
      });

    // 2. Load Starred Items (SCOPED TO USER)
    if (currentUserId) {
      const storageKey = `starredItems_${currentUserId}`; // e.g., starredItems_12
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        let parsedItems = JSON.parse(stored);
        
        // Safety Check: Filter out myself just in case
        parsedItems = parsedItems.filter((item: any) => String(item.id) !== String(currentUserId));
        
        setStarredItems(parsedItems);
      }
    }
  }, [currentUserId]);

  const handleRemoveStar = (id: number, type: string) => {
    if (!currentUserId) return;

    // Filter out the item
    const updated = starredItems.filter(item => !(item.id === id && item.type === type));
    setStarredItems(updated);
    
    // Save back to the USER-SPECIFIC key
    const storageKey = `starredItems_${currentUserId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20"> 
      <MatchesHeader />

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* 1. HERO BANNER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl transition-all hover:shadow-2xl">
           <div className="relative z-10 max-w-2xl">
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm">
                 Community Update
              </Badge>
              <h1 className="text-2xl md:text-5xl font-bold mb-4 leading-tight">
                Find your perfect <br/> roommate match today
              </h1>
              
              <p className="text-blue-100 text-lg mb-8 max-w-lg leading-relaxed">
                We've found <span className="font-bold text-white">
                  {studentCount > 0 ? studentCount.toLocaleString() : "..."} 
                </span> students near you matching your lifestyle and preferences.
              </p>
              
              <div className="flex gap-4">
                 <Button 
                    onClick={() => router.push('/explore')} 
                    variant="secondary" 
                    size="lg" 
                    className="rounded-full gap-2 font-semibold shadow-lg hover:scale-105 transition-transform"
                 >
                    Start Exploring <ArrowRight className="w-4 h-4" />
                 </Button>
              </div>
           </div>

           {/* Background Decors */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="absolute bottom-0 right-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
        </div>

        {/* 2. STARRED LIST */}
        <div>
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               <Star className="w-6 h-6 text-amber-400 fill-current" />
               Your Starred List
             </h2>
             <span className="text-sm text-gray-500 font-medium">
               {starredItems.length} Saved
             </span>
          </div>

          {starredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {starredItems.map((item) => (
                  <Card key={`${item.type}-${item.id}`} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100">
                    
                    {/* Remove Button (Visible on Hover) */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveStar(item.id, item.type); }}
                      className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      title="Remove from stars"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col h-full">
                      {/* Image Area */}
                      <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className={item.type === 'roommates' ? "bg-blue-500" : "bg-emerald-500"}>
                             {item.type === 'roommates' ? <User className="w-3 h-3 mr-1" /> : <Home className="w-3 h-3 mr-1" />}
                             {item.type === 'roommates' ? 'Student' : 'Listing'}
                          </Badge>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-2">
                          <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{item.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                             <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                             {item.subtitle || "District 1"}
                          </div>
                        </div>
                        
                        {/* Action Footer */}
                        {/* 2. UPDATED ACTION FOOTER */}
                        <div className="mt-auto pt-4 flex gap-3">
                           {/* Chat Button: Only show for roommates, not apartment listings */}
                           {item.type === 'roommates' && (
                             <Button
                               size="icon"
                               className="shrink-0 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 shadow-sm transition-colors"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 router.push(`/chat/${item.id}`);
                               }}
                               title="Message"
                             >
                               <MessageCircle className="w-5 h-5" />
                             </Button>
                           )}
                           <Button 
                              onClick={() => router.push('/explore')} 
                              className="flex-1 rounded-xl gap-2 bg-gray-900 text-white hover:bg-blue-600 transition-all"
                            >
                              View Details <ArrowRight className="w-4 h-4" />
                           </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
               ))}
            </div>
          ) : (
            // EMPTY STATE
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No starred items yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Go to the Explore page to swipe through roommates and listings. Tap the star icon to save them here for later!
              </p>
              <Button onClick={() => router.push('/explore')} variant="outline" className="rounded-full">
                Go to Explore
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}