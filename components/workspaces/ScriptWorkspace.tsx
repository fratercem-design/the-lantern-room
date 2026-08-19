import React, { useState } from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { Feather, Smile, Eye, BookOpen } from 'lucide-react';

export const ScriptWorkspace: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const { dossier } = state;
  const [showHeatmap, setShowHeatmap] = useState(true);

  if (!dossier) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-atelier-elevated pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-atelier-paper">Paced Script</h1>
          <p className="text-xs md:text-sm text-atelier-paper/60 font-reading mt-1">
            Editorial voice narration, visual cues, comedy beats, and cited sentence anchors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors ${
            showHeatmap 
              ? 'border-atelier-lilac bg-atelier-lilac/10 text-atelier-lilac' 
              : 'border-atelier-elevated bg-atelier-surface text-atelier-paper/60'
          }`}
        >
          Heatmap: {showHeatmap ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="space-y-6">
        {dossier.script.map((block) => (
          <div key={block.id} className="p-5 rounded-lg border border-atelier-elevated bg-atelier-surface space-y-3">
            <div className="flex justify-between items-center border-b border-atelier-elevated pb-2">
              <span className="font-serif text-sm text-atelier-lilac">{block.section}</span>
              <div className="flex items-center space-x-2">
                {block.isComedyBeat && (
                  <span className="inline-flex items-center text-[10px] font-mono text-atelier-gold bg-atelier-gold/10 px-2 py-0.5 rounded border border-atelier-gold/30">
                    <Smile className="w-3 h-3 mr-1" /> COMEDY BEAT
                  </span>
                )}
                <span className="text-[10px] font-mono text-atelier-paper/50 italic">{block.tone}</span>
              </div>
            </div>

            <p className="font-reading text-base text-atelier-paper leading-relaxed">
              {block.narration}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 text-xs border-t border-atelier-elevated/60 text-atelier-paper/60 gap-2">
              <div className="flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-atelier-teal shrink-0" />
                <span className="italic">{block.visualCue}</span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-[10px] text-atelier-paper/40">
                <BookOpen className="w-3 h-3 text-atelier-lilac" />
                <span>{block.sourceIds.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
