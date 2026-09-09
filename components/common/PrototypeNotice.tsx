import React, { useState } from 'react';
import { Info, Sparkles, X, Globe, Cpu } from 'lucide-react';
import { ProviderMode } from '../../services/dossierProvider';

export const PrototypeNotice: React.FC<{ 
  mode: ProviderMode; 
  onToggleMode?: (mode: ProviderMode) => void;
  condensed?: boolean;
  /** Server-stamped engine label, e.g. "Hugging Face - GLM-5.3-Flash". */
  engine?: string;
  /** Whether the last dossier was actually search-grounded. */
  grounded?: boolean;
}> = ({ mode, onToggleMode, condensed = false, engine, grounded }) => {
  const [openModal, setOpenModal] = useState(false);

  const isLive = mode === 'live';
  // Only the server knows which engine ran and whether it grounded. Until a
  // dossier says so, claim nothing.
  const liveLabel = grounded === true
    ? 'Live - Search Grounded'
    : grounded === false
      ? 'Live - Ungrounded'
      : 'Live - Model Synthesis';
  const engineLine = engine
    ? `${engine}${grounded === false ? ' (no search grounding)' : ''}`
    : 'Live model synthesis';

  if (condensed) {
    return (
      <div className="relative inline-flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setOpenModal(!openModal)}
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-mono transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-atelier-lilac ${
            isLive && grounded !== false
              ? 'border-atelier-teal/40 bg-atelier-teal/10 text-atelier-teal hover:bg-atelier-teal/20'
              : isLive
              ? 'border-atelier-gold/40 bg-atelier-gold/10 text-atelier-gold hover:bg-atelier-gold/20'
              : 'border-atelier-lilac/40 bg-atelier-surface text-atelier-lilac hover:bg-atelier-lilac/10'
          }`}
          aria-label="View engine mode and provenance information"
        >
          {isLive ? (
            <>
              {grounded === false
                ? <Cpu className="w-3.5 h-3.5 text-atelier-gold" />
                : <Globe className="w-3.5 h-3.5 text-atelier-teal animate-pulse" />}
              <span>{liveLabel}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-atelier-lilac" />
              <span>Prototype · Fixture Archive</span>
            </>
          )}
        </button>

        {openModal && (
          <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-lg border border-atelier-elevated bg-atelier-surface shadow-2xl z-50 text-xs font-ui text-atelier-paper space-y-3">
            <div className="flex justify-between items-center border-b border-atelier-elevated pb-2">
              <span className="font-mono text-atelier-lilac text-[11px] uppercase tracking-wider font-semibold">
                Synthesis Engine Mode
              </span>
              <button 
                onClick={() => setOpenModal(false)}
                className="text-atelier-paper/50 hover:text-atelier-paper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-reading text-xs text-atelier-paper/80 leading-relaxed">
              {isLive 
                ? "Live Mode: Queries server-side Gemini 2.5 Flash with Google Search Grounding to synthesize up-to-date evidence."
                : "Fixture Mode: Uses curated Cult of Psyche demonstration archives for instant, deterministic testing without API consumption."}
            </p>

            {onToggleMode && (
              <div className="pt-2 border-t border-atelier-elevated flex space-x-2">
                <button
                  type="button"
                  onClick={() => { onToggleMode('fixture'); setOpenModal(false); }}
                  className={`flex-1 py-1.5 rounded text-[11px] font-mono border ${
                    !isLive 
                      ? 'border-atelier-lilac bg-atelier-lilac/20 text-atelier-lilac font-bold'
                      : 'border-atelier-elevated text-atelier-paper/60 hover:text-atelier-paper'
                  }`}
                >
                  Fixture Mode
                </button>
                <button
                  type="button"
                  onClick={() => { onToggleMode('live'); setOpenModal(false); }}
                  className={`flex-1 py-1.5 rounded text-[11px] font-mono border ${
                    isLive 
                      ? 'border-atelier-teal bg-atelier-teal/20 text-atelier-teal font-bold'
                      : 'border-atelier-elevated text-atelier-paper/60 hover:text-atelier-paper'
                  }`}
                >
                  Live Engine
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 rounded border border-atelier-elevated bg-atelier-surface/80 flex items-start space-x-3 text-xs">
      <Info className="w-4 h-4 text-atelier-lilac shrink-0 mt-0.5" />
      <div className="text-atelier-paper/80 font-reading leading-relaxed">
        <strong className="text-atelier-lilac font-ui">Engine:</strong> {isLive ? engineLine : 'Curated Demonstration Fixture'}
      </div>
    </div>
  );
};
