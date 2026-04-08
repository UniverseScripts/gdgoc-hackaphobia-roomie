'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, MessageCircle, User } from 'lucide-react';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide Bottom Nav on specific pages (like Auth or Landing)
  if (['/', '/login', '/signup', '/test', '/onboarding/profile'].includes(pathname)) return null;

  const navItems = [
    { label: 'Home', icon: Home, path: '/matches' },
    { label: 'Explore', icon: Search, path: '/explore' },
    { label: 'Chat', icon: MessageCircle, path: '/chat' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto pb-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive ? 'text-primary scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'fill-primary/10' : ''}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}