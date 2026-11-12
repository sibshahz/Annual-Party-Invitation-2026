# 002 — Fix envelope ease-in escalation triggers and add curved arrival/exit arcs with rotation

- **Status**: DONE
- **Commit**: 0ebae32
- **Severity**: HIGH
- **Category**: Easing, Physicality & Arcs
- **Estimated scope**: 1 file (`app_build/src/components/sections/GoldenEnvelopeStage.tsx`), ~140 lines changed

## Problem

1. **Aggressive Escalation Triggers (`ease-in` on UI)**: `app_build/src/components/sections/GoldenEnvelopeStage.tsx:627` uses `ease: 'power2.in'` on the wax seal click response (`sealBtnRef.current`), and line `710` uses `ease: 'power1.in'` on light motes:

```ts
/* app_build/src/components/sections/GoldenEnvelopeStage.tsx:611-630 — current */
.to(
  sealBtnRef.current,
  {
    scale: 0.76,
    autoAlpha: 0,
    rotation: 9,
    motionPath: {
      path: [
        { x: 4, y: -6 },
        { x: 11, y: -15 },
        { x: 20, y: -22 },
      ],
      curviness: 1.15,
      fromCurrent: false,
    },
    duration: 0.22,
    ease: 'power2.in',
  },
  'unseal+=0.2'
)
```

2. **Flat straight-line arcs & zero rotation**:
   - `arriveTl` (`lines 754-773`) travels `{ x: 24, y: 44 } -> { x: 7, y: 12 } -> { x: 0, y: 0 }` (0.45px chord deviation, `rotation: 0`).
   - `closeTl` envelope rise (`lines 394-412`) deviates only `10px` horizontally with `rotation: 0`.
   - `closeTl` `exitLeft` (`lines 463-483`) travels to `xPercent: -245` with only `3%` arc bow and `-3deg` rotation.
   - `cardRef` emergence and `envelopeShellRef` counter-glide (`lines 643-662`) move purely along straight vertical Y lines (`rotation: 0`).
   - `floatTween` (`lines 216-242`) bobs straight vertically (`y: -7`), and `quickRotX`/`quickRotY` (`lines 185-190`) take `0.7s` (sluggish pointer tracking).
   - `MOTE_PATHS` motes (`lines 688-702`) set `autoRotate: false` with zero rotation change.

## Target

Depends on Plan 001 (`arcArrive` and `arcDepart` registered in `gsapConfig.ts`).

1. **Envelope arrival (`arriveTl`)**:
   - Responsive start offset: `arriveX = isDesktop ? 108 : 64`, `arriveY = isDesktop ? 112 : 76`.
   - Initial `envelopeShellRef` set: `{ transformPerspective: 1600, transformOrigin: '50% 50%', rotationX: 16, rotationY: -10, rotation: 9, x: arriveX, y: arriveY, xPercent: 0, yPercent: 0, scale: 0.9, autoAlpha: 1 }`.
   - `arriveTl` curves through an upward crest: `motionPath: { path: [{ x: arriveX, y: arriveY }, { x: Math.round(arriveX * 0.28), y: isDesktop ? -22 : -14 }, { x: 0, y: 0 }], curviness: 1.35, fromCurrent: false }`, settling `{ rotationX: 0, rotationY: 0, rotation: 0, scale: 1 }`, `duration: 0.85`, `ease: 'arcArrive'`.
2. **Pointer tilt responsiveness**:
   - Update `quickRotX` and `quickRotY` durations from `0.7` to `0.42` (`ease: 'power3.out'`).
3. **Subtle rotational breath on idle float**:
   - `floatTween`: `{ y: -7, rotation: 0.85, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true }`.
   - `emergedFloatTween`: `{ y: -5, rotation: 0.65, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true }`.
   - Reset `rotation: 0` cleanly alongside `y: 0` in `handleEmergedFloatScroll` and `openTl` `'unseal'`.
4. **Wax seal break & curved toss-arc (fixing `power2.in`)**:
   - Set `transformOrigin: '50% 50%'` on `sealBtnRef`.
   - Pop step at `'unseal'`: `{ scale: 1.14, rotation: -8, motionPath: { path: [{ x: 0, y: 0 }, { x: -8, y: -14 }], curviness: 1.2, fromCurrent: false }, duration: 0.2, ease: 'waxSnap' }`.
   - Launch step at `'unseal+=0.2'`: `{ scale: 0.74, autoAlpha: 0, rotation: 26, motionPath: { path: [{ x: -8, y: -14 }, { x: 24, y: -52 }, { x: 64, y: -28 }], curviness: 1.35, fromCurrent: false }, duration: 0.28, ease: 'emilOut' }`.
5. **Card emergence & shell counter-sway**:
   - Keep `yPercent: emergeCardY, scale: emergeCardScale, rotationX: 0` (`duration: 0.84, ease: 'luxurySilk'`) on `cardRef` AND layer an overlapping gentle paper-slip arc `{ xPercent: -2.2, rotation: -1.8, duration: 0.36, ease: 'sine.inOut' }` at `'emerge'` followed by `{ xPercent: 0, rotation: 0, duration: 0.48, ease: 'emilOut' }` at `'emerge+=0.36'`.
   - Keep `y: shellEmergeY` (`duration: 0.84, ease: 'luxurySilk'`) on `envelopeShellRef` AND layer a matching counter-sway `{ x: 16, rotation: 2, duration: 0.36, ease: 'sine.inOut' }` at `'emerge'` followed by `{ x: 0, rotation: 0, duration: 0.48, ease: 'emilOut' }` at `'emerge+=0.36'`.
6. **Golden light motes (fixing `power1.in` & adding spin)**:
   - Rotate each mote smoothly (`rotation: idx % 2 === 0 ? 55 : -55`) along `MOTE_PATHS` over its motion duration, and fade out with `ease: 'emilOut'` (never `power1.in`).
7. **Scroll-scrubbed `buildScrollCloseTimeline`**:
   - Ensure `cardRef` return tucks with matching reverse sway (`xPercent: 0 -> 2 -> 0`, `rotation: 0 -> 1.6 -> 0` via two non-overlapping tweens inside `0..0.95` with `immediateRender: false`).
   - `envelopeShellRef` rise arc: `path: [{ x: 0, y: shellEmergeY }, { x: isDesktop ? -34 : -22, y: Math.round(shellEmergeY * 0.4) }, { x: 0, y: 0 }]`, `curviness: 1.35`, `duration: 0.95`, `ease: 'arcDepart'`, `immediateRender: false`, with a gentle mid-rise tilt (`rotation: -2.5` at `'closeEnvelope'` over `0.45`, returning to `rotation: 0` over `0.5` at `'closeEnvelope+=0.45'`, both `immediateRender: false`).
   - `sealBtnRef` return arc at `'closeEnvelope+=0.94'`: reverses `{ x: 64, y: -28 } -> { x: 24, y: -52 } -> { x: 0, y: 0 }`, `curviness: 1.35`, `rotation: 26 -> 0`, `scale: 0.74 -> 1`, `autoAlpha: 0 -> 1`, `duration: 0.24`, `ease: 'emilOut'`, `immediateRender: false`.
   - `exitLeft` at `'closeEnvelope+=1.12'`: `envelopeShellRef` sweeps out along `[{ xPercent: 0, yPercent: 0 }, { xPercent: -52, yPercent: -18 }, { xPercent: -165, yPercent: 38 }]`, `curviness: 1.35`, `{ rotation: -14, rotationY: -15, rotationX: 6, scale: 0.9 }`, `duration: 1.03`, `ease: 'arcDepart'`, `immediateRender: false`; `stageRef` fades `autoAlpha: 0` over `0.35` (`emilOut`, `immediateRender: false`) at `'exitLeft+=0.68'`.

## Repo conventions to follow

- All tweens live inside `useGSAP` with `mm.add` handling `(prefers-reduced-motion: reduce)` (`GoldenEnvelopeStage.tsx:97-106`).
- Every tween in `buildScrollCloseTimeline` uses `immediateRender: false` (`GoldenEnvelopeStage.tsx:366-497`).

## Steps

1. Edit `app_build/src/components/sections/GoldenEnvelopeStage.tsx`:
   - Compute `arriveX` / `arriveY` inside `mm.add` and update initial `gsap.set` for `envelopeShellRef` (`rotation: 9`, `transformOrigin: '50% 50%'`), `cardRef` (`xPercent: 0, rotation: 0, transformOrigin: '50% 50%'`), and `sealBtnRef` (`transformOrigin: '50% 50%'`).
   - Update `quickRotX` / `quickRotY` durations to `0.42`.
   - Add subtle `rotation` to `floatTween` and `emergedFloatTween` and reset `rotation: 0` in `handleEmergedFloatScroll` and `openTl` `'unseal'`.
   - Update `openTl` wax seal pop & curved toss arc (`ease: 'waxSnap'` then `ease: 'emilOut'`), card/shell emergence counter-sway, and mote rotation + `emilOut` fade-out.
   - Update `arriveTl` to the curved arrival arc with `ease: 'arcArrive'`.
   - Update `buildScrollCloseTimeline` with the curved shell rise arc, reverse seal toss arc, and sweeping `-14°` downward-left `exitLeft` arc (`ease: 'arcDepart'`).

## Boundaries

- Do NOT modify `InvitationView.tsx`, `HeroStage.tsx`, `InvitationCardReveal.tsx`, or `InstitutionalSeal.tsx`.
- Do NOT break scroll-lock while sealed (`Observer` + `keepTopWhileSealed`) or `onEmerged` callback timing.
- Do NOT add new dependencies.

## Verification

- **Mechanical**: `cd app_build && npm run typecheck && npm run build` exits with code 0.
- **Feel check**:
  - Reload page: envelope glides in along an upward-curving arc from lower-right while banking `9° -> 0°` and floats with subtle rotational breath.
  - Click wax seal: seal pops and arcs up-right spinning `26°` with crisp `emilOut` (no sluggish start); card rises out with a gentle paper-slip sway.
  - Scroll down: envelope rises along a smooth arc as flap closes, wax seal arcs back down onto the flap, and sealed envelope banks `-14°` along a clear downward-left arc off screen. Scrub back up to 0 and confirm clean restoration.
- **Done when**: Build succeeds, zero `ease: '*.in'` remain in `GoldenEnvelopeStage.tsx`, and forward/reverse scrubbing preserves initial geometry.

