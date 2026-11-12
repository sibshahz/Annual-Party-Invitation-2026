import { useEffect, useRef } from "react";
import { ArrowUp, EnvelopeOpen } from "@phosphor-icons/react";
import { EVENT_METADATA } from "../../data/invitations";
import type { InvitationEdition } from "../../types/invitation";
import { gsap, useGSAP } from "../../utils/gsapConfig";
import { SocietyCrest } from "../ui/SocietyCrest";

interface InstitutionalSealProps {
  edition: InvitationEdition;
  isActive?: boolean;
  embedded?: boolean;
  onReplayEnvelope?: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/**
 * Light-themed luxury gold closing ceremonial Antigravity seal anchoring Content 3 & Content 4
 * above a suspended isometric architectural lattice drawn via GSAP DrawSVGPlugin.
 */
export function InstitutionalSeal({
  edition,
  isActive = true,
  embedded = false,
  onReplayEnvelope,
}: InstitutionalSealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const animCtrlRef = useRef<{ play: () => void; reset: () => void } | null>(null);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const { contextSafe } = useGSAP(
    () => {
      if (!sectionRef.current) return;
      const q = gsap.utils.selector(sectionRef);
      const leadItems = q("[data-seal-role='lead']");
      const crestItems = q("[data-seal-role='crest']");
      const supportItems = q("[data-seal-role='support']");
      const actionItems = q("[data-seal-role='actions']");
      const allRoleTargets = [...leadItems, ...crestItems, ...supportItems, ...actionItems];
      const drawShapes = gsap.utils.toArray<SVGGeometryElement>(q("[data-seal-draw]"));
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          paused: embedded,
          ...(embedded
            ? {}
            : {
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top 85%",
                  once: true,
                  refreshPriority: 1,
                },
              }),
        });

        tl.fromTo(
          leadItems,
          { y: 16, x: -6, rotation: -1.4, autoAlpha: 0 },
          { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.52, ease: "luxurySilk" },
          0
        )
          .fromTo(
            actionItems,
            { y: 10, scale: 0.96, rotation: -1, autoAlpha: 0 },
            { y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 0.28, ease: "emilOut" },
            0.04
          )
          .fromTo(
            crestItems,
            { scale: 0.9, y: 10, rotation: -12, autoAlpha: 0, transformOrigin: "50% 50%" },
            { scale: 1, y: 0, rotation: 0, autoAlpha: 1, duration: 0.48, ease: "waxSnap" },
            0.06
          )
          .fromTo(
            drawShapes,
            { drawSVG: "0% 0%" },
            {
              drawSVG: "0% 100%",
              duration: 0.85,
              stagger: 0.12,
              ease: "power2.inOut",
            },
            0.08
          )
          .fromTo(
            supportItems,
            { y: 12, x: 6, rotation: 1.2, autoAlpha: 0 },
            { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.42, ease: "emilOut" },
            0.11
          );

        if (embedded) {
          animCtrlRef.current = {
            play: () => tl.play(),
            reset: () => tl.reverse(),
          };
          if (isActiveRef.current) {
            tl.play(0);
          }
        }

        return () => {
          animCtrlRef.current = null;
          tl.kill();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(allRoleTargets, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          rotateX: 0,
          rotateY: 0,
        });
        gsap.set(drawShapes, { drawSVG: "0% 100%" });
        animCtrlRef.current = null;
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [edition.slug, embedded], revertOnUpdate: true }
  );

  useEffect(() => {
    if (!embedded) return;
    if (isActive) {
      animCtrlRef.current?.play();
    } else {
      animCtrlRef.current?.reset();
    }
  }, [isActive, embedded]);

  const scrollToTop = contextSafe(() => {
    if (prefersReducedMotion()) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    gsap.to(window, {
      duration: 1.15,
      scrollTo: { y: 0 },
      ease: "power3.inOut",
    });
  });

  return (
    <section
      ref={sectionRef}
      className={
        embedded
          ? "relative w-full h-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto lg:overflow-hidden"
          : "relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
      }
      aria-label="Institutional invitation seal"
    >
      {/* Subtle Isometric Architectural Seal Background */}
      <div
        data-seal-lattice
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-28 will-change-transform"
        aria-hidden="true"
      >
        <div
          className="w-72 h-72 sm:w-[26rem] sm:h-[26rem]"
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

      <div className="relative max-w-3xl w-full mx-auto text-center space-y-5 sm:space-y-6 rounded-[2rem] sm:rounded-[2.25rem] p-6 sm:p-12 bg-white/82 backdrop-blur-xl border border-[#B8923E]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_28px_64px_-18px_rgba(140,104,25,0.16)]">
        <div data-seal-role="crest" className="flex justify-center">
          <div
            className="p-3.5 sm:p-4 rounded-full bg-white/85 backdrop-blur-md border shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_16px_38px_rgba(140,104,25,0.14)]"
            style={{ borderColor: edition.theme.accentBorderRgba }}
          >
            <SocietyCrest
              accentColor={edition.theme.accentHex}
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
          </div>
        </div>

        <div data-seal-role="lead" className="space-y-2">
          <p className="gold-foil-text text-xs sm:text-sm font-mono uppercase tracking-[0.26em] font-semibold">
            {edition.heading1} · {EVENT_METADATA.venue}
          </p>
          <h2 className="gold-foil-text text-2xl sm:text-5xl font-bold tracking-tight uppercase">
            {edition.heading2}
          </h2>
          <p className="font-serif italic text-xl sm:text-3xl text-[#7D5A11]">
            {edition.content1}
          </p>
        </div>

        <div
          data-seal-role="support"
          className="pt-4 border-t border-[#B8923E]/30 max-w-xl mx-auto space-y-1.5"
        >
          <p className="text-sm sm:text-lg font-semibold text-[#7A5812]">
            {edition.content3}
          </p>
          <p className="text-xs sm:text-base text-[#5E481A] leading-relaxed">
            {edition.content4}
          </p>
        </div>

        <div data-seal-role="actions" className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={scrollToTop}
            className="btn-tactile inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hover:bg-white border border-[#B8923E]/35 shadow-[0_6px_18px_rgba(140,104,25,0.08)] text-xs font-mono uppercase tracking-[0.18em] text-[#7A5812] hover:text-[#573E0B] cursor-pointer"
          >
            <ArrowUp size={14} />
            <span>Back to Top</span>
          </button>

          {onReplayEnvelope && (
            <button
              type="button"
              onClick={onReplayEnvelope}
              className="btn-tactile inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hover:bg-white border border-[#B8923E]/35 shadow-[0_6px_18px_rgba(140,104,25,0.08)] text-xs font-mono uppercase tracking-[0.18em] text-[#7A5812] hover:text-[#573E0B] cursor-pointer"
            >
              <EnvelopeOpen size={14} style={{ color: edition.theme.accentHex }} />
              <span>Replay Envelope</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
