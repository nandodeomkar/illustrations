# Pivot Blueprint Illustrations — Skill Design

- **Date:** 2026-06-12
- **Status:** Approved by user (this revision)
- **Skill name:** `pivot-blueprint-illustrations`
- **Location:** `~/.claude/skills/pivot-blueprint-illustrations/`

## Purpose

A Claude Code skill that generates 16:9 blueprint-style explainer illustrations for English articles, blog posts, and concept explainers. It is a sibling of `ian-xiaohei-illustrations` with a different visual identity and one structural difference: every illustration is an **animation-ready, logically layered SVG** intended to be imported into Remotion and animated component by component.

## Goals

1. Consistent "cyanotype blueprint" visual style across all outputs.
2. A fixed mascot IP (**Pivot**, a living drafting compass) that performs the core action in every image.
3. Every output SVG follows a strict layer/group contract so each visual part can be independently animated in Remotion.
4. A handoff reference that documents how to consume the SVGs in Remotion.

## Non-goals

- No raster generation. The `image_gen` path was considered and **dropped**: raster output cannot be animated per-component, which is the primary downstream use.
- The skill does not produce animations itself. It produces static, animation-ready SVGs plus a handoff guide; animation happens in the user's Remotion project.
- No multi-language annotation support. Annotations are English-only.

## Section 1 — Style DNA ("Cyanotype Blueprint")

- 16:9 landscape illustration, `viewBox="0 0 1920 1080"` (matches the standard Remotion composition size).
- **Background:** solid deep blueprint blue. Flat — no gradients, photos, renders, or paper textures. A faint drafting grid (low-opacity lines) is the only permitted background texture.
- **Line work:** thin white/off-white technical lines with a hand-drawn quality (wobble baked into path geometry, never via filters). Not CAD-perfect, not sloppy.
- **Accent colors** (maximum 2 accents per image):
  - **Red** — redline emphasis: problems, key callouts, corrections (real drafting "redlining" convention).
  - **Amber/yellow** — flow, motion, arrows, movement from A to B.
- **Color tokens** (single source of truth lives in `svg-recipes.md`):
  | Token | Use | Value |
  |---|---|---|
  | `bg-blue` | background | `#143A66` |
  | `grid-blue` | faint grid | `#FFFFFF` at 6% opacity |
  | `line-white` | primary line work and text | `#F2F6FA` |
  | `redline` | emphasis accent | `#E5484D` |
  | `amber` | flow accent | `#FFB224` |
- **Blueprint furniture**, used sparingly (maximum 3 items per image): small corner title block, dimension lines with absurd measurements ("3 coffees wide"), "DETAIL A" labels, stamps (APPROVED / REV 2 / VOID).
- **Composition rules:** one core structure/metaphor per image; at least 35% quiet space; 5–8 English annotations in drafting-caps hand lettering, 2–8 words each; no genre titles in the top-left corner ("Workflow", "Architecture", etc.).
- **Tone:** absurd-but-precise. Serious engineering drawing of a ridiculous-but-apt metaphor. Never cute, never corporate.
- **Font:** "Architects Daughter" (Google Fonts) with a `cursive` fallback stack — loadable in Remotion via `@remotion/google-fonts`.

## Section 2 — Pivot, the mascot IP

- **Form:** a living drafting compass drawn in white outline. Hinge head with two white dot eyes; one needle leg, one pencil leg. Blank, calm, serious expression. No mouth, or a single tiny neutral line.
- **Personality:** a meticulous site engineer of ideas. Measures everything, including unmeasurable things — that is the absurdity engine. Cold humor, zero cuteness.
- **Action library:** pins its needle leg and swings an arc around the key concept; measures the gap between two things; walks divider-style along a path; redlines a mistake with its pencil leg; props itself up as a bridge; marks a center point; stands tilted reading a dimension.
- **Hard rule — the remove-Pivot test:** if the metaphor still works with Pivot removed, the composition fails; redo it with Pivot as the actor.
- **Forbidden:** cute styling, clothes, expressive eyebrows, turning into a generic robot, standing idle in a corner as decoration.

## Section 3 — SVG authoring contract (core of the skill)

Every illustration is a layered SVG built for per-component animation.

### Layer schema (fixed top-level groups, stable kebab-case ids)

```xml
<svg viewBox="0 0 1920 1080">
  <g id="bg">           <!-- blue fill + faint grid -->
  <g id="furniture">    <!-- title block, stamps; each child its own group -->
  <g id="structure">    <!-- core diagram; every logical part a named subgroup:
                             e.g. g#trunk, g#canopy, g#root-unions -->
  <g id="flows">        <!-- arrows/paths meant for draw-on animation -->
  <g id="pivot">        <!-- mascot; subgroups: #pivot-body, #pivot-needle-leg,
                             #pivot-pencil-leg, #pivot-eyes -->
  <g id="annotations">  <!-- each note its own group: g#note-1, g#note-2, ... -->
</svg>
```

Top-level groups always appear in this order (paint order = z-order). Empty groups may be omitted except `bg` and `structure`, which are mandatory.

### Animation-ready rules

1. Each group is positioned via `transform="translate(x y)"` and its children are drawn in **local coordinates around the group's own origin**, so Remotion can scale/rotate/spring each part around its natural pivot point without extra math.
2. Every stroke intended for draw-on animation carries `pathLength="1"` — draw-on becomes `strokeDashoffset: 1 → 0`.
3. Hint attributes: `data-anim="draw|fade|pop|slide"` on animatable groups, `data-order="1..n"` for stagger sequencing.
4. **No `<style>` blocks, no filters, no `<image>` elements.** Hand-drawn wobble is baked into path geometry. Presentation attributes only. This keeps SVGR/React conversion clean and geometry stable under transforms.
5. Text stays as `<text>` elements (editable), font "Architects Daughter".
6. Ids are unique and kebab-case throughout; no visible element sits loose at the SVG root.

## Section 4 — Skill structure

```
~/.claude/skills/pivot-blueprint-illustrations/
  SKILL.md                   # trigger, workflow, output expectations
  references/
    style-dna.md             # Section 1 content, expanded
    pivot-ip.md              # Section 2 content, expanded
    composition-patterns.md  # structure types, original-metaphor method, no-copying rule
    svg-authoring.md         # Section 3 contract: layer schema, naming, animation rules
    svg-recipes.md           # component library: color tokens, grid, title block, stamps,
                             #   dimension lines, Pivot poses — each a <g> at local origin
    remotion-handoff.md      # consuming the SVG: SVGR conversion, data-anim → spring/
                             #   interpolate presets, draw-on snippet, stagger by data-order
    qa-checklist.md          # post-generation checks (style + SVG contract)
  assets/examples/           # starts empty; fill with strong outputs over time
```

References are loaded per task, not all at once (same discipline as the original skill).

## Section 5 — Workflow (SKILL.md)

1. **Digest content** — read the article/topic; extract core claims, turning points, and which parts deserve images. Do not illustrate evenly; pick cognitive anchors.
2. **Shot list first** — if the user asks for strategy/analysis, output a shot list (placement, theme, core meaning, structure type, Pivot's action, suggested elements, suggested annotations). Default 4–8 images; 1–3 for short pieces; avoid exceeding 9.
3. **Generate one SVG per image** — when the user asks to generate, write each illustration as a standalone `.svg` file following the authoring contract. Never combine multiple images into one file. Render an inline preview when a preview surface is available.
4. **QA pass** — run `qa-checklist.md`: style checks (solid blue bg, ≤2 accents, Pivot is core actor, ≤8 annotations, ≤3 furniture items, one structure, not CAD-dense) plus contract checks (every part in a named group, unique kebab-case ids, local-origin groups pass the rotate test, `pathLength="1"` on flow/structure strokes, no `<style>`/filters/`<image>`).
5. **Save and deliver** — save to `assets/<article-slug>-illustrations/` numbered `01-topic.svg`, `02-topic.svg`. Report: how many images, each one's purpose, save paths, which are strongest.

Each generation invents a fresh metaphor from the current content. Examples in `assets/examples/` are calibration only — never copy their compositions.

## Section 6 — Remotion handoff (remotion-handoff.md outline)

- Import options: SVGR (SVG → React component, recommended) or inline JSX paste; ids become stable component handles.
- Preset mapping: `data-anim="draw"` → `strokeDashoffset` interpolation; `"fade"` → opacity spring; `"pop"` → scale spring around the group's local origin; `"slide"` → translate interpolation.
- Stagger: sort groups by `data-order`, offset each by N frames.
- Includes a minimal working code snippet (one group, one draw-on, one spring) and a note on loading "Architects Daughter" via `@remotion/google-fonts`.

## Testing / acceptance

1. Build the skill files, then generate one sample illustration end-to-end with the new skill.
2. Acceptance checks on the sample:
   - All QA checklist items pass.
   - Rotate test: applying a rotation to any subgroup spins it around itself, not the canvas corner.
   - The SVG converts through SVGR without warnings (no style blocks, filters, or images to strip).
   - Renders correctly in a browser at 1920×1080.
3. Skill triggers correctly via `/pivot-blueprint-illustrations`.

## Notes

- The working directory (`C:\Users\omkar\Projects\Demo Illustration`) is not a git repository, so the spec is saved without a commit. Initialize git there if version tracking is wanted.
- `assets/examples/` intentionally starts empty; the first strong outputs become the calibration set.
