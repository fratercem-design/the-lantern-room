import React from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { Clock, Layers, Check } from 'lucide-react';

export const ShapeWorkspace: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const { dossier, selectedShapeId } = state;
  if (!dossier) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-atelier-elevated pb-4">
        <h1 className="font-serif text-2xl md:text-3xl text-atelier-paper">Episode Shape</h1>
        <p className="text-xs md:text-sm text-atelier-paper/60 font-reading mt-1">
          Three distinct episode architectures. Select your structural arc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {dossier.shapes.map((shape) => {
          const isSelected = selectedShapeId === shape.id;

          return (
            <div
              key={shape.id}
              onClick={() => dispatch({ type: 'SELECT_SHAPE', payload: shape.id })}
              className={`p-5 rounded-lg border flex flex-col justify-between cursor-pointer transition-all duration-160 ${
                isSelected
                  ? 'border-atelier-lilac bg-atelier-surface shadow-[0_0_20px_rgba(182,156,255,0.15)]'
                  : 'border-atelier-elevated bg-atelier-surface/40 hover:border-atelier-paper/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-atelier-lilac">
                    {shape.archetype.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center text-[11px] font-mono text-atelier-paper/50">
                    <Clock className="w-3 h-3 mr-1" />
                    ~{shape.estimatedRuntimeMinutes}m
                  </div>
                </div>

                <h3 className="font-serif text-lg text-atelier-paper">{shape.title}</h3>

                <div className="space-y-2 text-xs font-reading text-atelier-paper/80 border-t border-atelier-elevated pt-3">
                  <div>
                    <strong className="font-ui text-[10px] uppercase text-atelier-paper/50 block font-mono">Cold Open</strong>
                    <p className="mt-0.5">{shape.coldOpen}</p>
                  </div>
                  <div>
                    <strong className="font-ui text-[10px] uppercase text-atelier-paper/50 block font-mono">Reversal Beat</strong>
                    <p className="mt-0.5">{shape.reversal}</p>
                  </div>
                  <div>
                    <strong className="font-ui text-[10px] uppercase text-atelier-paper/50 block font-mono">Closing Image</strong>
                    <p className="mt-0.5">{shape.closingImage}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-atelier-elevated flex items-center justify-between">
                <span className="text-xs font-mono text-atelier-teal">
                  {isSelected ? '✓ SELECTED ARCHITECTURE' : 'Click to select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
