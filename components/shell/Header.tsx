import React from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { PrototypeNotice } from '../common/PrototypeNotice';
import { Menu, BookOpen, AlertTriangle } from 'lucide-react';

export const Header: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const unresolvedBlocking = state.dossier?.warnings.filter(w => w.severity === 'blocking' && !w.resolved).length || 0;

  return (
    <header className="h-14 border-b border-atelier-elevated bg-atelier-surface px-4 md:px-6 flex justify-between items-center shrink-0 z-40">
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Mobile Drawer Trigger (Cabinet) */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_MOBILE_DRAWER', payload: state.mobileDrawer === 'cabinet' ? 'none' : 'cabinet' })}
          className="md:hidden p-1.5 rounded border border-atelier-elevated bg-atelier-bg text-atelier-paper hover:text-atelier-lilac"
          aria-label="Toggle Project Cabinet navigation drawer"
          aria-expanded={state.mobileDrawer === 'cabinet'}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div 
            className={`w-2.5 h-2.5 rounded-full ${state.isGenerating ? 'bg-atelier-lilac animate-pulse shadow-[0_0_8px_#B69CFF]' : 'bg-atelier-elevated'}`}
            aria-hidden="true"
          />
          <div>
            <h1 className="font-serif tracking-widest text-sm md:text-base text-atelier-paper leading-none">
              THE LANTERN ROOM
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Persistent Prototype Disclosure */}
        <PrototypeNotice condensed={true} />

        {/* Version & Review State Badges */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
          <span className="text-atelier-teal px-2 py-0.5 rounded border border-atelier-elevated bg-atelier-bg">
            v{state.artifactVersion}.0
          </span>
          <span className={`px-2 py-0.5 rounded border ${
            state.reviewState === 'approved' ? 'border-atelier-teal text-atelier-teal bg-atelier-teal/10' :
            state.reviewState === 'needs-review' ? 'border-atelier-gold text-atelier-gold bg-atelier-gold/10' :
            'border-atelier-elevated text-atelier-paper bg-atelier-bg'
          }`}>
            {state.reviewState.toUpperCase()}
          </span>
        </div>

        {/* Mobile Drawer Trigger (Marginalia) */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_MOBILE_DRAWER', payload: state.mobileDrawer === 'marginalia' ? 'none' : 'marginalia' })}
          className="md:hidden relative p-1.5 rounded border border-atelier-elevated bg-atelier-bg text-atelier-paper hover:text-atelier-lilac"
          aria-label="Toggle Marginalia inspector drawer"
          aria-expanded={state.mobileDrawer === 'marginalia'}
        >
          <BookOpen className="w-4 h-4" />
          {unresolvedBlocking > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-atelier-carmine text-atelier-bg text-[9px] font-mono rounded-full flex items-center justify-center font-bold">
              {unresolvedBlocking}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
