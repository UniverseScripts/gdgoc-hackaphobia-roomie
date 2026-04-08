import React from 'react';
import { Sparkles } from 'lucide-react';
// FIX 1: Default import (no curly braces)
import newLogo from '../assets/Logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'minimal';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', variant = 'default', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-6 h-6',
      text: 'text-sm',
      sparkle: 'w-2 h-2'
    },
    md: {
      container: 'w-8 h-8',
      text: 'text-base',
      sparkle: 'w-2.5 h-2.5'
    },
    lg: {
      container: 'w-10 h-10',
      text: 'text-lg',
      sparkle: 'w-3 h-3'
    },
    xl: {
      container: 'w-12 h-12',
      text: 'text-xl',
      sparkle: 'w-3 h-3'
    }
  };

  const sizes = sizeClasses[size];

  const getContainerClasses = () => {
    const base = `${sizes.container} rounded-xl flex items-center justify-center relative`;
    
    switch (variant) {
      case 'white':
        return `${base} bg-white shadow-sm`;
      case 'minimal':
        return `${base} bg-transparent`;
      default:
        // Using your primary blue color (Tailwind class or hex)
        return `${base} bg-primary/10`; 
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'white':
        return '#3B82F6';
      case 'minimal':
        return '#3B82F6';
      default:
        return 'white';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'white':
      case 'minimal':
        return 'text-[#1A1A1A]';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={getContainerClasses()}>
        <img 
          src={newLogo.src} 
          alt="FitNest" 
          className="w-full h-full object-contain" 
        />
        
        {/* AI Sparkle indicator */}
        {variant !== 'minimal' && (
          <Sparkles 
            className={`${sizes.sparkle} absolute -top-1 -right-1 opacity-80`} 
            style={{ color: getIconColor() }} 
          />
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold ${getTextColor()} ${sizes.text} leading-none`}>
            FitNest
          </span>
          {(size === 'lg' || size === 'xl') && (
            <span className="text-xs text-muted-foreground leading-none">
              Find your perfect match
            </span>
          )}
        </div>
      )}
    </div>
  );
}