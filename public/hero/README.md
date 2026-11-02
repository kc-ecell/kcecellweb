# Hero assets (generated)

**Everything in this folder is generated. Do not edit these files by hand.**

They are produced from the originals in `src/assets/` by:

```bash
python3 scripts/process-hero-assets.py
```

The originals stay the source of truth. Re-run the script whenever one is added or replaced, then point `src/content/hero-assets.ts` (photos, logo, tear character) or `src/content/hero-graphics.ts` (stickers) at the result.

## What the script does

**Cuts out the stickers and the tear character.** They arrive as die-cut art on flat white or black. It floods in from the border and removes only the ground that is actually connected to the edge, so interior white survives — the die-cut outlines, the ghost, the cat. Deleting every white pixel instead would gut them.

**Drops specks.** A stray mark in a corner would otherwise pad the whole graphic with dead space, because the trim step crops to whatever survives.

**Resizes and re-encodes to WebP** at roughly 2.5x the largest size each asset is ever rendered. The originals total 19MB; these total 455KB. The team photos alone were ~1.2MB each and render under 250px wide.

## Adding a photo

1. Drop the original into `src/assets/team/`.
2. Add it to the `PHOTOS` list in `scripts/process-hero-assets.py`, with a target long edge around 2.5x its rendered width.
3. Run the script. It prints each output's dimensions.
4. Import the `.webp` in `src/content/hero-assets.ts`, set it as a slot's `src`, and copy those dimensions into `width` / `height`.
5. Write `alt` text describing what the photo actually shows.

Step 4 is not optional. `width` and `height` reserve the box before the image loads, which is what keeps cumulative layout shift at zero.

## Adding a sticker

Same, but add it to `CUTOUTS` instead, and register it in `src/content/hero-graphics.ts` with its position, rotation and entrance delay.

Two things to watch when placing one:

- **Contrast against the ground.** The hero runs from near-black navy in the corners to bright blue low-centre. A dark sticker placed high disappears — this is why `11:11` sits low and `boo` sits high.
- **`drift` is capped at two.** More than a couple of things moving at once in a still viewport reads as generated.

## If a cutout comes out wrong

Tune `TOLERANCE` in the script. Too low leaves a fringe of background; too high starts eating the artwork's own light edges. A subject photographed against a real scene will not key out at any value — export that one with transparency from the source file instead.
