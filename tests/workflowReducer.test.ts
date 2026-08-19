import { describe, it, expect } from 'vitest';
import { workflowReducer, initialState, AppState } from '../app/workflowReducer';
import { fixtureDossier } from '../fixtures/lanternDossier.fixture';

describe('workflowReducer state transitions', () => {
  it('handles GENERATE_SUCCESS on first generation', () => {
    const state1 = workflowReducer(initialState, { type: 'GENERATE_START' });
    expect(state1.isGenerating).toBe(true);

    const state2 = workflowReducer(state1, { type: 'GENERATE_SUCCESS', payload: fixtureDossier });
    expect(state2.isGenerating).toBe(false);
    expect(state2.dossier).toBeDefined();
    expect(state2.stage).toBe('evidence');
    expect(state2.reviewState).toBe('needs-review');
    expect(state2.artifactVersion).toBe(1);
    expect(state2.userConfirmed).toBe(false);
  });

  it('increments artifactVersion and resets approval/confirmation on regeneration', () => {
    // Start with an approved state
    const approvedState: AppState = {
      ...initialState,
      dossier: fixtureDossier,
      artifactVersion: 1,
      reviewState: 'approved',
      userConfirmed: true
    };

    const nextDossier = { ...fixtureDossier, meta: { ...fixtureDossier.meta, workingTitle: 'Version 2' } };
    const regeneratedState = workflowReducer(approvedState, { type: 'GENERATE_SUCCESS', payload: nextDossier });

    expect(regeneratedState.artifactVersion).toBe(2);
    expect(regeneratedState.reviewState).toBe('needs-review');
    expect(regeneratedState.userConfirmed).toBe(false);
  });

  it('resolves warnings properly', () => {
    const stateWithDossier: AppState = {
      ...initialState,
      dossier: fixtureDossier
    };

    const resolvedState = workflowReducer(stateWithDossier, { type: 'RESOLVE_WARNING', payload: 'WARN-01' });
    const targetWarn = resolvedState.dossier?.warnings.find(w => w.id === 'WARN-01');
    expect(targetWarn?.resolved).toBe(true);
  });

  it('handles APPROVE_ARTIFACT and REVISE_ARTIFACT', () => {
    const stateWithDossier: AppState = {
      ...initialState,
      dossier: fixtureDossier,
      reviewState: 'needs-review'
    };

    const approvedState = workflowReducer(stateWithDossier, { type: 'APPROVE_ARTIFACT' });
    expect(approvedState.reviewState).toBe('approved');

    const revisedState = workflowReducer(approvedState, { type: 'REVISE_ARTIFACT' });
    expect(revisedState.reviewState).toBe('draft');
  });

  it('updates stage and mobile drawer state', () => {
    const stageState = workflowReducer(initialState, { type: 'SET_STAGE', payload: 'lenses' });
    expect(stageState.stage).toBe('lenses');
    expect(stageState.mobileDrawer).toBe('none');

    const drawerState = workflowReducer(initialState, { type: 'SET_MOBILE_DRAWER', payload: 'cabinet' });
    expect(drawerState.mobileDrawer).toBe('cabinet');
  });
});
