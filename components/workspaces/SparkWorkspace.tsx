import React from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { Sparkles, ArrowRight, BookOpen, Compass } from 'lucide-react';

export const SparkWorkspace: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const { dossier } = state;

  if (!dossier) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <Compass className="w-16 h-16 text-atelier-lilac/40 animate-pulse" />
        <div className="space-y-2">
          <h2 className="font-serif text-3xl text-atelier-paper">The Atelier Awaits</h2>
          <p className="font-reading text-base text-atelier-paper/70 max-w-lg">
            Enter a research inquiry in The Cabinet to ignite a cited dossier, separated interpretive lenses, and complete episode architecture.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-atelier-elevated pb-4">
        <div className="flex items-center space-x-2 text-atelier-lilac text-xs font-mono mb-1 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage I · Spark & Intake</span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl text-atelier-paper">
          {dossier.meta.workingTitle}
        </h1>
        <p className="text-sm text-atelier-paper/70 font-reading mt-2 leading-relaxed">
          {dossier.meta.logline}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg border border-atelier-elevated bg-atelier-surface space-y-2">
          <span className="text-[11px] font-mono text-atelier-teal uppercase tracking-wider">Editorial Promise</span>
          <p className="font-reading text-sm text-atelier-paper/90 leading-relaxed">
            By the end of this episode, the audience will understand why modern simulation theory and tech anxieties are not novel physics, but the modern psychological resurgence of the ancient Gnostic Demiurge.
          </p>
        </div>

        <div className="p-5 rounded-lg border border-atelier-elevated bg-atelier-surface space-y-2">
          <span className="text-[11px] font-mono text-atelier-lilac uppercase tracking-wider">Format & Tone</span>
          <div className="flex items-center space-x-2 pt-1">
            <span className="px-2.5 py-1 rounded bg-atelier-bg border border-atelier-elevated text-xs font-mono text-atelier-paper">
              {dossier.meta.targetFormat || "20-30 min Deep Dive"}
            </span>
            <span className="px-2.5 py-1 rounded bg-atelier-bg border border-atelier-elevated text-xs font-mono text-atelier-paper">
              {dossier.meta.tone || "Academic-Occult"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-lg border border-atelier-elevated bg-atelier-surface/60 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-base text-atelier-paper">Evidence Ledger Ready</h3>
          <p className="text-xs text-atelier-paper/60 font-reading mt-0.5">
            {dossier.claims.length} claims extracted across {dossier.sources.length} primary and analytical sources.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 'evidence' })}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-atelier-elevated text-xs font-ui text-atelier-paper hover:bg-atelier-lilac hover:text-atelier-bg transition-colors font-medium"
        >
          <span>Open Evidence Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
