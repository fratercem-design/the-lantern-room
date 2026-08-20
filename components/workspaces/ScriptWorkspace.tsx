import React, { useState } from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { Smile, Eye, BookOpen, Edit3, Check } from 'lucide-react';

export const ScriptWorkspace: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const { dossier } = state;
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  if (!dossier) return null;

  const handleStartEdit = (blockId: string, currentText: string) => {
    setEditingBlockId(blockId);
    setEditText(currentText);
  };

  const handleSaveEdit = (blockId: string) => {
    dispatch({
      type: 'UPDATE_SCRIPT_BLOCK',
      payload: { id: blockId, narration: editText }
    });
    setEditingBlockId(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-atelier-elevated pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-atelier-paper">Paced Script</h1>
          <p className="text-xs md:text-sm text-atelier-paper/60 font-reading mt-1">
            Editable narration, evidence anchors, visual directives, and comedy pacing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors ${
              showHeatmap 
                ? 'border-atelier-lilac bg-atelier-lilac/10 text-atelier-lilac' 
                : 'border-atelier-elevated bg-atelier-surface text-atelier-paper/60'
            }`}
          >
            Evidence Heatmap: {showHeatmap ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {showHeatmap && (
        <div className="p-3 rounded border border-atelier-elevated bg-atelier-surface/50 flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <span className="text-atelier-paper/50 uppercase tracking-wider">Heatmap Legend:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-atelier-teal/10 border border-atelier-teal/30 text-atelier-teal">
            ● Cited Sentence
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-atelier-gold/10 border border-atelier-gold/30 text-atelier-gold">
            ● Comedy Beat
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-atelier-surface border border-atelier-elevated text-atelier-paper/80">
            ● Visual Direction
          </span>
        </div>
      )}

      <div className="space-y-6">
        {dossier.script.map((block) => {
          const isEditing = editingBlockId === block.id;

          return (
            <div key={block.id} className="p-5 rounded-lg border border-atelier-elevated bg-atelier-surface space-y-3">
              <div className="flex justify-between items-center border-b border-atelier-elevated pb-2">
                <span className="font-serif text-sm text-atelier-lilac font-medium">{block.section}</span>
                <div className="flex items-center space-x-2">
                  {block.isComedyBeat && (
                    <span className="inline-flex items-center text-[10px] font-mono text-atelier-gold bg-atelier-gold/10 px-2 py-0.5 rounded border border-atelier-gold/30">
                      <Smile className="w-3 h-3 mr-1" /> COMEDY BEAT
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-atelier-paper/50 italic">{block.tone}</span>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(block.id, block.narration)}
                      className="p-1 rounded hover:bg-atelier-elevated text-atelier-paper/50 hover:text-atelier-paper transition-colors"
                      aria-label="Edit script narration"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(block.id)}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-atelier-teal text-atelier-bg text-[10px] font-mono font-bold"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-atelier-bg border border-atelier-lilac rounded p-3 text-sm font-reading text-atelier-paper h-28 resize-none focus:outline-none"
                />
              ) : (
                <p className={`font-reading text-base text-atelier-paper leading-relaxed ${
                  showHeatmap && block.sourceIds.length > 0 ? 'border-l-2 border-atelier-teal/60 pl-3' : ''
                }`}>
                  {block.narration}
                </p>
              )}

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
          );
        })}
      </div>
    </div>
  );
};
