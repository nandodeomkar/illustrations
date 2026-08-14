# Ink Cast Characters — Skill Design

- **Date:** 2026-06-12
- **Status:** Approved by user (this revision)
- **Skill name:** `ink-cast-characters`
- **Location:** `~/.claude/skills/ink-cast-characters/`

## Purpose

A Claude Code skill that turns a reference photo of a real person into a reusable hand-drawn vector character for YouTube videos. It is a sibling of `ian-xiaohei-illustrations` and `pivot-blueprint-illustrations`.

The reference photo supplies **identity only** — face, hair, build, distinguishing features, color palette. **The pose is never taken from the reference unless the user explicitly says "use the reference pose"** (hard rule). Output is transparent-background, full-body, structurally consistent SVG frames built for frame-swap animation in Remotion.

## Goals

1. Recognizable likeness from a reference photo, preserved identically across every frame of a character.
2. Multiple frames per character (different poses) that swap cleanly in Remotion without jitter.
3. Persistent character sheets so a person drawn once stays consistent across sessions and videos.
4. A growable pose library that starts minimal and expands through use.

## Non-goals

- No AI raster generation. Pipeline is hand-authored SVG; chosen so frames can be animated per-part and swapped in Remotion.
- No smooth limb tweening between frames. Frame swaps at low fps read as intentional hand-drawn boil/step animation; that is the aesthetic.
- No scenes, props, or annotations. Frames are compositing assets; scenes are assembled in Remotion (or by the sibling blueprint skill).
- No upfront pose catalog. Library starts with 2 poses and grows on demand.

## Approach decision

Three architectures were considered:

- **A. Full part-rig recomposition** — articulated part library, frames assembled by joint rotation. Rejected: stiff paper-doll poses, breaks on foreshortening/overlap, highest authoring cost.
- **B. Redraw per frame with style lock** — every frame drawn fresh from a written spec. Rejected: likeness drifts frame to frame.
- **C. Hybrid (chosen)** — likeness lives in the face, so the head assembly is copied **verbatim** from the character sheet into every frame (3 stock head angles drawn once); the body is redrawn per pose following the sheet's proportions and palette, under a fixed group schema with a neck anchor.

## Section 1 — Identity & taste

- Subjects are real people. Likeness is recognizable-but-respectful: exaggerate 2–3 signature features (hairline, glasses, beard, eyebrows, jaw) for recognition, simplify everything else, never demeaning caricature.
- Likeness lives in silhouette + signature features. Eyes are simple dots/lines, consistent with sibling-skill DNA.

## Section 2 — Style DNA

- **Line:** dark warm-black ink (`#1F1B16`), hand-drawn wobble baked into path geometry (never via filters), stroke weight ~3–5px at character scale with slight variation.
- **Fill:** flat colors only, no gradients. Per-character palette extracted from the reference photo: skin, hair, 1–2 clothing colors. Max ~5 colors per character, recorded as named tokens with hex values in the character sheet.
- **Background:** transparent, always. No props, no scene, no annotations.
- **Canvas:** fixed per character (e.g., `viewBox="0 0 800 1200"`), identical across every frame of that character. The character's ground contact (feet when standing, seat/feet when sitting) sits on a fixed baseline y. Both constants are recorded in `identity.md` so frame swaps never jitter or rescale.

## Section 3 — Character sheets (persistence)

First request with a new reference photo creates, in the working project:

```text
assets/characters/<person-slug>/
  identity.md          # likeness spec: signature features, proportions (head-heights),
                       #   palette tokens w/ hex, canvas/baseline constants, do/don't notes
  sheet.svg            # model sheet: 3 heads + full-body front + palette swatches (human review surface)
  heads/
    front.svg          # head assembly, local origin = neck joint
    three-quarter-left.svg
    three-quarter-right.svg
  frames/              # generated frames accumulate here
    01-idle.svg
    02-point-left.svg
```

- Heads are drawn **once** at sheet creation, at 3 stock angles (front, 3/4 left, 3/4 right). Every future frame copies head geometry verbatim from `heads/` — only the outer transform changes. This is the likeness guarantee.
- `identity.md` is the redraw spec for bodies: proportions, palette, build, clothing description.
- Sheet creation ends with a **likeness checkpoint**: render the sheet, show the user, iterate until the user approves. Frames are generated only after approval.
- An existing character is detected by slug and skips straight to frame generation. The photo is re-ingested only if the user asks for a redesign.

## Section 4 — SVG frame contract

```xml
<svg viewBox="0 0 800 1200" xmlns="http://www.w3.org/2000/svg">  <!-- constants from identity.md -->
  <g id="character" transform="translate(x y)">
    <g id="body">                              <!-- redrawn per pose from identity.md spec -->
      <g id="arm-back"> ... </g>
      <g id="legs"> ... </g>
      <g id="torso"> ... </g>
      <g id="arm-front"> ... </g>
    </g>
    <g id="head" transform="translate(nx ny) rotate(r)">
      <!-- byte-identical copy of heads/<angle>.svg contents -->
    </g>
  </g>
</svg>
```

Rules (inherited from the pivot-blueprint contract, adapted):

1. Fixed group schema and ids, identical across all frames of a character, so Remotion can swap whole frames or animate `#head` / `#arm-front` independently.
2. All groups positioned via `transform` with children drawn in local coordinates around the group's own origin. The head group's origin is the neck joint; the body marks the neck position with `data-anchor="neck"` so the head snaps on.
3. Feet on the baseline y constant; same viewBox in every frame.
4. Kebab-case unique ids; no `<style>` blocks, no filters, no `<image>` elements; presentation attributes only; wobble lives in geometry.
5. `data-anim="draw|fade|pop|slide"` hints and `data-order` for stagger; `pathLength="1"` on strokes intended for draw-on intros.
6. Paint order: body before head; within body, `arm-back` → `legs` → `torso` → `arm-front`.

## Section 5 — Pose system

- **Library** — `references/pose-library.md`, a growable registry. **Starts with 2 poses only: `idle` and `talk`.** Entries are written pose specs (arm/leg/weight/silhouette notes, optional swap-pair partner), drawn per character on demand — never pre-drawn SVGs.
- **Pose creation** — two routes:
  1. *Define from scratch:* user describes a pose ("create pose `point-left`"); skill drafts the spec, renders a test frame on any existing character, user approves, entry is saved to the library. If no character exists yet, the spec is saved untested and validated on first use.
  2. *Promote a freeform pose:* a one-off pose that worked can be saved ("keep this one as `lean-podium`").
- **Freeform** — user describes an action ("leaning on podium"); skill invents the pose. One-offs need not be saved.
- **Reference pose** — used only on explicit request. No action given at all → `idle`.
- Swap pairs (e.g., a future `talk-1`/`talk-2`) are designed as 2-frame boil pairs for low-fps swap animation.

## Section 6 — Workflow (SKILL.md)

1. **Ingest** — read the reference photo(s). Extract identity: signature features, build, clothing, palette. Slug check: existing character → skip to step 3.
2. **Character sheet** — draw 3 heads + full-body front, write `identity.md`, render, show the user, iterate to likeness approval. Mandatory eyes-on render check — never deliver an SVG that has not been seen rendered (same rule as the blueprint skill).
3. **Generate frames** — one standalone `.svg` per pose. Head copied verbatim, body redrawn per the contract. Render each, inspect, fix.
4. **QA** — `references/qa-checklist.md`:
   - contract checks: group schema, unique kebab-case ids, baseline/viewBox constants, head byte-match against `heads/`;
   - style checks: palette only from tokens, flat fills, wobble present, respectful likeness;
   - **alignment check:** overlay all frames of the character — feet, scale, and head position must be coherent.
5. **Deliver** — save to `frames/` numbered `NN-pose.svg`. Report: frames made, each frame's pose, save paths, which pairs animate together. Never overwrite existing frames unless the user explicitly asks.

## Section 7 — Skill structure

```text
~/.claude/skills/ink-cast-characters/
  SKILL.md                  # trigger, hard rules, workflow
  references/
    style-dna.md            # Section 2 expanded
    likeness-method.md      # photo → signature features → simplification method, taste rules
    character-sheets.md     # Section 3: file layout, identity.md template, checkpoint protocol
    pose-library.md         # starts with idle + talk; grows via pose creation
    svg-authoring.md        # Section 4 contract
    remotion-handoff.md     # consuming frames in Remotion
    qa-checklist.md         # contract + style + alignment checks
  assets/examples/          # starts empty; strong outputs become calibration set
```

References are loaded per task, not all at once (same discipline as the sibling skills).

## Section 8 — Remotion handoff (remotion-handoff.md outline)

- SVGR import (recommended) or inline JSX; ids become stable component handles.
- Frame-swap component snippet: cycle 2–3 frames at 2–4 fps for hand-drawn boil.
- Head-stable swap technique: head geometry is identical across frames, so swaps keep the face rock-solid while the body steps.
- `data-anim` preset mapping reused from the blueprint handoff (`draw` → strokeDashoffset, `fade` → opacity spring, `pop` → scale spring at local origin, `slide` → translate).

## Testing / acceptance

1. Build the skill files, then run end-to-end: one public-domain photo → character sheet → likeness approval → 3 frames (`idle`, `talk`, plus one freeform pose to exercise that path).
2. Accept when:
   - QA checklist passes on all frames;
   - frames overlay without jitter (baseline, viewBox, head position consistent);
   - head geometry in every frame byte-matches `heads/`;
   - renders clean in a browser;
   - converts through SVGR without warnings (no style blocks, filters, or images);
   - `/ink-cast-characters` triggers the skill.

## Notes

- The working directory (`C:\Users\omkar\Projects\Illustrations`) is not a git repository, so the spec is saved without a commit. Initialize git there if version tracking is wanted.
- `assets/characters/` lives in the working project (portable with the video project), not in the skill directory.
- `assets/examples/` in the skill starts empty; first strong outputs become the calibration set.
