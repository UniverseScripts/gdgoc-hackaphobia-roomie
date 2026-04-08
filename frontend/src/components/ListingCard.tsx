import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Maximize2, Wifi, Car, Users } from 'lucide-react';

export interface Listing {
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

interface ListingCardProps {
  listing: Listing;
  onViewListing: (listing: Listing) => void;
}

export function ListingCard({ listing, onViewListing }: ListingCardProps) {
  const getFitScoreColor = (score: number) => {
    if (score >= 85) return 'bg-[#00B5A7] text-white';
    if (score >= 70) return 'bg-[#FFC400] text-[#1A1A1A]';
    return 'bg-gray-400 text-white';
  };

  return (
    <Card 
      className="w-full bg-white shadow-xl border-0 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 ease-out rounded-3xl hover:scale-[1.02]"
      onClick={() => onViewListing(listing)}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <ImageWithFallback
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
        
        <Badge className={`absolute top-6 right-6 px-4 py-2 border-0 ${getFitScoreColor(listing.fitScore)}`}>
          {listing.fitScore}% Fit
        </Badge>
      </div>

      {/* Info Area */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-[#1A1A1A]">
              {(listing.price / 1000000).toFixed(1)}M
            </span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
            <Maximize2 className="w-3 h-3" />
            <span>{listing.size} m²</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-[#1A1A1A] line-clamp-1">{listing.title}</h3>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 text-[#00B5A7]" />
            <span>{listing.location}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-2 overflow-hidden">
          {listing.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <span className="text-[10px] font-medium text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}