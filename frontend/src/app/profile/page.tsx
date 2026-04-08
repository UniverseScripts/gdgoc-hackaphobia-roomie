'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, LogOut, User, Bell, Shield, HelpCircle, 
  ChevronRight, Edit3, MapPin, Calendar, Eye, 
  MessageCircle, Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NotificationRow } from '@/components/NotificationRow';
import { StatsCard } from '@/components/StatsCard';
import { SettingsRow } from '@/components/SettingsRow';

// --- IMPORTS ---
import { getMyProfile, ProfileData } from '@/services/onBoardingService';
import { getMyMatches } from '@/services/matchService';

// --- TYPES ---
interface UserProfile extends ProfileData {
  stats: {
    views: number;
    matches: number;
    responseRate: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Real User Data ---
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch Profile and Matches in parallel
        const [profileData, matchesData] = await Promise.all([
          getMyProfile().catch(err => {
            console.error("Profile fetch failed", err);
            return null;
          }),
          getMyMatches().catch(err => {
            console.error("Matches fetch failed", err);
            return []; // Fallback to empty array
          }),
        ]);

        if (profileData) {
          setProfile({
            ...profileData,
            stats: {
              views: 142, // Placeholder (Requires a Views table in DB)
              matches: Array.isArray(matchesData) ? matchesData.length : 0,
              responseRate: 88 // Placeholder (Requires Chat Analysis)
            }
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // --- 2. Logout Logic ---
  const handleLogout = () => {
    localStorage.clear(); // Clears token, userId, username, etc.
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-28 w-28 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      
      {/* HEADER BANNER */}
      <div className="relative bg-white shadow-sm pb-8">
        <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
           <div className="absolute inset-0 bg-white/10 opacity-20" />
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-6 gap-6">
            
            {/* Avatar */}
            <div className="relative">
              <div className="h-28 w-28 rounded-full border-4 border-white bg-gray-200 shadow-md flex items-center justify-center overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name || profile?.username}
                </h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Student
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{profile?.age} years old</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {/* Map University/Major to Location area */}
                  <span>{profile?.university || "University"}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="rounded-full gap-2 hidden md:flex">
               <Edit3 className="w-4 h-4" /> Edit Profile
            </Button>
          </div>

          {/* Bio */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center md:text-left mb-6">
             <p className="text-gray-600 text-sm leading-relaxed">
               {profile?.bio || "No bio available."}
             </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            <StatsCard 
              icon={<Eye className="w-5 h-5 text-blue-500" />}
              label="Views"
              value={profile?.stats.views || 0}
            />
            <StatsCard 
              icon={<Zap className="w-5 h-5 text-amber-500" />}
              label="Matches"
              value={profile?.stats.matches || 0}
            />
             <StatsCard 
              icon={<MessageCircle className="w-5 h-5 text-green-500" />}
              label="Reply Rate"
              value={`${profile?.stats.responseRate}%`}
            />
          </div>
        </div>
      </div>

      {/* SETTINGS LIST */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* --- Notification Settings (Visual Only) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notification Preferences
            </h3>
          </div>
          <div className="p-4 space-y-4">
             <NotificationRow label="Push Notifications" desc="Receive new matches instantly" defaultChecked={true} />
             <Separator />
             <NotificationRow label="Email Digest" desc="Weekly summary of activity" defaultChecked={false} />
             <Separator />
             <NotificationRow label="Sound Effects" desc="Play sounds on new messages" defaultChecked={true} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" /> General
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100">
             <SettingsRow icon={<User className="w-5 h-5" />} label="Account Information" />
             <SettingsRow icon={<Shield className="w-5 h-5" />} label="Privacy & Security" />
             <SettingsRow icon={<Bell className="w-5 h-5" />} label="Notifications" />
             
             {/* Log Out */}
             <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-between p-4 text-left hover:bg-red-50 transition-colors group"
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                     <LogOut className="w-5 h-5" />
                   </div>
                   <span className="font-medium text-red-600">Log Out</span>
                </div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}