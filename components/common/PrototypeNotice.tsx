import React, { useState } from 'react';
import { Info, Sparkles, X } from 'lucide-react';

export const PrototypeNotice: React.FC<{ condensed?: boolean }> = ({ condensed = false }) => {
  const [openModal, setOpenModal] = useState(false);

  if (condensed) {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpenModal(!openModal)}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-atelier-lilac/40 bg-atelier-surface text-atelier-lilac text-xs font-mono hover:bg-atelier-lilac/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-atelier-lilac"
          aria-label="View prototype disclosure details"
        >
          <Sparkles className="w-3.5 h-3.5 text-atelier-lilac" />
          <span>Prototype · Fixture research</span>
        </button>

        {openModal && (
          <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-lg border border-atelier-elevated bg-atelier-surface shadow-2xl z-50 text-xs font-ui text-atelier-paper space-y-2">
            <div className="flex justify-between items-center border-b border-atelier-elevated pb-2">
              <span className="font-mono text-atelier-lilac text-[11px] uppercase tracking-wider font-semibold">
                Prototype Disclosure
              </span>
              <button 
                onClick={() => setOpenModal(false)}
                className="text-atelier-paper/50 hover:text-atelier-paper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-reading text-sm text-atelier-paper/90 leading-relaxed">
              This preview uses curated demonstration data. No live AI requests, web research, file uploads, or live source verifications are performed.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 rounded border border-atelier-lilac/30 bg-atelier-surface/80 flex items-start space-x-3 text-xs">
      <Info className="w-4 h-4 text-atelier-lilac shrink-0 mt-0.5" />
      <div className="text-atelier-paper/80 font-reading leading-relaxed">
        <strong className="text-atelier-lilac font-ui">Demonstration Mode:</strong> This preview uses curated Cult of Psyche demonstration fixtures. No external AI research, file uploads, or live web verifications occur in this prototype.
      </div>
    </div>
  );
};
