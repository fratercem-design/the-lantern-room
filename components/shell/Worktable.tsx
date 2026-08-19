import React from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { SparkWorkspace } from '../workspaces/SparkWorkspace';
import { EvidenceWorkspace } from '../workspaces/EvidenceWorkspace';
import { LensesWorkspace } from '../workspaces/LensesWorkspace';
import { ShapeWorkspace } from '../workspaces/ShapeWorkspace';
import { ScriptWorkspace } from '../workspaces/ScriptWorkspace';
import { ProductionWorkspace } from '../workspaces/ProductionWorkspace';
import { SealWorkspace } from '../workspaces/SealWorkspace';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';

export const Worktable: React.FC<{ 
  state: AppState; 
  dispatch: React.Dispatch<AppAction>;
  onCancel: () => void;
  onRetry: () => void;
}> = ({ state, dispatch, onCancel, onRetry }) => {
  
  const renderWorkspace = () => {
    if (state.error) {
      return <ErrorState message={state.error} onRetry={onRetry} />;
    }

    if (state.isGenerating) {
      return <LoadingState onCancel={onCancel} />;
    }

    switch (state.stage) {
      case 'spark':
        return <SparkWorkspace state={state} dispatch={dispatch} />;
      case 'evidence':
        return <EvidenceWorkspace state={state} dispatch={dispatch} />;
      case 'lenses':
        return <LensesWorkspace state={state} />;
      case 'shape':
        return <ShapeWorkspace state={state} dispatch={dispatch} />;
      case 'script':
        return <ScriptWorkspace state={state} dispatch={dispatch} />;
      case 'stage':
        return <ProductionWorkspace state={state} />;
      case 'seal':
        return <SealWorkspace state={state} dispatch={dispatch} />;
      default:
        return <SparkWorkspace state={state} dispatch={dispatch} />;
    }
  };

  return (
    <main className="flex-1 bg-atelier-bg overflow-y-auto custom-scrollbar relative">
      {renderWorkspace()}
    </main>
  );
};
