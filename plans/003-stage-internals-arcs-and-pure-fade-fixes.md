# 003 — Replace collinear chip paths, fix pure-fade entrances, and add stage settle rotation

- **Status**: DONE
- **Commit**: 0ebae32
- **Severity**: MEDIUM
- **Category**: Physicality & Interruptibility
- **Estimated scope**: 3 files (`HeroStage.tsx`, `InvitationCardReveal.tsx`, `InstitutionalSeal.tsx`), ~130 lines changed

## Problem

1. **Pure-fade escalation triggers**:
   - `app_build/src/components/sections/InvitationCardReveal.tsx:293-300` animates `deptRef.current` with `{ autoAlpha: 0 } -> { autoAlpha: 1 }` and zero transform.
   - `app_build/src/components/sections/InstitutionalSeal.tsx:67-72` animates `actionItems` with `{ autoAlpha: 0 } -> { autoAlpha: 1 }` and zero transform.
2. **Collinear straight-line chip arcs & missing rotational settle**:
   - `app_build/src/components/sections/InvitationCardReveal.tsx:243-259` defines `chipArcs` whose midpoints lie on the exact straight chord (`-3/-12 === 3.5/14`), with zero `rotation`.
   - `crestRef` (`InvitationCardReveal.tsx:170-175`) and `crestItems` (`InstitutionalSeal.tsx:73-78`) only scale (`0.92 -> 1`) with no rotational settle, and `leadItems` / `supportItems` move strictly vertically on Y.
3. **Abrupt reverse on `HeroStage`**:
   - `app_build/src/components/sections/HeroStage.tsx:148` uses `reverse: () => tl.pause(0)`, snapping all internal text invisible instantaneously if reversed while visible instead of smoothly reversing (`tl.reverse()`).

## Target

1. **`HeroStage.tsx`**:
   - Give `leadAccent` subtle rotational lift `{ y: 12, x: -4, rotation: -1.2, autoAlpha: 0 } -> { y: 0, x: 0, rotation: 0, autoAlpha: 1 }` (`duration: 0.48, ease: 'luxurySilk'`).
   - Give `supportItems` subtle balancing lift `{ y: 10, x: 4, rotation: 1, autoAlpha: 0 } -> { y: 0, x: 0, rotation: 0, autoAlpha: 1 }` (`duration: 0.38, stagger: { amount: 0.06, ease: 'power1.out' }, ease: 'emilOut'`).
   - Change `animCtrlRef.current.reverse` from `() => tl.pause(0)` to `() => tl.reverse()`.
   - In `reduceMotion` branch, reset `x: 0, xPercent: 0, yPercent: 0, rotation: 0, rotateY: 0` alongside existing resets.
2. **`InvitationCardReveal.tsx`**:
   - `crestRef`: `{ scale: 0.9, rotation: -10, autoAlpha: 0, transformOrigin: '50% 50%' } -> { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.44, ease: 'waxSnap' }`.
   - `chipArcs`: genuine fanned curves with rotational settle (`transformOrigin: '50% 50%'`):
     - Chip 0: `[{ x: -24, y: 20 }, { x: -14, y: -4 }, { x: 0, y: 0 }]`, `rotation: -5 -> 0`
     - Chip 1: `[{ x: 0, y: 24 }, { x: 8, y: 6 }, { x: 0, y: 0 }]`, `rotation: 2.5 -> 0`
     - Chip 2: `[{ x: 24, y: 20 }, { x: 14, y: -4 }, { x: 0, y: 0 }]`, `rotation: 5 -> 0`
     - `curviness: 1.35`, `scale: 0.94 -> 1`, `duration: 0.48`, `ease: 'luxurySilk'`.
   - `closingRef`: `{ y: 8, x: -4, rotation: -0.8, autoAlpha: 0 } -> { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.38, ease: 'emilOut' }`.
   - `deptRef` (fix pure-fade): `{ y: 8, x: 4, rotation: 0.8, autoAlpha: 0 } -> { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.34, ease: 'emilOut' }`.
   - In `reduceMotion` branch, also clear `xPercent: 0, rotateY: 0`.
3. **`InstitutionalSeal.tsx`**:
   - `leadItems`: `{ y: 16, x: -6, rotation: -1.4, autoAlpha: 0 } -> { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.52, ease: 'luxurySilk' }`.
   - `actionItems` (fix pure-fade): `{ y: 10, scale: 0.96, rotation: -1, autoAlpha: 0 } -> { y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 0.28, ease: 'emilOut' }`.
   - `crestItems`: `{ scale: 0.9, y: 10, rotation: -12, autoAlpha: 0, transformOrigin: '50% 50%' } -> { scale: 1, y: 0, rotation: 0, autoAlpha: 1, duration: 0.48, ease: 'waxSnap' }`.
   - `supportItems`: `{ y: 12, x: 6, rotation: 1.2, autoAlpha: 0 } -> { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.42, ease: 'emilOut' }`.
   - In `reduceMotion` branch, reset `x: 0, rotation: 0, rotateX: 0, rotateY: 0`.

## Repo conventions to follow

- Keep `embedded` one-entrance-per-container discipline (`HeroStage.tsx:75`, `InvitationCardReveal.tsx:144`).
- Keep `hasActivatedRef` sync in `InvitationCardReveal.tsx:381-406` intact for `SplitText` `autoSplit`.

## Steps

1. Edit `app_build/src/components/sections/HeroStage.tsx` to add rotational lift to `leadAccent`/`supportItems`, use `tl.reverse()`, and expand the `reduceMotion` reset.
2. Edit `app_build/src/components/sections/InvitationCardReveal.tsx` to update `crestRef`, `chipArcs` (with `rotation`), `closingRef`, `deptRef`, and the `reduceMotion` reset.
3. Edit `app_build/src/components/sections/InstitutionalSeal.tsx` to update `leadItems`, `actionItems`, `crestItems`, `supportItems`, and the `reduceMotion` reset.

## Boundaries

- Do NOT modify `InvitationView.tsx`, `GoldenEnvelopeStage.tsx`, or `index.css`.
- Do NOT animate outer containers when `embedded` is true.
- Do NOT add new dependencies.

## Verification

- **Mechanical**: `cd app_build && npm run typecheck && npm run build` exits with code 0.
- **Feel check**:
  - In Act 3, watch the 3 metadata chips (`Date`, `Venue`, `Host`) fan in along outward curved arcs with subtle rotation leveling to `0°`, and confirm footer `deptRef` enters with lift rather than popping via opacity alone.
  - In Act 4, confirm the crest turns smoothly into place (`-12° -> 0°`) and the action buttons enter with tactile lift instead of pure fade.
  - Toggle `prefers-reduced-motion: reduce` and verify all text/chips/buttons render straight with zero residual tilt.
- **Done when**: Build succeeds and zero pure-fade entrances or collinear chip paths remain.

