import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  type: string;
  onAction: () => void;
}

export function EmptyState({ onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <RefreshCw className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold">You've seen everyone!</h3>
      <p className="text-muted-foreground max-w-xs">
        Check back later for new profiles or review the ones you passed.
      </p>
      <Button onClick={onAction} className="rounded-full bg-[#00B5A7] hover:bg-[#009e91]">
        Start Over
      </Button>
    </div>
  );
}