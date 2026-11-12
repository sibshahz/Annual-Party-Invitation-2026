# 004 — Tighten surface-enter under 300ms and refine wax seal press scale

- **Status**: DONE
- **Commit**: 0ebae32
- **Severity**: LOW
- **Category**: Easing, Duration & Physicality
- **Estimated scope**: 1 file (`app_build/src/index.css`), ~20 lines changed

## Problem

1. In `app_build/src/index.css:129-140`, `.surface-enter` uses `320ms` UI duration, exceeding the sub-300ms UI rule in `STANDARDS.md`:

```css
/* app_build/src/index.css:129-140 — current */
.surface-enter {
  opacity: 1;
  transform: scale(1) translate3d(0, 0, 0);
  transition:
    opacity 320ms var(--ease-out),
    transform 320ms var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: scale(0.97) translate3d(0, 8px, 0);
  }
}
```

2. In `app_build/src/index.css:109-125`, `button:active .seal-press-target` scales to `0.94`, slightly outside the recommended subtle press range (`0.95–0.98` in `STANDARDS.md`).

## Target

```css
/* app_build/src/index.css — target */
button:active .seal-press-target {
  transform: scale(0.96);
}

@media (hover: hover) and (pointer: fine) {
  ...
  button:active:not(:disabled) .seal-press-target {
    transform: scale(0.96);
  }
}

.surface-enter {
  opacity: 1;
  transform: scale(1) translate3d(0, 0, 0) rotate(0deg);
  transition:
    opacity 260ms var(--ease-out),
    transform 260ms var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: scale(0.96) translate3d(0, 10px, 0) rotate(-0.8deg);
  }
}
```

## Repo conventions to follow

- Uses `--ease-out` token defined in `app_build/src/index.css:17` (`cubic-bezier(0.23, 1, 0.32, 1)`).
- Gates `:hover` transforms behind `@media (hover: hover) and (pointer: fine)` and strips transforms under `@media (prefers-reduced-motion: reduce)`.

## Steps

1. Edit `app_build/src/index.css:109-140` to set `.seal-press-target` active scale to `0.96` (both base and pointer-fine media query), update `.surface-enter` transition duration to `260ms`, and include `rotate(0deg)` / `rotate(-0.8deg)` in `.surface-enter`.

## Boundaries

- Do NOT modify `index.html` or any `.tsx` file.
- Keep all existing `@media (prefers-reduced-motion: reduce)` rules intact so `transform: none` overrides `.surface-enter` rotation.

## Verification

- **Mechanical**: `cd app_build && npm run typecheck && npm run build` exits with code 0.
- **Feel check**: Press the wax seal and verify tactile `0.96` feedback; load an invalid route to verify `NotFoundView` enters crisply under 300ms with a subtle rotational settle.
- **Done when**: Build succeeds and all UI CSS transitions stay under 300ms.

