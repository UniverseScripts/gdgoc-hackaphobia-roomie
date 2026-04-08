'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Info, Sparkles, User, SlidersHorizontal, Users, Home, Star, Loader2, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { ListingCard } from '@/components/ListingCard';
import { Logo } from '@/components/Logo';
import { EmptyState } from '@/components/EmptyState';

// --- IMPORT DYNAMIC DATA SERVICES ---
import { 
  getExploreProfiles, 
  getExploreListings, 
  ExploreProfile, 
  ExploreListing 
} from '@/services/exploreService';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'roommates' | 'listings'>('roommates');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // --- REAL DATA STATE ---
  const [profiles, setProfiles] = useState<ExploreProfile[]>([]);
  const [listings, setListings] = useState<ExploreListing[]>([]);
  const [loading, setLoading] = useState(true);

// --- FETCH DATA ON LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profilesData, listingsData] = await Promise.all([
          getExploreProfiles(),
          getExploreListings()
        ]);

        // --- ADD THIS BLOCK START ---
        // 1. Get existing stars
        const stored = localStorage.getItem('starredItems');
        const starred = stored ? JSON.parse(stored) : [];

        // 2. Filter out items that are ALREADY starred
        const filteredProfiles = profilesData.filter(p => 
          !starred.some((s: any) => s.id === p.id && s.type === 'roommates')
        );
        
        const filteredListings = listingsData.filter(l => 
          !starred.some((s: any) => s.id === l.id && s.type === 'listings')
        );

        setProfiles(filteredProfiles);
        setListings(filteredListings);
        // --- ADD THIS BLOCK END ---

      } catch (error) {
        console.error("Failed to load explore data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentData = activeTab === 'roommates' ? profiles : listings;
    
    if (currentIndex >= currentData.length) {
      setCurrentIndex(0); // Optional: Loop back or show empty state
      return;
    }
    
    setSwipeDirection(direction);
    
    // TODO: Add API call here to save the "Like" or "Pass"
    // if (direction === 'right') saveLike(currentItem.id);

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };


// --- FEATURE: SAVE TO HOME PAGE ---
  const handleStar = () => {
    // 1. Identify the current item being viewed
    const currentItem = activeTab === 'roommates' ? profiles[currentIndex] : listings[currentIndex];
    if (!currentItem) return;

    // 2. Get Current User ID
    const userId = localStorage.getItem('userId');
    if (!userId) return; // Safety check

    // 3. Use the scoped key
    const storageKey = `starredItems_${userId}`;
    const stored = localStorage.getItem('starredItems');
    const starredItems = stored ? JSON.parse(stored) : [];

    // 4. Create a standardized object for the Home Page shelf
    const newItem = {
      id: currentItem.id,
      type: activeTab, // 'roommates' or 'listings'
      title: activeTab === 'roommates' 
        ? (currentItem as ExploreProfile).name 
        : (currentItem as ExploreListing).title,
      image: activeTab === 'listings'
        ? (currentItem as ExploreListing).images?.[0] // Take the first image of the listing
        : "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop", // Fallback for Profiles (since they don't have images yet)
      subtitle: activeTab === 'roommates' 
        ? (currentItem as ExploreProfile).major 
        : (currentItem as ExploreListing).price
    };

    // Remove from the current deck so they don't appear again in this session
    if (activeTab === 'roommates') {
      setProfiles(prev => prev.filter(p => p.id !== currentItem.id));
    } else {
      setListings(prev => prev.filter(l => l.id !== currentItem.id));
    }
    
    // Reset swipe animation/direction
    setSwipeDirection(null);

    // 5. Check for duplicates (prevent saving same person twice)
    const exists = starredItems.find((i: any) => i.id === newItem.id && i.type === newItem.type);
    
    if (!exists) {
      const updatedList = [newItem, ...starredItems];
      localStorage.setItem('starredItems', JSON.stringify(updatedList));
      
      // 6. Save to scoped key
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
      // Optional: Visual feedback
      alert(`⭐ Starred ${newItem.title}! It will appear on your Home Dashboard.`);
    }
    
    // 7. Automatically move to the next card (like a swipe)
    handleSwipe('right');
  };
  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return 'bg-[#00B5A7] text-white';
    if (score >= 70) return 'bg-[#FFC400] text-[#1A1A1A]';
    return 'bg-gray-400 text-white';
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#00B5A7] mb-4" />
        <p className="text-muted-foreground animate-pulse">Finding your best matches...</p>
      </div>
    );
  }

  const currentData = activeTab === 'roommates' ? profiles : listings;
  const isRoommates = activeTab === 'roommates';
  const currentItem = currentData[currentIndex];

  // --- EMPTY STATE (No more profiles) ---
  if (!currentItem) {
    return (
      <div className="min-h-screen bg-white flex flex-col pb-24">
         <Header 
           activeTab={activeTab} 
           setActiveTab={setActiveTab} 
           onReset={() => setCurrentIndex(0)} 
           count={0}
         />
        <div className="flex-1 flex items-center justify-center p-4">
          
          {/* CONDITIONALLY RENDER EMPTY STATE BASED ON TAB */}
          {activeTab === 'roommates' ? (
            // 1. ORIGINAL ROOMMATE MESSAGE
            <EmptyState 
              type="discovery" 
              onAction={() => setCurrentIndex(0)} 
            />
          ) : (
            // 2. NEW LISTINGS SPECIFIC MESSAGE
            <div className="flex flex-col items-center text-center max-w-xs animate-in fade-in zoom-in duration-300">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                 <Home className="w-8 h-8 text-gray-400" />
               </div>
               
               <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                 You've seen every listing!
               </h3>
               
               <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                 We currently have no more apartments matching your criteria. Check back later for new rentals!
               </p>
               
               <Button 
                 onClick={() => setCurrentIndex(0)} 
                 className="rounded-full bg-[#00B5A7] text-white px-8 hover:bg-[#00A693] shadow-md transition-all hover:scale-105"
               >
                 Start Over
               </Button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* HEADER */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onReset={() => setCurrentIndex(0)}
        count={currentData.length - currentIndex}
      />

      {/* CARD STACK */}
      <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
        <div className="relative w-full px-4 max-w-sm h-[65vh] min-h-[500px]">
          {isRoommates ? (
            <Card 
              className={`
                relative w-full h-full overflow-hidden transition-all duration-300 ease-out shadow-xl border-0 bg-white rounded-3xl
                ${swipeDirection === 'left' ? '-translate-x-full -rotate-12 opacity-0' : ''}
                ${swipeDirection === 'right' ? 'translate-x-full rotate-12 opacity-0' : ''}
              `}
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}
            >
              {/* IMAGE SECTION */}
              <div className="relative h-[65%] w-full">
                <ImageWithFallback
                  src={(currentItem as ExploreProfile).image}
                  alt={(currentItem as ExploreProfile).name}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <Badge className={`absolute top-4 right-4 px-3 py-1.5 backdrop-blur-md border-0 text-sm ${getCompatibilityColor((currentItem as ExploreProfile).compatibility)}`}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {(currentItem as ExploreProfile).compatibility}% Match
                </Badge>
              </div>

              {/* INFO SECTION */}
              <div className="p-6 h-[35%] flex flex-col justify-between relative bg-white">
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <h2 className="text-2xl font-bold text-[#1A1A1A]">{(currentItem as ExploreProfile).name}</h2>
                    <span className="text-xl text-gray-500 font-light">{(currentItem as ExploreProfile).age}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <User className="w-4 h-4 text-[#00B5A7]" />
                    <span className="text-sm font-medium">{(currentItem as ExploreProfile).university}</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-[#00B5A7]/10 text-[#00B5A7]">
                      {(currentItem as ExploreProfile).major}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {(currentItem as ExploreProfile).city}
                    </Badge>
                  </div>
                </div>

                <div className="absolute -top-6 right-6">
                  <Button size="sm" variant="secondary" className="shadow-lg bg-white hover:bg-gray-50 rounded-full px-4">
                    <Info className="w-4 h-4 mr-2" /> Details
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            // LISTING CARD
            <div className={`
                transition-all duration-300 w-full
                ${swipeDirection === 'left' ? '-translate-x-full -rotate-12 opacity-0' : ''}
                ${swipeDirection === 'right' ? 'translate-x-full rotate-12 opacity-0' : ''}
            `}>
              <ListingCard 
                listing={currentItem as ExploreListing} 
                onViewListing={() => {}} 
              />
            </div>
          )}
        </div>
      </div>

      {/* TINDER ACTIONS */}
      <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
        <div className="flex justify-center pointer-events-auto">
          <div className="flex items-center gap-6 px-8 py-3 rounded-full bg-white/90 backdrop-blur-xl shadow-2xl border border-white/20">
            <Button
              variant="outline"
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full border-2 border-red-100 hover:bg-red-50 text-red-500 hover:scale-110 transition-all shadow-sm"
            >
              <X className="w-6 h-6" />
            </Button>

            <Button
              onClick={handleStar}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-blue-100 hover:bg-blue-50 text-blue-500 hover:scale-110 transition-all shadow-sm"
            >
              <Star className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-[#00B5A7] to-[#00A693] hover:scale-110 transition-all shadow-lg border-0 text-white"
            >
              <Heart className="w-6 h-6 fill-current" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Header({ activeTab, setActiveTab, onReset, count }: any) {
  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Logo size="lg" showText={false} />
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Discover</h1>
            <p className="text-xs text-muted-foreground">Find your perfect match</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon"><SlidersHorizontal className="w-5 h-5" /></Button>
           {count > 0 && (
             <Badge className="bg-[#00B5A7]/10 text-[#00B5A7] hover:bg-[#00B5A7]/20 border-0">
               {count} left
             </Badge>
           )}
        </div>
      </div>
      
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => { setActiveTab('roommates'); onReset(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all text-sm font-medium ${
            activeTab === 'roommates' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500'
          }`}
        >
          <Users className="w-4 h-4" /> Roommates
        </button>
        <button
          onClick={() => { setActiveTab('listings'); onReset(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all text-sm font-medium ${
            activeTab === 'listings' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500'
          }`}
        >
          <Home className="w-4 h-4" /> Listings
        </button>
      </div>
    </div>
  );
}
