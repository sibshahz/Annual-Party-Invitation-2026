import { useLayoutEffect, useRef } from "react";
import { ArrowUp } from "@phosphor-icons/react";
import { EVENT_METADATA } from "../../data/invitations";
import type { InvitationEdition } from "../../types/invitation";
import { gsap, useGSAP } from "../../utils/gsapConfig";
import { SocietyCrest } from "../ui/SocietyCrest";

interface InstitutionalSealProps {
  edition: InvitationEdition;
}

/**
 * Light-themed luxury gold closing ceremonial Antigravity seal anchoring Content 3 & Content 4
 * above a suspended isometric architectural lattice drawn via GSAP DrawSVGPlugin.
 */
export function InstitutionalSeal({ edition }: InstitutionalSealProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const { contextSafe } = useGSAP({ scope: sectionRef });

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const q = gsap.utils.selector(sectionRef);
    const items = gsap.utils.toArray<HTMLElement>(q("[data-seal-reveal]"));
    const drawShapes = gsap.utils.toArray<SVGGeometryElement>(
      q("[data-seal-draw]"),
    );
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
          refreshPriority: 1,
        },
      });

      tl.fromTo(
        drawShapes,
        { drawSVG: "0% 0%" },
        {
          drawSVG: "0% 100%",
          duration: 1.05,
          stagger: 0.14,
          ease: "power2.inOut",
        },
        0,
      ).fromTo(
        items,
        {
          transformPerspective: 1000,
          rotateX: 10,
          y: 28,
          opacity: 0,
        },
        {
          transformPerspective: 1000,
          rotateX: 0,
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: "luxurySilk",
        },
        0.12,
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(items, { opacity: 1, y: 0, rotateX: 0 });
      gsap.set(drawShapes, { drawSVG: "0% 100%" });
    });

    return () => mm.revert();
  }, [edition.slug]);

  const scrollToTop = contextSafe(() => {
    gsap.to(window, {
      duration: 1.0,
      scrollTo: { y: 0 },
      ease: "power3.inOut",
    });
  });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-label="Institutional invitation seal"
    >
      {/* Subtle Isometric Architectural Seal Background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-28"
        aria-hidden="true"
      >
        <div
          className="w-80 h-80 sm:w-[26rem] sm:h-[26rem]"
          style={{
            transform: "perspective(800px) rotateX(60deg) rotateZ(-42deg)",
          }}
        >
          <svg viewBox="0 0 240 240" fill="none" className="w-full h-full">
            <rect
              data-seal-draw
              x="24"
              y="24"
              width="192"
              height="192"
              rx="28"
              stroke={edition.theme.accentHex}
              strokeWidth="1.35"
            />
            <rect
              x="54"
              y="54"
              width="132"
              height="132"
              rx="18"
              stroke="#8C6414"
              strokeOpacity="0.38"
              strokeDasharray="4 6"
            />
            <circle
              data-seal-draw
              cx="120"
              cy="120"
              r="46"
              stroke={edition.theme.accentHex}
              strokeOpacity="0.55"
              strokeWidth="1.15"
            />
          </svg>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto text-center space-y-6 rounded-[2.25rem] p-8 sm:p-12 bg-white/82 backdrop-blur-xl border border-[#B8923E]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_28px_64px_-18px_rgba(140,104,25,0.16)]">
        <div data-seal-reveal className="flex justify-center">
          <div
            className="p-4 rounded-full bg-white/85 backdrop-blur-md border shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_16px_38px_rgba(140,104,25,0.14)]"
            style={{ borderColor: edition.theme.accentBorderRgba }}
          >
            <SocietyCrest
              accentColor={edition.theme.accentHex}
              className="w-14 h-14"
            />
          </div>
        </div>

        <div data-seal-reveal className="space-y-2">
          <p className="gold-foil-text text-xs sm:text-sm font-mono uppercase tracking-[0.26em] font-semibold">
            {edition.heading1} · {EVENT_METADATA.venue}
          </p>
          <h2 className="gold-foil-text text-3xl sm:text-5xl font-bold tracking-tight uppercase">
            {edition.heading2}
          </h2>
          <p className="font-serif italic text-2xl sm:text-3xl text-[#7D5A11]">
            {edition.content1}
          </p>
        </div>

        <div
          data-seal-reveal
          className="pt-4 border-t border-[#B8923E]/30 max-w-xl mx-auto space-y-1.5"
        >
          <p className="text-base sm:text-lg font-semibold text-[#7A5812]">
            {edition.content3}
          </p>
          <p className="text-sm sm:text-base text-[#5E481A] leading-relaxed">
            {edition.content4}
          </p>
        </div>

        <div data-seal-reveal className="pt-4">
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hover:bg-white border border-[#B8923E]/35 shadow-[0_6px_18px_rgba(140,104,25,0.08)] text-xs font-mono uppercase tracking-[0.18em] text-[#7A5812] hover:text-[#573E0B] transition-colors cursor-pointer"
          >
            <ArrowUp size={14} />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </section>
  );
}
