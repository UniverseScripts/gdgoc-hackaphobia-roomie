import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export function SettingsRow({ icon, label, onClick }: SettingsRowProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
          {icon}
        </div>
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
    </button>
  );
}