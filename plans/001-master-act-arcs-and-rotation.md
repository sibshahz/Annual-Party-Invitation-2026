# 001 — Sweep 4-act MotionPath arcs with banking rotation & unified arc easings

- **Status**: DONE
- **Commit**: 0ebae32
- **Severity**: HIGH
- **Category**: Physicality, Arcs & Cohesion
- **Estimated scope**: 2 files (`app_build/src/utils/gsapConfig.ts`, `app_build/src/components/pages/InvitationView.tsx`), ~180 lines changed

## Problem

1. In `app_build/src/components/pages/InvitationView.tsx:120-370`, every MotionPath arc deviates only ~1.6%–2.8% from a straight chord, and `rotation` is hardcoded to `0` on entry and exit (`heroPanelRef`, `heroCrestCol`, `cardPanelRef`, `sealPanelRef`, `sealLattice`). Moving elements look like flat, soulless linear slides rather than elements gliding along curved paths with physical rotation:

```ts
/* app_build/src/components/pages/InvitationView.tsx:120-122 — current */
gsap.set(heroPanelRef.current, { xPercent: 105, yPercent: 16, rotation: 0, autoAlpha: 0 });
gsap.set(cardPanelRef.current, { xPercent: -14, yPercent: -106, autoAlpha: 0 });
gsap.set(sealPanelRef.current, { xPercent: -106, yPercent: 15, rotation: 0, autoAlpha: 0 });
```

```ts
/* app_build/src/components/pages/InvitationView.tsx:164-179 — current */
.to(
  heroPanelRef.current,
  {
    motionPath: {
      path: [
        { xPercent: 105, yPercent: 16 },
        { xPercent: 46, yPercent: 4.2 },
        { xPercent: 0, yPercent: 0 },
      ],
      curviness: 1.25,
      fromCurrent: false,
    },
    duration: 1.1,
    ease: 'sine.inOut',
  },
  'heroEnter'
)
```

2. `[data-hero-column="lead"]` has no counter-motion against `[data-hero-column="crest"]`, and `heroCrestCol` / `sealLattice` only translate slightly with zero rotation.
3. Scrubbed act entrances use weak built-in `sine.inOut` / `power2.out`, and `setHeroActive` / `setCardActive` / `setSealActive` trigger slightly late (`2.15`, `5.1`, `8.1`), making internal reveals feel disconnected from the panel arrival.

## Target

1. Add two shared arc easing tokens in `app_build/src/utils/gsapConfig.ts`:
   - `arcArrive`: `'M0,0 C0.2,0.9 0.3,1 1,1'` (responsive entry onto the arc, long smooth settle into center)
   - `arcDepart`: `'M0,0 C0.42,0.04 0.58,0.96 1,1'` (smooth departure from center rest out along the exit arc)
2. Give every act panel and parallax layer in `InvitationView.tsx` an unmistakable curved MotionPath arc (`curviness: 1.35`) with deliberate entry/exit banking rotation and 3D perspective tilt, plus `transformOrigin: '50% 50%'` and `immediateRender: false` on all exit tweens:
   - **Hero panel (`heroPanelRef`)**:
     - Initial & enter: `{ xPercent: 104, yPercent: 28, rotation: 7, rotationY: -9, scale: 0.94, transformPerspective: 1400, transformOrigin: '50% 50%', autoAlpha: 0 }` → arc crest `[{ xPercent: 104, yPercent: 28 }, { xPercent: 44, yPercent: -11 }, { xPercent: 0, yPercent: 0 }]` (`curviness: 1.35`), settling to `{ rotation: 0, rotationY: 0, scale: 1 }`, `duration: 1.1`, `ease: 'arcArrive'`; `autoAlpha: 0 -> 1` in `0.42` (`emilOut`).
     - Exit: `[{ xPercent: 0, yPercent: 0 }, { xPercent: -46, yPercent: -11 }, { xPercent: -108, yPercent: 32 }]` (`curviness: 1.35`), banking to `{ rotation: -7.5, rotationY: 9, scale: 0.94 }`, `duration: 1.1`, `ease: 'arcDepart'`, `immediateRender: false`; `autoAlpha: 0` over `0.36` at `'heroExit+=0.74'`.
   - **Hero columns (`heroLeadCol` & `heroCrestCol`)**:
     - `heroLeadCol` (`[data-hero-column="lead"]`): enters `{ xPercent: 6, yPercent: 8, rotation: -2.2, transformOrigin: '50% 50%' }` → `[{ xPercent: 6, yPercent: 8 }, { xPercent: 2, yPercent: -4 }, { xPercent: 0, yPercent: 0 }]`, `rotation: 0` (`arcArrive`); exits `[{ xPercent: 0, yPercent: 0 }, { xPercent: -4, yPercent: -4 }, { xPercent: -10, yPercent: 10 }]`, `rotation: 2.2` (`arcDepart`, `immediateRender: false`).
     - `heroCrestCol` (`[data-hero-column="crest"]`): enters `{ xPercent: 18, yPercent: 16, rotation: 5.5, scale: 0.95, transformOrigin: '50% 50%' }` → `[{ xPercent: 18, yPercent: 16 }, { xPercent: 8, yPercent: -9 }, { xPercent: 0, yPercent: 0 }]`, `rotation: 0, scale: 1` (`arcArrive`); exits `[{ xPercent: 0, yPercent: 0 }, { xPercent: -8, yPercent: -8 }, { xPercent: -20, yPercent: 16 }]`, `rotation: -5.5, scale: 0.95` (`arcDepart`, `immediateRender: false`).
   - **Invitation card panel (`cardPanelRef` + `unfoldCard`)**:
     - Initial & enter: `{ xPercent: -38, yPercent: -106, rotation: -8.5, scale: 0.94, transformOrigin: '50% 50%', autoAlpha: 0 }` → crescent bow `[{ xPercent: -38, yPercent: -106 }, { xPercent: -26, yPercent: -32 }, { xPercent: 0, yPercent: 0 }]` (`curviness: 1.35`), settling `{ rotation: 0, scale: 1 }`, `duration: 1.1`, `ease: 'arcArrive'`; `unfoldCard` from `{ transformPerspective: 1200, rotateX: 11, rotateY: -7 }` → `{ rotateX: 0, rotateY: 0 }`; `autoAlpha: 0 -> 1` in `0.42` (`emilOut`).
     - Exit: `[{ xPercent: 0, yPercent: 0 }, { xPercent: 26, yPercent: 32 }, { xPercent: 40, yPercent: 108 }]` (`curviness: 1.35`), banking `{ rotation: 8.5, scale: 0.94 }`, `duration: 1.1`, `ease: 'arcDepart'`, `immediateRender: false`; `unfoldCard` to `{ rotateX: -9, rotateY: 7, immediateRender: false }`; `autoAlpha: 0` over `0.36` at `'cardExit+=0.74'`.
   - **Institutional seal panel (`sealPanelRef` + `sealLattice`)**:
     - Initial & enter: `{ xPercent: -104, yPercent: 30, rotation: -7.5, rotationY: 9, scale: 0.94, transformPerspective: 1400, transformOrigin: '50% 50%', autoAlpha: 0 }` → upward crest `[{ xPercent: -104, yPercent: 30 }, { xPercent: -44, yPercent: -11 }, { xPercent: 0, yPercent: 0 }]` (`curviness: 1.35`), settling `{ rotation: 0, rotationY: 0, scale: 1 }`, `duration: 1.15`, `ease: 'arcArrive'`; `autoAlpha: 0 -> 1` in `0.42` (`emilOut`).
     - `sealLattice`: `{ xPercent: -24, yPercent: 18, rotation: -16, scale: 0.9, transformOrigin: '50% 50%' }` → `[{ xPercent: -24, yPercent: 18 }, { xPercent: -8, yPercent: -9 }, { xPercent: 0, yPercent: 0 }]`, settling `{ rotation: 0, scale: 1 }`, `duration: 1.15`, `ease: 'arcArrive'`.
3. Update active-stage thresholds in `onUpdate` so internal reveals harmonize with the settling arc:
   - `heroActive`: `t >= 2.0 ? true : t < 1.45 ? false : prev`
   - `cardActive`: `t >= 4.95 ? true : t < 4.2 ? false : prev`
   - `sealActive`: `t >= 7.95 ? true : t < 7.2 ? false : prev`
4. Update replay fade in `InvitationView.tsx:423-432,464-469` with subtle `scale: 0.985 <-> 1` (`duration: 0.24`, `emilOut`) and `clearProps: 'opacity,visibility,transform'` on completion of enter.

## Repo conventions to follow

- GSAP custom ease curves live in `app_build/src/utils/gsapConfig.ts:36-41` inside `ensureGsapPlugins()`.
- ScrollTrigger timelines live inside `useGSAP` with `scope: rootRef` and `revertOnUpdate: true` (`app_build/src/components/pages/InvitationView.tsx:110-388`).

## Steps

1. Edit `app_build/src/utils/gsapConfig.ts` to register `arcArrive` (`M0,0 C0.2,0.9 0.3,1 1,1`) and `arcDepart` (`M0,0 C0.42,0.04 0.58,0.96 1,1`) inside `ensureGsapPlugins()`.
2. Edit `app_build/src/components/pages/InvitationView.tsx`:
   - Select `heroLeadCol = q('[data-hero-column="lead"]')`.
   - Update initial `gsap.set` calls (`heroPanelRef`, `cardPanelRef`, `sealPanelRef`, `heroLeadCol`, `heroCrestCol`, `sealLattice`) to the curved start coordinates, banking `rotation`, 3D `rotationY`, `scale`, and `transformOrigin: '50% 50%'`.
   - Update `onUpdate` active thresholds to `2.0`, `4.95`, `7.95`.
   - Replace Beat 2 (`heroEnter`/`heroExit`), Beat 3 (`cardEnter`/`cardExit`), and Beat 4 (`sealEnter`) tweens with the target curved `motionPath` arcs, banking rotations, 3D tilts, `arcArrive` / `arcDepart` easings, and `immediateRender: false` on exits.
   - Add `scale: 0.985 -> 1` (and `clearProps: 'opacity,visibility,transform'`) on replay fade transitions.

## Boundaries

- Do NOT modify `GoldenEnvelopeStage.tsx`, `HeroStage.tsx`, `InvitationCardReveal.tsx`, `InstitutionalSeal.tsx`, or `index.css` in this plan.
- Do NOT alter DOM structure or `ScrollTrigger` `end: '+=4400'` / `scrub: 0.72` bounds.
- Do NOT add new npm dependencies.

## Verification

- **Mechanical**: `cd app_build && npm run typecheck && npm run build` exits with code 0.
- **Feel check**: Scroll slowly forward and backward through all 4 acts in the browser:
  - Hero sweeps up over a visible crest from the lower-right while banking `+7° -> 0°`, its two cards subtly fanning into alignment, then banks `0° -> -7.5°` down-left on exit.
  - Invitation Card sweeps along a wide left-bowing crescent from top-left (`-8.5° -> 0°`) and continues smoothly down-right (`0° -> +8.5°`).
  - Institutional Seal rises over a crest from lower-left (`-7.5° -> 0°`) while its isometric lattice orbits and counter-rotates (`-16° -> 0°`) into alignment.
  - Toggle `prefers-reduced-motion: reduce` and confirm panels render in static vertical flow with zero position/rotation animations.
- **Done when**: Build succeeds cleanly and forward/backward scroll scrubbing produces zero snapping or clipped artifacts.

