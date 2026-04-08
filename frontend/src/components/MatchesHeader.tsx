'use client';

import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Bell, SlidersHorizontal, Search, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function MatchesHeader() {
  const router = useRouter();

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Left: Logo */}
        <Logo size="md" />

        {/* Center: Search Bar (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by district, hobby, or budget..." 
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-full"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex rounded-full gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
          
          <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </Button>
          
          {/* --- RADIX PROFILE DROPDOWN --- */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                 {/* Placeholder Avatar */}
                 <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                   ME
                 </div>
              </button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[220px] bg-white rounded-lg p-1 shadow-xl border border-gray-100 mr-6 mt-2 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 z-50"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold text-gray-900">
                  My Account
                </DropdownMenu.Label>
                
                <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                
                {/* Option 1: Settings */}
                <DropdownMenu.Item 
                  className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer rounded-md text-gray-700 focus:bg-gray-100 focus:text-gray-900 transition-colors"
                  onClick={() => router.push('/profile')}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenu.Item>
                
                <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                
                {/* Option 2: Sign Out */}
                <DropdownMenu.Item 
                  className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer rounded-md text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenu.Item>

                {/* Optional Arrow for visual polish */}
                <DropdownMenu.Arrow className="fill-white" />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

        </div>
      </div>
    </header>
  );
}