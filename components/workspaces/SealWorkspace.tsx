import React from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { ShieldCheck, Download, AlertTriangle, CheckCircle2, FileJson } from 'lucide-react';

export const SealWorkspace: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const { dossier, reviewState, userConfirmed, artifactVersion, stage } = state;

  if (!dossier) return null;

  const blockingWarnings = dossier.warnings.filter(w => w.severity === 'blocking' && !w.resolved);
  const hasBlockingWarnings = blockingWarnings.length > 0;

  const canApprove = !hasBlockingWarnings && reviewState !== 'approved';
  const canDownload = !hasBlockingWarnings && reviewState === 'approved' && userConfirmed;

  const handleApprove = () => {
    dispatch({ type: 'APPROVE_ARTIFACT' });
  };

  const handleDownload = () => {
    if (!canDownload) return;

    const exportPackage = {
      prototype: true,
      provider: "fixture",
      artifactVersion,
      reviewState,
      exportedAt: new Date().toISOString(),
      workflowStage: stage,
      dossier
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPackage, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Lantern_Dossier_${dossier.meta.projectId}_v${artifactVersion}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="border-b border-atelier-elevated pb-4 text-center">
        <ShieldCheck className="w-12 h-12 text-atelier-lilac mx-auto mb-3" />
        <h1 className="font-serif text-3xl text-atelier-paper">Production Seal</h1>
        <p className="text-sm text-atelier-paper/60 font-reading mt-1">
          Final review gate before artifact packaging and JSON backup.
        </p>
      </div>

      {hasBlockingWarnings && (
        <div className="p-4 rounded border border-atelier-carmine/50 bg-atelier-carmine/10 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-atelier-carmine shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-ui font-semibold text-atelier-carmine">
              Blocking Warnings Require Resolution
            </h3>
            <p className="text-xs text-atelier-paper/80 font-reading">
              {blockingWarnings.length} unresolved blocking warning{blockingWarnings.length === 1 ? '' : 's'} remain in Marginalia. Use the "Resolve / Exclude" action in Marginalia to clear them before approval.
            </p>
          </div>
        </div>
      )}

      <div className="p-6 rounded-lg border border-atelier-elevated bg-atelier-surface space-y-6">
        <div className="space-y-3">
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-atelier-lilac">
            1. Version Approval Status
          </h3>
          <div className="flex items-center justify-between p-3 border border-atelier-elevated rounded bg-atelier-bg">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-mono text-atelier-paper">Version {artifactVersion}.0</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                reviewState === 'approved' 
                  ? 'border-atelier-teal text-atelier-teal bg-atelier-teal/10'
                  : 'border-atelier-gold text-atelier-gold bg-atelier-gold/10'
              }`}>
                {reviewState.toUpperCase()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleApprove}
              disabled={!canApprove}
              className={`px-4 py-1.5 rounded text-xs font-ui font-semibold transition ${
                canApprove
                  ? 'bg-atelier-teal text-atelier-bg hover:bg-[#6ee7b7]'
                  : 'bg-atelier-elevated text-atelier-paper/30 cursor-not-allowed'
              }`}
            >
              {reviewState === 'approved' ? '✓ Version Approved' : 'Approve Current Version'}
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-atelier-elevated">
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-atelier-lilac">
            2. Review Confirmation
          </h3>
          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className="pt-0.5">
              <input 
                type="checkbox" 
                checked={userConfirmed}
                onChange={(e) => dispatch({ type: 'SET_USER_CONFIRMED', payload: e.target.checked })}
                disabled={hasBlockingWarnings}
                className="w-4 h-4 rounded border-atelier-elevated bg-atelier-bg text-atelier-lilac focus:ring-atelier-lilac focus:ring-offset-atelier-surface disabled:opacity-40"
              />
            </div>
            <div>
              <span className="text-sm font-ui font-medium text-atelier-paper group-hover:text-atelier-lilac transition-colors">
                I reviewed this prototype package.
              </span>
              <p className="text-xs text-atelier-paper/50 font-reading mt-0.5">
                I confirm that claims are properly sourced, lenses are separated, and the tone aligns with editorial standards.
              </p>
            </div>
          </label>
        </div>

        <div className="space-y-3 pt-2 border-t border-atelier-elevated">
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-atelier-lilac">
            3. Export Execution
          </h3>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!canDownload}
            className={`w-full py-3 rounded font-ui text-sm font-semibold tracking-wide transition flex items-center justify-center space-x-2 ${
              canDownload 
                ? 'bg-atelier-lilac text-atelier-bg hover:bg-[#C8B3FF] shadow-[0_0_20px_rgba(182,156,255,0.25)]' 
                : 'bg-atelier-elevated text-atelier-paper/30 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Production JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
