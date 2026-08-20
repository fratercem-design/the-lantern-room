import React, { useState } from 'react';
import { AppState, AppAction } from '../../app/workflowReducer';
import { ShieldCheck, Download, AlertTriangle, FileText, Check, Copy } from 'lucide-react';

export const SealWorkspace: React.FC<{ state: AppState; dispatch: React.Dispatch<AppAction> }> = ({ state, dispatch }) => {
  const { dossier, reviewState, userConfirmed, artifactVersion, stage, selectedShapeId } = state;
  const [copiedDocs, setCopiedDocs] = useState(false);

  if (!dossier) return null;

  const blockingWarnings = dossier.warnings.filter(w => w.severity === 'blocking' && !w.resolved);
  const hasBlockingWarnings = blockingWarnings.length > 0;

  const canApprove = !hasBlockingWarnings && reviewState !== 'approved';
  const canDownload = !hasBlockingWarnings && reviewState === 'approved' && userConfirmed;

  const handleApprove = () => {
    dispatch({ type: 'APPROVE_ARTIFACT' });
  };

  const handleCopyDocsPackage = () => {
    const selectedShape = dossier.shapes.find(s => s.id === selectedShapeId) || dossier.shapes[0];

    const lines: string[] = [];
    lines.push("# " + dossier.meta.workingTitle);
    lines.push("*Cult of Psyche Production Package · Version " + artifactVersion + ".0 · " + new Date().toISOString() + "*");
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## Executive Summary & Metadata");
    lines.push("- **Project ID:** " + dossier.meta.projectId);
    lines.push("- **Logline:** " + dossier.meta.logline);
    lines.push("- **Target Format:** " + (dossier.meta.targetFormat || "20–30 min Deep Dive"));
    lines.push("- **Editorial Tone:** " + (dossier.meta.tone || "Academic-Occult / Darkly Inquisitive"));
    lines.push("- **Review State:** " + reviewState.toUpperCase());
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 1. Grounded Claim Ledger");
    dossier.claims.forEach(c => {
      lines.push("### [" + c.status.toUpperCase() + "] " + c.id);
      lines.push(c.text);
      lines.push("- **Sources:** " + (c.sourceIds.length > 0 ? c.sourceIds.join(', ') : 'Needs verifiable citation'));
      lines.push("- **Confidence Note:** " + (c.confidenceNote || 'None'));
      lines.push("");
    });
    lines.push("---");
    lines.push("");
    lines.push("## 2. Source Bibliography & Grounding Index");
    dossier.sources.forEach(s => {
      lines.push("### [" + s.id + "] " + s.title + " (" + s.sourceType.toUpperCase() + ")");
      lines.push("- **Citation:** " + s.citation);
      lines.push("- **URL:** " + (s.url || 'Primary Physical/Archival Text'));
      lines.push("- **Credibility:** " + s.credibilityScore + "/5 | **Status:** " + s.verificationState.toUpperCase());
      lines.push("- **Key Points:**");
      s.keyPoints.forEach(kp => lines.push("  - " + kp));
      lines.push("");
    });
    lines.push("---");
    lines.push("");
    lines.push("## 3. Lens Matrix (Editorial Perspective Separation)");
    dossier.lenses.forEach(l => {
      lines.push("### " + l.type.toUpperCase() + " LENS: " + l.title);
      lines.push(l.body);
      lines.push("**Key Points:** " + l.keyPoints.join('; '));
      lines.push("");
    });
    lines.push("---");
    lines.push("");
    lines.push("## 4. Selected Episode Architecture: " + selectedShape.title);
    lines.push("- **Archetype:** " + selectedShape.archetype.replace(/_/g, ' ').toUpperCase());
    lines.push("- **Estimated Runtime:** ~" + selectedShape.estimatedRuntimeMinutes + " minutes");
    lines.push("- **Cold Open:** " + selectedShape.coldOpen);
    lines.push("- **Central Question:** " + selectedShape.centralQuestion);
    lines.push("- **Escalation:** " + selectedShape.escalation);
    lines.push("- **Reversal:** " + selectedShape.reversal);
    lines.push("- **Emotional Beat:** " + selectedShape.emotionalBeat);
    lines.push("- **Takeaway:** " + selectedShape.takeaway);
    lines.push("- **Closing Image:** " + selectedShape.closingImage);
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 5. Paced Production Script");
    dossier.script.forEach(s => {
      lines.push("### " + s.section);
      lines.push("*Tone: " + s.tone + (s.isComedyBeat ? ' | [COMEDY BEAT]' : '') + "*");
      lines.push(s.narration);
      lines.push("");
      lines.push("- **VISUAL DIRECTION:** " + s.visualCue);
      lines.push("- **CITATIONS:** " + (s.sourceIds.join(', ') || 'Uncited commentary'));
      lines.push("");
    });
    lines.push("---");
    lines.push("");
    lines.push("## 6. Title Concepts (Scored Editorial Rubric)");
    dossier.production.titles.forEach((t, i) => {
      lines.push((i + 1) + ". " + t);
    });
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 7. Thumbnail Visual Directives");
    dossier.production.thumbnails.forEach(th => {
      lines.push("### Concept: " + th.concept);
      lines.push("- **Overlay Text:** \"" + th.textOverlay + "\"");
      lines.push("- **Composition:** " + th.composition);
      lines.push("- **Visual Generation Prompt:** " + th.visualPrompt);
      lines.push("");
    });
    lines.push("---");
    lines.push("");
    lines.push("## 8. Shot List & Visual Pacing");
    dossier.production.shotList.forEach(sh => {
      lines.push("- **" + sh.timecode + ":** " + sh.visualIntent + " [Asset: " + sh.assetType + " | Fallback: " + sh.fallback + "]");
    });
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 9. Shorts / Reels Adaptations");
    dossier.production.shortsCutdowns.forEach(sc => {
      lines.push("### Short: " + sc.hook);
      lines.push("- **Adapted Script:** " + sc.adaptedCopy);
      lines.push("- **CTA:** " + sc.cta);
      lines.push("");
    });
    lines.push("---");
    lines.push("");
    lines.push("## 10. YouTube Publication Package");
    lines.push("### Description");
    lines.push(dossier.production.description);
    lines.push("");
    lines.push("### Chapter Markers");
    dossier.production.chapters.forEach(ch => {
      lines.push(ch.timestamp + " - " + ch.title);
    });

    const fullPackageText = lines.join('\n');
    navigator.clipboard.writeText(fullPackageText);
    setCopiedDocs(true);
    setTimeout(() => setCopiedDocs(false), 3000);
  };

  const handleDownload = () => {
    if (!canDownload) return;

    const exportPackage = {
      prototype: state.providerMode === 'fixture',
      provider: state.providerMode,
      artifactVersion,
      reviewState,
      exportedAt: new Date().toISOString(),
      workflowStage: stage,
      dossier
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPackage, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "Lantern_Dossier_" + dossier.meta.projectId + "_v" + artifactVersion + ".json");
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
          Final review gate before artifact packaging, Google Docs handoff, and JSON backup.
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
              {blockingWarnings.length} unresolved blocking warning{blockingWarnings.length === 1 ? '' : 's'} remain in Marginalia. Clear them before approving this version.
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
                I reviewed this production package.
              </span>
              <p className="text-xs text-atelier-paper/50 font-reading mt-0.5">
                I confirm that claims are properly sourced, lenses are separated, and the script aligns with editorial standards.
              </p>
            </div>
          </label>
        </div>

        <div className="space-y-3 pt-2 border-t border-atelier-elevated">
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-atelier-lilac">
            3. Export Packages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyDocsPackage}
              className="py-3 px-4 rounded border border-atelier-elevated bg-atelier-bg hover:border-atelier-lilac text-xs font-ui text-atelier-paper flex items-center justify-center space-x-2 transition-colors"
            >
              {copiedDocs ? (
                <>
                  <Check className="w-4 h-4 text-atelier-teal" />
                  <span className="text-atelier-teal font-semibold">Copied Google Docs Package!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-atelier-lilac" />
                  <span>Google Docs–Ready Clipboard Package</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload}
              className={`py-3 px-4 rounded font-ui text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-2 ${
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
    </div>
  );
};
