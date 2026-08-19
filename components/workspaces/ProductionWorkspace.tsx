import React from 'react';
import { AppState } from '../../app/workflowReducer';
import { Sparkles, Video, Image, Youtube, ListOrdered } from 'lucide-react';

export const ProductionWorkspace: React.FC<{ state: AppState }> = ({ state }) => {
  const { dossier } = state;
  if (!dossier) return null;

  const { production } = dossier;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="border-b border-atelier-elevated pb-4">
        <h1 className="font-serif text-2xl md:text-3xl text-atelier-paper">Production Stage</h1>
        <p className="text-xs md:text-sm text-atelier-paper/60 font-reading mt-1">
          Scored titles, thumbnail visual concepts, shot lists, and short-form adaptations.
        </p>
      </div>

      {/* Titles */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg text-atelier-paper flex items-center">
          <Sparkles className="w-4 h-4 text-atelier-lilac mr-2" />
          Scored Title Concepts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {production.titles.slice(0, 6).map((title, i) => (
            <div key={i} className="p-3 rounded border border-atelier-elevated bg-atelier-surface text-xs font-reading text-atelier-paper/90 flex items-start space-x-2">
              <span className="font-mono text-atelier-lilac text-[10px]">{i + 1}.</span>
              <span>{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg text-atelier-paper flex items-center">
          <Image className="w-4 h-4 text-atelier-teal mr-2" />
          Thumbnail Visual Directives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {production.thumbnails.slice(0, 4).map((thm) => (
            <div key={thm.id} className="p-4 rounded border border-atelier-elevated bg-atelier-surface space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-serif text-xs text-atelier-paper font-semibold">{thm.concept}</span>
                <span className="font-mono text-[10px] text-atelier-gold bg-atelier-gold/10 px-2 py-0.5 rounded border border-atelier-gold/30">
                  OVERLAY: "{thm.textOverlay}"
                </span>
              </div>
              <p className="font-reading text-xs text-atelier-paper/70 italic border-l border-atelier-elevated pl-2">
                {thm.visualPrompt}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Shot List */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg text-atelier-paper flex items-center">
          <Video className="w-4 h-4 text-atelier-gold mr-2" />
          Shot List & Visual Pacing
        </h2>
        <div className="border border-atelier-elevated rounded-lg overflow-hidden">
          {production.shotList.map((shot, i) => (
            <div key={i} className="p-3 border-b border-atelier-elevated last:border-0 bg-atelier-surface/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <span className="font-mono text-atelier-lilac shrink-0">{shot.timecode}</span>
              <span className="font-reading text-atelier-paper/90 flex-1 sm:px-4">{shot.visualIntent}</span>
              <span className="font-mono text-[10px] text-atelier-paper/50">{shot.assetType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
