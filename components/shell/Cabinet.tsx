import React, { useState, useEffect } from 'react';
import { Search, Upload, FolderOpen, Activity, X } from 'lucide-react';
import { AppState, AppAction, WorkflowStage } from '../../app/workflowReducer';

interface CabinetProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  onGenerate: (topic: string) => void;
  onCancel: () => void;
}

export const Cabinet: React.FC<CabinetProps> = ({ state, dispatch, onGenerate, onCancel }) => {
  const [topic, setTopic] = useState('Why do charismatic communities confuse intensity with intimacy?');

  const handleGenerate = () => {
    if (topic.trim() && !state.isGenerating) {
      onGenerate(topic);
    }
  };

  const stages: { id: WorkflowStage; label: string; numeral: string }[] = [
    { id: 'spark', label: 'Spark & Intake', numeral: 'I' },
    { id: 'evidence', label: 'Evidence Ledger', numeral: 'II' },
    { id: 'lenses', label: 'Lens Matrix', numeral: 'III' },
    { id: 'shape', label: 'Episode Shape', numeral: 'IV' },
    { id: 'script', label: 'Paced Script', numeral: 'V' },
    { id: 'stage', label: 'Production Stage', numeral: 'VI' },
    { id: 'seal', label: 'Production Seal', numeral: 'VII' }
  ];

  return (
    <aside className="w-72 border-r border-atelier-elevated bg-atelier-bg flex flex-col h-full shrink-0">
      {/* Mobile Drawer Header */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-atelier-elevated">
        <span className="font-serif text-sm text-atelier-paper">The Cabinet</span>
        <button
          onClick={() => dispatch({ type: 'SET_MOBILE_DRAWER', payload: 'none' })}
          className="text-atelier-paper/60 hover:text-atelier-paper"
          aria-label="Close Cabinet drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 border-b border-atelier-elevated">
        <h2 className="font-ui text-xs font-semibold tracking-wider text-atelier-lilac uppercase mb-3 flex items-center">
          <FolderOpen className="w-3.5 h-3.5 mr-2" />
          Active Project
        </h2>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="research-topic" className="block text-[11px] font-mono text-atelier-paper/60 mb-1">
              Research Question
            </label>
            <textarea
              id="research-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter research topic or question..."
              className="w-full bg-atelier-surface border border-atelier-elevated rounded p-2.5 text-xs text-atelier-paper focus:outline-none focus:border-atelier-lilac h-20 resize-none font-reading custom-scrollbar"
            />
          </div>
          
          {/* Mock Upload Boundary */}
          <div className="p-2.5 rounded border border-atelier-elevated border-dashed bg-atelier-surface/40 text-center cursor-not-allowed">
            <Upload className="w-3.5 h-3.5 text-atelier-paper/40 mx-auto mb-1" />
            <p className="text-[10px] font-mono text-atelier-paper/50">Demo input — file contents not uploaded</p>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={state.isGenerating || !topic.trim()}
              className="flex-1 py-2 rounded font-ui text-xs font-medium tracking-wide transition flex items-center justify-center space-x-2 bg-atelier-elevated text-atelier-paper hover:bg-atelier-lilac hover:text-atelier-bg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {state.isGenerating ? (
                <span className="animate-pulse">Synthesizing...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Generate Dossier</span>
                </>
              )}
            </button>

            {state.isGenerating && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded font-ui text-xs font-medium border border-atelier-carmine/50 text-atelier-carmine hover:bg-atelier-carmine/10"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
        <h2 className="font-ui text-xs font-semibold tracking-wider text-atelier-lilac uppercase mb-3 flex items-center">
          <Activity className="w-3.5 h-3.5 mr-2" />
          Ritual Sequence
        </h2>
        <nav className="space-y-1">
          {stages.map((s) => {
            const isActive = state.stage === s.id;
            const isAvailable = state.dossier !== null || s.id === 'spark';

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: s.id })}
                disabled={!isAvailable}
                className={`w-full text-left px-3 py-2 rounded text-xs font-ui transition-colors flex items-center justify-between ${
                  isActive 
                    ? 'bg-atelier-surface text-atelier-lilac border border-atelier-elevated font-semibold' 
                    : isAvailable
                      ? 'text-atelier-paper/70 hover:text-atelier-paper hover:bg-atelier-surface/50'
                      : 'text-atelier-paper/30 cursor-not-allowed'
                }`}
              >
                <span className="truncate">{s.label}</span>
                <span className="font-serif text-[10px] text-atelier-paper/40 ml-2">{s.numeral}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
