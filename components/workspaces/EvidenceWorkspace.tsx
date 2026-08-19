import React, { useState } from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { StatusBadge } from '../common/StatusBadge';
import { BookOpen, Layers } from 'lucide-react';

export const EvidenceWorkspace: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const { dossier, selectedClaimId } = state;
  const [filter, setFilter] = useState<string>('all');

  if (!dossier) return null;

  const filteredClaims = filter === 'all' 
    ? dossier.claims 
    : dossier.claims.filter(c => c.status === filter);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-atelier-elevated pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-atelier-paper">Evidence Ledger</h1>
          <p className="text-xs md:text-sm text-atelier-paper/60 font-reading mt-1">
            Grounded claims ledger. Select any assertion to inspect linked citations and source verification.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {['all', 'supported', 'contested', 'interpretive', 'needs-source'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                filter === f 
                  ? 'bg-atelier-lilac text-atelier-bg font-bold' 
                  : 'bg-atelier-surface border border-atelier-elevated text-atelier-paper/70 hover:text-atelier-paper'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredClaims.map((claim) => {
          const isSelected = selectedClaimId === claim.id;

          return (
            <button
              key={claim.id}
              type="button"
              onClick={() => {
                dispatch({ type: 'SELECT_CLAIM', payload: claim.id });
                // If on mobile, open marginalia drawer
                if (window.innerWidth < 768) {
                  dispatch({ type: 'SET_MOBILE_DRAWER', payload: 'marginalia' });
                }
              }}
              aria-pressed={isSelected}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-160 focus:outline-none focus-visible:ring-2 focus-visible:ring-atelier-lilac ${
                isSelected
                  ? 'border-atelier-lilac bg-atelier-surface shadow-[0_0_15px_rgba(182,156,255,0.15)]'
                  : 'border-atelier-elevated bg-atelier-surface/50 hover:border-atelier-paper/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-atelier-paper/50">[{claim.id}]</span>
                <StatusBadge status={claim.status} />
              </div>
              
              <p className="font-reading text-sm md:text-base text-atelier-paper leading-relaxed">
                {claim.text}
              </p>
              
              <div className="mt-3 flex items-center justify-between text-xs text-atelier-paper/60">
                {claim.confidenceNote && (
                  <span className="italic border-l border-atelier-elevated pl-2 text-[11px] truncate max-w-[70%]">
                    {claim.confidenceNote}
                  </span>
                )}
                <span className="font-mono text-[10px] text-atelier-paper/40 ml-auto flex items-center">
                  <BookOpen className="w-3 h-3 mr-1 text-atelier-lilac" />
                  {claim.sourceIds.length} source{claim.sourceIds.length === 1 ? '' : 's'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
