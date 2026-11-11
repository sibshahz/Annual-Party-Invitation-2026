# Technical Specification: Annual Function 2026 Digital Invitation Platform

**Project:** Computing Society — Grand Annual Function 2026 Animated Invitation  
**Institution:** Government Akhtar Nawaz Khan (S) Degree College, KTS, Haripur  
**Department:** Department of Computer Science  
**Event Date & Venue:** 14th November, 2026 — Main College Hall  
**Document Owner:** Product Manager (`@pm`)  
**Status:** Approved

---

## 1. Executive Summary

This specification defines a **single-page, menu-less, spatial ("Antigravity") animated digital invitation** for the **Grand Annual Function 2026**, hosted by the **Computing Society, Department of Computer Science, Government Akhtar Nawaz Khan (S) Degree College, KTS, Haripur** on **14th November, 2026** in the **Main College Hall**.

Rather than a multi-section website with navigation bars, dashboards, forms, or footers, each private route (`/chief-guest`, `/farewell`, `/welcome`, and `/`) renders a self-contained, three-beat animated invitation experience powered by **GSAP**, **`@gsap/react`**, **GSAP ScrollTrigger**, and **Antigravity 3D CSS spatial glassmorphism**. Only the organizer knows the distinct guest links and distributes each link privately to its intended recipient group.

---

## 2. Requirements

### 2.1 Canonical Content Mapping (From `.gemini/base.md`)

Every route renders the exact institutional and event lockups with strict typographic hierarchy:

| Content Slot | Exact Value | UI Placement & Treatment |
| :--- | :--- | :--- |
| **Heading 1** | `14 NOV` | Hero focal date numeral (`clamp` display scale) & closing seal header |
| **Heading 2** | `COMPUTING SOCIETY` | Hero primary organizational H1 (`clamp(2.55rem, 5.2vw, 4.85rem)`) & host credit |
| **Content 1** | `Grand Annual Function 2026` | Editorial `Instrument Serif` headline in Hero, Invitation Card, and Seal |
| **Content 2** | *(Tailored Audience Copy)* | Route-specific invitation headline and formal invitation message for Chief Guest, Farewell (Pass-Out Students), Welcome (Incoming Students), or General Assembly |
| **Content 3** | `Department of Computer Science` | Hero institutional lockup, Invitation Card footer, and Closing Seal |
| **Content 4** | `Government Akhtar Nawaz Khan (S) Degree College, KTS, Haripur` | Hero attribution and Closing Ceremonial Seal |

---

### 2.2 Functional Requirements

1. **Menu-Less Private Audience Routes**
   - **`/` (General Invitation):** Unified invitation edition.
   - **`/chief-guest` (Chief Guest Edition):** Formal honorific invitation addressed to the Chief Guest (`Respected Chief Guest`). *(Includes silent redirect from `/chieft-guest` preserving query params.)*
   - **`/farewell` (Farewell to Pass-Out Students Edition):** Tribute invitation celebrating graduating Computer Science scholars.
   - **`/welcome` (Welcome Students Edition):** Warm onboarding invitation welcoming incoming students to the Department of Computer Science.
   - **Optional Personalization Query Params:** `?guest=...` and `?batch=...` personalize the Hero card and Invitation salutation without requiring any backend or modal forms.
   - **Zero Cross-Route Leaks:** Zero `<nav>` bars, zero hamburger menus, zero route lists, and zero sibling links. Unmatched paths (`*`) show a discreet `"Private Invitation Link Required"` card.

2. **GSAP + ScrollTrigger & Antigravity 3D Choreography**
   - **Act 1 — Weightless Hero Stage (`HeroStage.tsx`):**
     - `min-h-[100dvh]` asymmetric split layout with `14 NOV`, `COMPUTING SOCIETY`, `Grand Annual Function 2026`, `Department of Computer Science`, and `Government Akhtar Nawaz Khan (S) Degree College, KTS, Haripur`.
     - Floating 3D Glassmorphic Crest Card (`transform-style: preserve-3d`, inner `translateZ(20px)` relief, isometric wireframe ornament, pointer-responsive 3D `TiltSurface`).
     - GSAP mount timeline (`clipPath` + `y` + `opacity` stagger, 3D `rotateX` card arrival) and `ScrollTrigger` parallax separation on scroll.
   - **Act 2 — Scroll-Triggered 3D Invitation Unfold (`InvitationCardReveal.tsx`):**
     - On desktop (`>= 768px`), pins cleanly via `ScrollTrigger` while tilting the frosted-glass invitation card upright (`rotateX: 14deg -> 0deg`, `scale: 0.9 -> 1`), scrubbing the formal invitation narrative word-by-word (`opacity: 0.14 -> 1`), and staggering in the `14th November, 2026`, `Main College Hall`, and `Computing Society` detail blocks.
     - On mobile (`< 768px`), flows unpinned with smooth `ScrollTrigger` reveals.
   - **Act 3 — Closing Ceremonial Seal (`InstitutionalSeal.tsx`):**
     - Floating institutional lockup over a 3D isometric hexagonal frame (`perspective(800px) rotateX(60deg) rotateZ(-42deg)`), entering on scroll with staggered 3D perspective lift.

---

### 2.3 Non-Functional Requirements

- **Light Alabaster & Luxury Gold Palette:** Warm alabaster base (`#FAF8F3`), frosted porcelain glass cards (`bg-white/85 backdrop-blur-xl`), rich golden typography across headings, salutations, and ceremonial body copy (`gold-foil-text` metallic gradients, `#7A5812` / `#8C6414` royal gold, and `#5E481A` warm antique-gold body ink), plus `#B8923E` hairline trims.
- **Responsiveness:** Clean layout across `320px`–`1920px+` viewports (`min-h-[100dvh]`, `overflow-x-hidden`, zero horizontal overflow, zero truncated badges).
- **Performance & Accessibility:** GPU-composited `transform`, `opacity`, and `clip-path` only; strict `gsap.matchMedia()` handling for `prefers-reduced-motion: reduce`; zero emojis (`@phosphor-icons/react` + inline SVG `SocietyCrest`); self-hosted `@fontsource` typography (`Outfit`, `Instrument Serif`, `JetBrains Mono` — zero `Inter`).

---

## 3. Tech Stack & Directory Structure (Inside `app_build/`)

- **Stack:** Vite 6 + React 19 + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`) + React Router v7 + GSAP 3 (`@gsap/react` + `ScrollTrigger`) + `@phosphor-icons/react` + `@fontsource`.

```text
app_build/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/invitation.ts
    ├── data/invitations.ts
    ├── utils/personalization.ts
    └── components/
        ├── layout/
        │   ├── AmbientBackdrop.tsx
        │   └── ScrollProgress.tsx
        ├── sections/
        │   ├── HeroStage.tsx
        │   ├── InvitationCardReveal.tsx
        │   └── InstitutionalSeal.tsx
        ├── ui/
        │   ├── SocietyCrest.tsx
        │   └── TiltSurface.tsx
        └── pages/
            ├── InvitationView.tsx
            └── NotFoundView.tsx
```
