# The Lantern Room · Cult of Psyche Atelier

A private, full-stack research-to-episode editorial atelier for *Cult of Psyche*.
Turns research questions into grounded claim ledgers, separated interpretive lenses, 3 distinct episode structures, paced scripts, shot lists, thumbnail concepts, and production handoffs.

- **Canonical Production URL:** [the-lantern-room.vercel.app](https://the-lantern-room.vercel.app/)
- **GitHub Repository:** [github.com/fratercem-design/the-lantern-room](https://github.com/fratercem-design/the-lantern-room)

---

## Key Features

1. **Dual-Mode Synthesis Engine**:
   - **Curated Fixture Archive Mode**: Instant, deterministic offline demonstration mode using curated Gnosticism & simulation theory fixtures. Consumes zero API quota.
   - **Live Grounded AI Mode**: Queries server-side Gemini 2.5 Flash via `/api/dossiers` with live Google Search Grounding for real-time web citations.
2. **Grounded Evidence Ledger**:
   - Explicit claim status: `supported`, `contested`, `interpretive`, or `needs-source`.
   - Linked source inspection with credibility scoring and verification badges.
3. **Strict Lens Matrix**:
   - Distinct, unblended separation of Historical, Psychological, Mythic, Theological, and Coercion-Watch perspectives.
4. **Interactive Paced Script Editor**:
   - In-place narration editing, comedy beat highlights, visual cues, and Evidence Heatmap overlay.
5. **Decoupled 3-Step Approval Gate**:
   - Version Approval -> Review Confirmation -> Export Handoff.
6. **Google Docs–Ready Clipboard Package**:
   - Formats the complete dossier (metadata, warnings, claims ledger, full bibliography, lenses, selected architecture, script with visual cues, shot lists, 10 scored titles, thumbnail visual prompts, and YouTube metadata) into structured markdown/rich text ready for Google Docs.
7. **Mobile Atelier**:
   - Responsive layout at 390x844 where the center Worktable remains primary, with accessible slide-over drawers for Cabinet and Marginalia.

---

## Local Development & Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run typechecking
npm run typecheck

# 4. Run automated test suite (Vitest)
npm test

# 5. Build production bundle
npm run build

# 6. Preview production build
npm run preview
```

---

## Environment Configuration

| Variable | Required in Live Mode | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Yes** (server-only) | Google AI Studio API Key |
| `GEMINI_DOSSIER_MODEL` | Optional | Model identifier (defaults to `gemini-2.5-flash`) |

> **Security Note:** `GEMINI_API_KEY` is read exclusively on the server runtime in `api/dossiers.ts`. It is never bundled into or accessible by client-side browser code.