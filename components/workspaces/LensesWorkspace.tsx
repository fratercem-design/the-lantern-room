import React from 'react';
import { AppState } from '../../app/workflowReducer';
import { Pin, ShieldAlert } from 'lucide-react';

export const LensesWorkspace: React.FC<{ state: AppState }> = ({ state }) => {
  const { dossier } = state;
  if (!dossier) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-atelier-elevated pb-4">
        <h1 className="font-serif text-2xl md:text-3xl text-atelier-paper">Lens Matrix</h1>
        <p className="text-xs md:text-sm text-atelier-paper/60 font-reading mt-1">
          Strict separation of historical record, psychological framework, mythic archetype, theological context, and coercion analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dossier.lenses.map((lens, idx) => (
          <div 
            key={idx} 
            className={`p-5 rounded-lg border bg-atelier-surface flex flex-col justify-between ${
              lens.type === 'coercion-watch' 
                ? 'border-atelier-gold/40' 
                : 'border-atelier-elevated'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-mono text-[10px] tracking-widest uppercase font-bold ${
                  lens.type === 'historical' ? 'text-atelier-teal' :
                  lens.type === 'psychological' ? 'text-atelier-lilac' :
                  lens.type === 'coercion-watch' ? 'text-atelier-gold' :
                  'text-atelier-paper/70'
                }`}>
                  {lens.type.replace('-', ' ')} Lens
                </span>
                {lens.pinned && (
                  <span className="inline-flex items-center text-[10px] font-mono text-atelier-lilac bg-atelier-lilac/10 px-2 py-0.5 rounded border border-atelier-lilac/30">
                    <Pin className="w-2.5 h-2.5 mr-1" /> PINNED
                  </span>
                )}
              </div>
              <h3 className="font-serif text-lg text-atelier-paper mb-2">{lens.title}</h3>
              <p className="font-reading text-sm text-atelier-paper/80 leading-relaxed mb-4">
                {lens.body}
              </p>
            </div>
            
            <ul className="space-y-1 border-t border-atelier-elevated pt-3">
              {lens.keyPoints.map((kp, i) => (
                <li key={i} className="text-xs text-atelier-paper/60 flex items-start">
                  <span className="text-atelier-lilac mr-2">•</span>
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
