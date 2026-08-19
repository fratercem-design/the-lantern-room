import { LanternDossier } from '../shared/lanternSchema';

export type WorkflowStage = "spark" | "evidence" | "lenses" | "shape" | "script" | "stage" | "seal";
export type ReviewState = "draft" | "needs-review" | "approved" | "superseded";

export interface AppState {
  stage: WorkflowStage;
  reviewState: ReviewState;
  dossier: LanternDossier | null;
  isGenerating: boolean;
  error: string | null;
  selectedClaimId: string | null;
  selectedShapeId: string | null;
  artifactVersion: number;
  userConfirmed: boolean;
  mobileDrawer: "none" | "cabinet" | "marginalia";
}

export type AppAction =
  | { type: 'SET_STAGE'; payload: WorkflowStage }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: LanternDossier }
  | { type: 'GENERATE_CANCEL' }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'SELECT_CLAIM'; payload: string | null }
  | { type: 'SELECT_SHAPE'; payload: string }
  | { type: 'RESOLVE_WARNING'; payload: string }
  | { type: 'APPROVE_ARTIFACT' }
  | { type: 'REVISE_ARTIFACT' }
  | { type: 'SET_USER_CONFIRMED'; payload: boolean }
  | { type: 'SET_MOBILE_DRAWER'; payload: "none" | "cabinet" | "marginalia" };

export const initialState: AppState = {
  stage: 'spark',
  reviewState: 'draft',
  dossier: null,
  isGenerating: false,
  error: null,
  selectedClaimId: null,
  selectedShapeId: 'shape-1',
  artifactVersion: 1,
  userConfirmed: false,
  mobileDrawer: 'none',
};

export function workflowReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, stage: action.payload, mobileDrawer: 'none' };

    case 'GENERATE_START':
      return { ...state, isGenerating: true, error: null };

    case 'GENERATE_SUCCESS':
      return {
        ...state,
        isGenerating: false,
        dossier: action.payload,
        stage: 'evidence',
        reviewState: 'needs-review',
        artifactVersion: state.dossier ? state.artifactVersion + 1 : 1,
        userConfirmed: false,
        selectedClaimId: null,
        mobileDrawer: 'none',
        error: null
      };

    case 'GENERATE_CANCEL':
      return { ...state, isGenerating: false };

    case 'GENERATE_ERROR':
      return { ...state, isGenerating: false, error: action.payload };

    case 'SELECT_CLAIM':
      return { 
        ...state, 
        selectedClaimId: action.payload,
        // If selecting a claim on mobile, optionally keep track of drawer
      };

    case 'SELECT_SHAPE':
      return { ...state, selectedShapeId: action.payload };

    case 'RESOLVE_WARNING': {
      if (!state.dossier) return state;
      const updatedWarnings = state.dossier.warnings.map(w => 
        w.id === action.payload ? { ...w, resolved: true } : w
      );
      return {
        ...state,
        dossier: {
          ...state.dossier,
          warnings: updatedWarnings
        }
      };
    }

    case 'APPROVE_ARTIFACT':
      return { ...state, reviewState: 'approved' };

    case 'REVISE_ARTIFACT':
      return { ...state, reviewState: 'draft', userConfirmed: false };

    case 'SET_USER_CONFIRMED':
      return { ...state, userConfirmed: action.payload };

    case 'SET_MOBILE_DRAWER':
      return { ...state, mobileDrawer: action.payload };

    default:
      return state;
  }
}
