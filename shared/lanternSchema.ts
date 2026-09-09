import { z } from 'zod';

export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceType: z.enum(["pdf", "video", "audio", "web", "primary_text", "image"]),
  citation: z.string(),
  url: z.string().url().optional(),
  credibilityScore: z.number().min(1).max(5),
  keyPoints: z.array(z.string()),
  verificationState: z.enum(["fixture", "unverified", "grounded"]).default("fixture")
});

export const claimSchema = z.object({
  id: z.string(),
  text: z.string(),
  status: z.enum(["supported", "contested", "interpretive", "needs-source"]),
  sourceIds: z.array(z.string()),
  confidenceNote: z.string(),
  reviewed: z.boolean().default(false)
});

export const lensCardSchema = z.object({
  type: z.enum(["historical", "psychological", "mythic", "theological", "coercion-watch"]),
  title: z.string(),
  body: z.string(),
  keyPoints: z.array(z.string()),
  pinned: z.boolean().optional()
});

export const episodeShapeSchema = z.object({
  id: z.string(),
  title: z.string(),
  archetype: z.enum(["narrative_mystery", "case_file", "myth_vs_reality"]),
  coldOpen: z.string(),
  centralQuestion: z.string(),
  escalation: z.string(),
  reversal: z.string(),
  emotionalBeat: z.string(),
  takeaway: z.string(),
  closingImage: z.string(),
  estimatedRuntimeMinutes: z.number()
});

export const scriptBlockSchema = z.object({
  id: z.string(),
  section: z.string(),
  narration: z.string(),
  visualCue: z.string(),
  tone: z.string(),
  sourceIds: z.array(z.string()),
  isComedyBeat: z.boolean().optional()
});

export const thumbnailConceptSchema = z.object({
  id: z.string(),
  concept: z.string(),
  visualPrompt: z.string(),
  textOverlay: z.string(),
  composition: z.string()
});

export const shotListItemSchema = z.object({
  timecode: z.string(),
  visualIntent: z.string(),
  assetType: z.string(),
  fallback: z.string()
});

export const shortCutdownSchema = z.object({
  id: z.string(),
  hook: z.string(),
  adaptedCopy: z.string(),
  cta: z.string()
});

export const chapterSchema = z.object({
  timestamp: z.string(),
  title: z.string()
});

export const productionArtifactSchema = z.object({
  titles: z.array(z.string()),
  thumbnails: z.array(thumbnailConceptSchema),
  shotList: z.array(shotListItemSchema),
  shortsCutdowns: z.array(shortCutdownSchema),
  description: z.string(),
  chapters: z.array(chapterSchema)
});

export const warningSchema = z.object({
  id: z.string(),
  severity: z.enum(["blocking", "advisory"]),
  message: z.string(),
  relatedClaimIds: z.array(z.string()).default([]),
  resolved: z.boolean().default(false)
});

export const lanternDossierSchema = z.object({
  meta: z.object({
    projectId: z.string(),
    workingTitle: z.string(),
    logline: z.string(),
    generatedAt: z.string(),
    targetFormat: z.string().optional(),
    tone: z.string().optional(),
    // Server-stamped, never model-supplied: the model invents plausible values
    // for these (a live run returned generatedAt "2025-01-15").
    engine: z.string().optional(),
    grounded: z.boolean().optional()
  }),
  sources: z.array(sourceSchema),
  claims: z.array(claimSchema),
  lenses: z.array(lensCardSchema),
  shapes: z.array(episodeShapeSchema),
  script: z.array(scriptBlockSchema),
  production: productionArtifactSchema,
  warnings: z.array(warningSchema).default([])
}).superRefine((data, ctx) => {
  const sourceIds = new Set(data.sources.map(s => s.id));
  const claimIds = new Set<string>();

  // Check duplicate source IDs
  const checkedSources = new Set<string>();
  data.sources.forEach((source, index) => {
    if (checkedSources.has(source.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate source ID: ${source.id}`,
        path: ['sources', index, 'id']
      });
    }
    checkedSources.add(source.id);
  });

  data.claims.forEach((claim, index) => {
    // Duplicate claim ID check
    if (claimIds.has(claim.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate claim ID: ${claim.id}`,
        path: ['claims', index, 'id']
      });
    }
    claimIds.add(claim.id);

    // Source validation rules
    if ((claim.status === 'supported' || claim.status === 'contested') && claim.sourceIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Claim ${claim.id} is marked '${claim.status}' but has no sources.`,
        path: ['claims', index, 'sourceIds']
      });
    }

    // Ensure referenced sources exist
    claim.sourceIds.forEach((sId, sIndex) => {
      if (!sourceIds.has(sId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Claim ${claim.id} references non-existent source: ${sId}`,
          path: ['claims', index, 'sourceIds', sIndex]
        });
      }
    });
  });

  // Ensure warning relatedClaimIds exist in claims
  data.warnings.forEach((warning, wIndex) => {
    warning.relatedClaimIds.forEach((cId, cIndex) => {
      if (!claimIds.has(cId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Warning ${warning.id} references non-existent claim: ${cId}`,
          path: ['warnings', wIndex, 'relatedClaimIds', cIndex]
        });
      }
    });
  });
});

export type Source = z.infer<typeof sourceSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type LensCard = z.infer<typeof lensCardSchema>;
export type EpisodeShape = z.infer<typeof episodeShapeSchema>;
export type ScriptBlock = z.infer<typeof scriptBlockSchema>;
export type ProductionArtifact = z.infer<typeof productionArtifactSchema>;
export type Warning = z.infer<typeof warningSchema>;
export type LanternDossier = z.infer<typeof lanternDossierSchema>;
