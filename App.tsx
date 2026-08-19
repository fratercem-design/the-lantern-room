import React, { useReducer, useRef, useEffect } from 'react';
import { workflowReducer, initialState } from './app/workflowReducer';
import { FixtureDossierProvider } from './services/fixtureDossierProvider';
import { Header } from './components/shell/Header';
import { Cabinet } from './components/shell/Cabinet';
import { Worktable } from './components/shell/Worktable';
import { Marginalia } from './components/shell/Marginalia';

const provider = new FixtureDossierProvider(1000);

export default function App() {
  const [state, dispatch] = useReducer(workflowReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (topic: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: 'GENERATE_START' });
    try {
      const dossier = await provider.generateDossier({ topic }, { signal: controller.signal });
      dispatch({ type: 'GENERATE_SUCCESS', payload: dossier });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        dispatch({ type: 'GENERATE_CANCEL' });
      } else {
        dispatch({ type: 'GENERATE_ERROR', payload: error.message || "Failed to synthesize dossier." });
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Close mobile drawers on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'SET_MOBILE_DRAWER', payload: 'none' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-atelier-bg text-atelier-paper font-ui overflow-hidden">
      <Header state={state} dispatch={dispatch} />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Cabinet */}
        <div className="hidden md:flex h-full">
          <Cabinet 
            state={state} 
            dispatch={dispatch} 
            onGenerate={handleGenerate}
            onCancel={handleCancel}
          />
        </div>

        {/* Central Worktable */}
        <Worktable 
          state={state} 
          dispatch={dispatch} 
          onCancel={handleCancel}
          onRetry={() => handleGenerate("Why do charismatic communities confuse intensity with intimacy?")}
        />

        {/* Desktop Marginalia */}
        <div className="hidden md:flex h-full">
          <Marginalia state={state} dispatch={dispatch} />
        </div>

        {/* Mobile Slide-over Drawer for Cabinet */}
        {state.mobileDrawer === 'cabinet' && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => dispatch({ type: 'SET_MOBILE_DRAWER', payload: 'none' })}
            />
            <div className="relative w-4/5 max-w-xs h-full bg-atelier-bg z-10 shadow-2xl">
              <Cabinet 
                state={state} 
                dispatch={dispatch} 
                onGenerate={handleGenerate}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        {/* Mobile Slide-over Drawer for Marginalia */}
        {state.mobileDrawer === 'marginalia' && (
          <div className="md:hidden fixed inset-0 z-50 flex justify-end">
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => dispatch({ type: 'SET_MOBILE_DRAWER', payload: 'none' })}
            />
            <div className="relative w-4/5 max-w-sm h-full bg-atelier-bg z-10 shadow-2xl">
              <Marginalia state={state} dispatch={dispatch} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
