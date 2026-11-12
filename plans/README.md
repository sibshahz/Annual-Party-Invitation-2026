# Animation Improvement Plans

Audit baseline commit: `0ebae32` (against working-tree motion baseline in `app_build/src/`)
Standards: `.agents/skills/review-animations/STANDARDS.md` & `.agents/skills/improve-animations/AUDIT.md`

## Plan Inventory

| # | Title | Severity | Category | Status |
| --- | --- | --- | --- | --- |
| [001](001-master-act-arcs-and-rotation.md) | Sweep 4-act MotionPath arcs with banking rotation & unified arc easings | HIGH | Physicality, Arcs & Cohesion | DONE |
| [002](002-envelope-arc-rotation-and-ease-in-fix.md) | Fix envelope ease-in escalation triggers and add curved arrival/exit arcs with rotation | HIGH | Easing, Physicality & Arcs | DONE |
| [003](003-stage-internals-arcs-and-pure-fade-fixes.md) | Replace collinear chip paths, fix pure-fade entrances, and add stage settle rotation | MEDIUM | Physicality & Interruptibility | DONE |
| [004](004-css-micro-interactions-and-duration-polish.md) | Tighten surface-enter under 300ms and refine wax seal press scale | LOW | Easing, Duration & Physicality | DONE |
| [005](005-replay-fixed-pin-and-reverse-interruptibility.md) | Fix fixed-pin replay transform and make stage resets interruptible | MEDIUM | Interruptibility & Physicality | DONE |

## Recommended Execution Order & Dependencies

1. **001 — Master act arcs and rotation** (adds shared `arcArrive` and `arcDepart` CustomEase tokens in `app_build/src/utils/gsapConfig.ts`, which Plans 002 and 003 depend on).
2. **002 — Envelope arc rotation and ease-in fix** (uses `arcArrive` / `arcDepart` from 001; updates `GoldenEnvelopeStage.tsx`).
3. **003 — Stage internals arcs and pure-fade fixes** (updates `HeroStage.tsx`, `InvitationCardReveal.tsx`, `InstitutionalSeal.tsx`; independent of 002).
4. **004 — CSS micro-interactions and duration polish** (updates `index.css`; independent).
5. **005 — Replay fixed-pin and reverse interruptibility** (hardens replay fade and scrub-reverse smoothness on `InvitationView.tsx`, `InvitationCardReveal.tsx`, `InstitutionalSeal.tsx`).

