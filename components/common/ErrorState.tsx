import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const isQuota = /quota|credits|capacity/i.test(message);
  const isTopicMismatch = /aligned with the requested research topic/i.test(message);
  const title = isQuota ? 'Research Capacity Unavailable' : isTopicMismatch ? 'Topic Alignment Failed' : 'Synthesis Disrupted';
  const guidance = isQuota
    ? 'The model could not accept this request right now. Wait a moment and try again.'
    : isTopicMismatch
      ? 'The returned draft did not stay focused on your research question. Try the same topic again.'
      : undefined;

  return (
    <div 
      role="alert" 
      aria-live="assertive" 
      className="flex items-center justify-center h-full p-8"
    >
      <div className="text-center max-w-md p-6 border border-atelier-carmine/40 bg-atelier-surface rounded-lg shadow-xl space-y-4">
        <AlertTriangle className="w-10 h-10 text-atelier-carmine mx-auto" />
        <h2 className="text-atelier-carmine font-serif text-xl">{title}</h2>
        <p className="text-atelier-paper/80 text-sm font-ui leading-relaxed">{message}</p>
        {guidance && <p className="text-atelier-paper/60 text-xs font-ui leading-relaxed">{guidance}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-atelier-elevated text-xs font-ui text-atelier-paper hover:bg-atelier-carmine hover:text-atelier-bg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
