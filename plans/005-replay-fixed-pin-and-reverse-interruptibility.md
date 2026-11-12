# 005 — Fix fixed-pin replay transform and make stage resets interruptible

- **Status**: DONE
- **Commit**: 0ebae32
- **Severity**: MEDIUM
- **Category**: Interruptibility & Physicality
- **Estimated scope**: 3 files (`InvitationView.tsx`, `InvitationCardReveal.tsx`, `InstitutionalSeal.tsx`), ~25 lines changed

## Problem

1. **CSS `transform` breaks `position: fixed` during replay**: `app_build/src/components/pages/InvitationView.tsx:557-566,599-605` animates `scale: 0.985` on `mainRef.current`, which wraps `pinnedViewportRef` (pinned with `position: fixed` by `ScrollTrigger`). Applying `transform` on `mainRef.current` while scrolled to Act 2–4 creates a new containing block and snaps the fixed viewport away before fading.
2. **Non-interruptible abrupt resets**: `InvitationCardReveal.tsx:379,397` and `InstitutionalSeal.tsx:100` call `.pause(0)` on `reset()`, snapping content off instantaneously during the `0.72s` `scrub` lag when reversing quickly.

## Target

1. `app_build/src/components/pages/InvitationView.tsx`: Animate `autoAlpha` only on `mainRef.current` during replay fade-out (`0.2s`, `emilOut`) and fade-in (`0.24s`, `emilOut`, `clearProps: 'opacity,visibility'`).
2. `app_build/src/components/sections/InvitationCardReveal.tsx`: Update `textCtrlRef.current.reset` to set mask `overflow = 'clip'` and call `textTl.reverse()`, and `cardCtrlRef.current.reset` to call `cardTl.reverse()`.
3. `app_build/src/components/sections/InstitutionalSeal.tsx`: Update `animCtrlRef.current.reset` to call `tl.reverse()`.

## Repo conventions to follow

- Matches `HeroStage.tsx:155` (`reverse: () => tl.reverse()`).

## Steps

1. Edit `app_build/src/components/pages/InvitationView.tsx:557-567,599-605` to remove `scale` from the `mainRef.current` tweens and restore `clearProps: 'opacity,visibility'`.
2. Edit `app_build/src/components/sections/InvitationCardReveal.tsx:376-406` to reverse `textTl` (restoring `overflow = 'clip'` on `self.masks`) and `cardTl` instead of `pause(0)`.
3. Edit `app_build/src/components/sections/InstitutionalSeal.tsx:98-101` to call `tl.reverse()` in `reset`.

## Boundaries

- Do NOT modify `GoldenEnvelopeStage.tsx`, `HeroStage.tsx`, `gsapConfig.ts`, or `index.css`.

## Verification

- **Mechanical**: `cd app_build && npm run typecheck && npm run build` exits with code 0.
- **Feel check**: Scroll all the way to Act 4 (`InstitutionalSeal`), click `Replay Envelope`, and verify the view fades smoothly in place without jumping to the top of `mainRef` before the envelope resets.
- **Done when**: Build succeeds and zero `pause(0)` or ancestor-`transform` pin bugs remain.

