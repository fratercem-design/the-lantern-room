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

  it('updates provider mode', () => {
    const liveState = workflowReducer(initialState, { type: 'SET_PROVIDER_MODE', payload: 'live' });
    expect(liveState.providerMode).toBe('live');
  });

  it('updates script narration and resets approval', () => {
    const approvedState: AppState = {
      ...initialState,
      dossier: fixtureDossier,
      reviewState: 'approved'
    };

    const targetBlockId = fixtureDossier.script[0].id;
    const editedState = workflowReducer(approvedState, {
      type: 'UPDATE_SCRIPT_BLOCK',
      payload: { id: targetBlockId, narration: 'Edited opening narration.' }
    });

    expect(editedState.reviewState).toBe('needs-review');
    expect(editedState.dossier?.script[0].narration).toBe('Edited opening narration.');
  });
});
