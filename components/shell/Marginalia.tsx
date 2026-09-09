import React from 'react';
import { BookOpen, AlertTriangle, Info, Check, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { StatusBadge } from '../common/StatusBadge';

export const Marginalia: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const { dossier, selectedClaimId } = state;

  if (!dossier) {
    return (
      <aside className="w-80 border-l border-atelier-elevated bg-atelier-bg p-5 flex flex-col h-full shrink-0">
        <h2 className="font-ui text-xs font-semibold tracking-wider text-atelier-lilac uppercase mb-4">
          Marginalia
        </h2>
        <div className="text-xs text-atelier-paper/40 font-mono text-center mt-10">
          Awaiting synthesis context...
        </div>
      </aside>
    );
  }

  const selectedClaim = dossier.claims.find(c => c.id === selectedClaimId);
  const relatedSources = selectedClaim 
    ? dossier.sources.filter(s => selectedClaim.sourceIds.includes(s.id))
    : [];

  const unresolvedWarnings = dossier.warnings.filter(w => !w.resolved);

  return (
    <aside className="w-80 border-l border-atelier-elevated bg-atelier-bg flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0">
      {/* Mobile Drawer Close Button */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-atelier-elevated">
        <span className="font-serif text-sm text-atelier-paper">Marginalia</span>
        <button
          onClick={() => dispatch({ type: 'SET_MOBILE_DRAWER', payload: 'none' })}
          className="text-atelier-paper/60 hover:text-atelier-paper"
          aria-label="Close Marginalia drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Warnings Panel */}
      {unresolvedWarnings.length > 0 && (
        <div className="p-5 border-b border-atelier-elevated bg-atelier-carmine/5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-ui text-xs font-semibold tracking-wider text-atelier-carmine uppercase flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              Active Warnings ({unresolvedWarnings.length})
            </h2>
          </div>
          <div className="space-y-2">
            {unresolvedWarnings.map(w => (
              <div key={w.id} className="p-3 rounded border border-atelier-carmine/30 bg-atelier-surface text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-atelier-carmine uppercase font-bold">
                    [{w.severity}]
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'RESOLVE_WARNING', payload: w.id })}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-atelier-teal/40 bg-atelier-teal/10 text-atelier-teal text-[10px] hover:bg-atelier-teal/20 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Resolve / Exclude</span>
                  </button>
                </div>
                <p className="text-atelier-paper/90 font-reading leading-relaxed">{w.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Inspector */}
      <div className="p-5 space-y-4 flex-1">
        <h2 className="font-ui text-xs font-semibold tracking-wider text-atelier-lilac uppercase flex items-center">
          <Info className="w-3.5 h-3.5 mr-2" />
          Claim & Source Inspector
        </h2>
        
        {selectedClaim ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded border border-atelier-elevated bg-atelier-surface space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-atelier-paper/50">[{selectedClaim.id}]</span>
                <StatusBadge status={selectedClaim.status} />
              </div>
              <p className="text-xs text-atelier-paper font-reading leading-relaxed">
                {selectedClaim.text}
              </p>
              {selectedClaim.confidenceNote && (
                <div className="text-[11px] text-atelier-paper/60 italic border-l border-atelier-elevated pl-2 mt-2">
                  {selectedClaim.confidenceNote}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] font-mono text-atelier-paper/50 mb-2 flex items-center justify-between">
                <span className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" /> REFERENCED SOURCES ({relatedSources.length})
                </span>
              </div>
              
              {relatedSources.length > 0 ? (
                <div className="space-y-3">
                  {relatedSources.map(src => (
                    <div key={src.id} className="p-3 rounded border border-atelier-elevated bg-atelier-surface text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-atelier-lilac text-[10px]">[{src.id}]</span>
                        <StatusBadge status={src.verificationState} />
                      </div>
                      <h4 className="font-serif text-atelier-paper font-semibold text-xs leading-snug">
                        {src.title}
                      </h4>
                      <p className="text-[11px] text-atelier-paper/70 font-reading italic">
                        {src.citation}
                      </p>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[10px] text-atelier-teal hover:underline font-mono"
                        >
                          <span>{src.url}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      <ul className="border-t border-atelier-elevated/60 pt-2 space-y-1">
                        {src.keyPoints.map((kp, i) => (
                          <li key={i} className="text-[10px] text-atelier-paper/60 flex items-start">
                            <span className="text-atelier-lilac mr-1.5">•</span>
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-atelier-gold font-mono p-3 border border-atelier-gold/30 rounded bg-atelier-gold/5 space-y-1">
                  <div className="font-semibold">No verifiable sources attached.</div>
                  <div className="text-[11px] text-atelier-paper/70">
                    This claim is marked for editorial research or citation attachment.
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-atelier-paper/40 font-mono text-center mt-12 space-y-2">
            <BookOpen className="w-8 h-8 text-atelier-paper/20 mx-auto" />
            <p>Select any claim card in the Evidence Ledger to inspect its citations and source cards.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
