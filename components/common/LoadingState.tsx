import React from 'react';
import { Compass } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string; onCancel?: () => void }> = ({
  message = "Consulting the Archive...",
  onCancel
}) => {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="flex flex-col items-center justify-center h-full space-y-6 p-8 text-center"
    >
      <div className="relative">
        <Compass className="w-14 h-14 text-atelier-lilac animate-spin" style={{ animationDuration: '6s' }} />
        <div className="absolute inset-0 rounded-full bg-atelier-lilac/10 blur-md animate-pulse" />
      </div>
      <div className="space-y-2">
        <p className="font-serif text-lg tracking-widest text-atelier-paper uppercase">
          {message}
        </p>
        <p className="text-xs font-mono text-atelier-paper/50">
          Synthesizing claims, mythic correspondence, and evidence ledger...
        </p>
      </div>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded border border-atelier-elevated bg-atelier-surface text-xs font-ui text-atelier-paper/70 hover:text-atelier-paper hover:border-atelier-carmine transition-colors"
        >
          Cancel Synthesis
        </button>
      )}
    </div>
  );
};
