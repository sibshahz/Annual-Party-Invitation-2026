import { useEffect, useId, useRef } from 'react';
import { CalendarBlank, MapPin, Users } from '@phosphor-icons/react';
import { EVENT_METADATA } from '../../data/invitations';
import type { InvitationEdition } from '../../types/invitation';
import { gsap, SplitText, useGSAP } from '../../utils/gsapConfig';
import { SocietyCrest } from '../ui/SocietyCrest';

interface InvitationCardRevealProps {
  edition: InvitationEdition;
  guestName?: string;
  isActive?: boolean;
  embedded?: boolean;
}

/**
 * Light-themed luxury gold Invitation Card Unfold:
 * combines GSAP Timeline, SplitText (masked lines + autoSplit),
 * DrawSVGPlugin, CustomEase, and matchMedia inside useGSAP.
 */
export function InvitationCardReveal({
  edition,
  guestName,
  isActive = true,
  embedded = false,
}: InvitationCardRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardParallaxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const crestRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const guestRef = useRef<HTMLParagraphElement>(null);
  const editionTitleWrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const closingRef = useRef<HTMLParagraphElement>(null);
  const deptRef = useRef<HTMLParagraphElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  const cardCtrlRef = useRef<{ play: () => void; reset: () => void } | null>(null);
  const textCtrlRef = useRef<{ play: () => void; reset: () => void } | null>(null);
  const hasActivatedRef = useRef(false);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const uid = useId().replace(/:/g, '');
  const resolvedGuest = guestName || edition.defaultGuestTitle;

  useGSAP(
    () => {
      if (!sectionRef.current || !cardRef.current || !textRef.current) return;

      const q = gsap.utils.selector(sectionRef);
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          isMobile: '(max-width: 767px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};

          const chips = gsap.utils.toArray<HTMLElement>(q('[data-card-detail]'));
          const ruleLines = gsap.utils.toArray<SVGGeometryElement>(q('[data-rule-draw]'));
          const ruleDiamonds = gsap.utils.toArray<SVGElement>(q('[data-rule-diamond]'));

          if (reduceMotion) {
            gsap.set(
              [
                cardParallaxRef.current,
                cardRef.current,
                crestRef.current,
                leadRef.current,
                guestRef.current,
                editionTitleWrapRef.current,
                textRef.current,
                closingRef.current,
                deptRef.current,
                ...chips,
                ...ruleDiamonds,
              ].filter(Boolean),
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                xPercent: 0,
                yPercent: 0,
                scale: 1,
                rotation: 0,
                rotationX: 0,
                rotateY: 0,
                clearProps: 'clipPath',
              }
            );
            gsap.set(ruleLines, { drawSVG: '0% 100%' });
            if (sheenRef.current) gsap.set(sheenRef.current, { autoAlpha: 0 });
            cardCtrlRef.current = null;
            textCtrlRef.current = null;
            return;
          }

          if (!embedded && isDesktop && cardParallaxRef.current) {
            gsap.fromTo(
              cardParallaxRef.current,
              { y: 24 },
              {
                y: -24,
                ease: 'none',
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.75,
                  refreshPriority: 6,
                },
              }
            );
          }

          const splitGuest = guestRef.current
            ? SplitText.create(guestRef.current, {
                type: 'words',
                mask: 'words',
                aria: 'auto',
              })
            : null;

          const cardTl = gsap.timeline({
            paused: embedded,
            defaults: { ease: 'luxurySilk' },
            ...(embedded
              ? {}
              : {
                  scrollTrigger: {
                    trigger: cardRef.current,
                    start: 'top 78%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                    refreshPriority: 5,
                  },
                }),
          });

          // In embedded mode, InvitationView scrubs the outer panel + 3D unfold tilt directly,
          // so only play the card container entrance in standalone mode (one entrance per container).
          if (!embedded) {
            cardTl.fromTo(
              cardRef.current,
              {
                transformPerspective: 1200,
                rotationX: isDesktop ? 7 : 4,
                y: 28,
                scale: 0.97,
                autoAlpha: 0,
              },
              {
                transformPerspective: 1200,
                rotationX: 0,
                y: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.62,
              },
              0
            );
          }

          const headerAt = embedded ? 0 : 0.14;
          cardTl.addLabel('header', headerAt);

          if (crestRef.current) {
            cardTl.fromTo(
              crestRef.current,
              { scale: 0.9, rotation: -10, autoAlpha: 0, transformOrigin: '50% 50%' },
              { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.44, ease: 'waxSnap' },
              'header'
            );
          }

          if (leadRef.current) {
            cardTl.fromTo(
              leadRef.current,
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: 0, duration: 0.36, ease: 'emilOut' },
              'header+=0.04'
            );
          }

          if (splitGuest && splitGuest.words.length > 0) {
            cardTl.fromTo(
              splitGuest.words,
              { yPercent: 105, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: 0.44,
                stagger: { amount: 0.12, ease: 'power1.out' },
                ease: 'editorialGlide',
              },
              'header+=0.06'
            );
          }

          if (editionTitleWrapRef.current) {
            cardTl.fromTo(
              editionTitleWrapRef.current,
              { y: 8, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.42, ease: 'emilOut' },
              'header+=0.06'
            );
          }

          if (ruleLines.length > 0) {
            cardTl.fromTo(
              ruleLines,
              { drawSVG: '50% 50%' },
              {
                drawSVG: '0% 100%',
                duration: 0.56,
                stagger: 0.1,
                ease: 'power2.inOut',
              },
              'header+=0.08'
            );
          }

          if (ruleDiamonds.length > 0) {
            cardTl.fromTo(
              ruleDiamonds,
              { scale: 0.85, autoAlpha: 0, transformOrigin: '50% 50%' },
              {
                scale: 1,
                autoAlpha: 1,
                duration: 0.34,
                stagger: 0.1,
                ease: 'waxSnap',
              },
              'header+=0.14'
            );
          }

          cardTl.addLabel('details', 'header+=0.36');

          if (chips.length > 0) {
            const chipArcs = [
              {
                path: [
                  { x: -24, y: 20 },
                  { x: -14, y: -4 },
                  { x: 0, y: 0 },
                ],
                rotation: -5,
              },
              {
                path: [
                  { x: 0, y: 24 },
                  { x: 8, y: 6 },
                  { x: 0, y: 0 },
                ],
                rotation: 2.5,
              },
              {
                path: [
                  { x: 24, y: 20 },
                  { x: 14, y: -4 },
                  { x: 0, y: 0 },
                ],
                rotation: 5,
              },
            ];

            chips.forEach((chip, idx) => {
              const { path, rotation } = chipArcs[idx % chipArcs.length];
              gsap.set(chip, {
                x: path[0].x,
                y: path[0].y,
                scale: 0.94,
                rotation,
                transformOrigin: '50% 50%',
                autoAlpha: 0,
              });
              cardTl.to(
                chip,
                {
                  motionPath: {
                    path,
                    curviness: 1.35,
                    fromCurrent: false,
                  },
                  scale: 1,
                  rotation: 0,
                  autoAlpha: 1,
                  duration: 0.48,
                  ease: 'luxurySilk',
                },
                `details+=${(idx * 0.055).toFixed(3)}`
              );
            });
          }

          cardTl.addLabel('closing', 'details+=0.12');

          if (closingRef.current) {
            cardTl.fromTo(
              closingRef.current,
              { y: 8, x: -4, rotation: -0.8, autoAlpha: 0 },
              { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.38, ease: 'emilOut' },
              'closing'
            );
          }

          if (deptRef.current) {
            cardTl.fromTo(
              deptRef.current,
              { y: 8, x: 4, rotation: 0.8, autoAlpha: 0 },
              { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.34, ease: 'emilOut' },
              'closing+=0.04'
            );
          }

          if (sheenRef.current) {
            cardTl.fromTo(
              sheenRef.current,
              { xPercent: -135, autoAlpha: 0 },
              { xPercent: 135, autoAlpha: 0.82, duration: 0.88, ease: 'power2.inOut' },
              'closing+=0.04'
            );
          }

          // Focal Editorial Narrative (Lead): SplitText masked lines + autoSplit + gold-to-ink settle
          const splitMessage = SplitText.create(textRef.current, {
            type: 'lines, words',
            linesClass: 'editorial-line',
            mask: 'lines',
            autoSplit: true,
            aria: 'auto',
            propIndex: true,
            onSplit(self) {
              if (!self.words.length || !cardRef.current) return;

              const textTl = gsap.timeline({
                paused: embedded,
                onStart: () => {
                  self.masks.forEach((m) => {
                    (m as HTMLElement).style.overflow = 'clip';
                  });
                },
                onComplete: () => {
                  self.masks.forEach((m) => {
                    (m as HTMLElement).style.overflow = 'visible';
                  });
                },
                ...(embedded
                  ? {}
                  : {
                      scrollTrigger: {
                        trigger: cardRef.current,
                        start: 'top 78%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                        refreshPriority: 4,
                      },
                    }),
              });

              textTl
                .addLabel('reveal', embedded ? 0.12 : 0.24)
                .from(
                  self.words,
                  {
                    yPercent: 112,
                    rotationX: isDesktop ? -10 : -5,
                    transformPerspective: 750,
                    transformOrigin: '50% 100%',
                    autoAlpha: 0,
                    duration: 0.52,
                    stagger: { amount: 0.42, from: 'start', ease: 'power1.out' },
                    ease: 'editorialGlide',
                  },
                  'reveal'
                )
                .fromTo(
                  self.words,
                  { color: '#BA8B24' },
                  {
                    color: '#5B4210',
                    duration: 0.38,
                    stagger: { amount: 0.42, from: 'start', ease: 'power1.out' },
                    ease: 'power2.out',
                    immediateRender: false,
                  },
                  'reveal+=0.10'
                );

              if (embedded) {
                textCtrlRef.current = {
                  play: () => textTl.play(),
                  reset: () => {
                    self.masks.forEach((m) => {
                      (m as HTMLElement).style.overflow = 'clip';
                    });
                    textTl.reverse();
                  },
                };
                if (isActiveRef.current) {
                  if (hasActivatedRef.current) {
                    textTl.progress(1);
                  } else {
                    textTl.play(0);
                  }
                }
              }

              return textTl;
            },
          });

          if (embedded) {
            cardCtrlRef.current = {
              play: () => cardTl.play(),
              reset: () => cardTl.reverse(),
            };
            if (isActiveRef.current) {
              if (hasActivatedRef.current) {
                cardTl.progress(1);
              } else {
                cardTl.play(0);
              }
            }
          }

          return () => {
            cardCtrlRef.current = null;
            textCtrlRef.current = null;
            cardTl.kill();
            splitGuest?.revert();
            splitMessage.revert();
          };
        },
        sectionRef
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [edition.slug, resolvedGuest, embedded], revertOnUpdate: true }
  );

  useEffect(() => {
    if (!embedded) return;
    if (isActive) {
      hasActivatedRef.current = true;
      cardCtrlRef.current?.play();
      textCtrlRef.current?.play();
    } else {
      hasActivatedRef.current = false;
      cardCtrlRef.current?.reset();
      textCtrlRef.current?.reset();
    }
  }, [isActive, embedded]);

  return (
    <section
      id="invitation-unfold"
      ref={sectionRef}
      className={
        embedded
          ? 'relative w-full h-full flex items-center justify-center py-4 sm:py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto lg:overflow-hidden'
          : 'relative border-y border-[#B8923E]/22'
      }
      aria-label="Formal invitation message"
    >
      <div
        className={
          embedded
            ? 'w-full flex items-center justify-center'
            : 'min-h-[100dvh] flex items-center justify-center py-16 md:py-20 px-4 sm:px-6 lg:px-8'
        }
      >
        <div ref={cardParallaxRef} className="max-w-5xl w-full mx-auto will-change-transform">
          <div
            ref={cardRef}
            data-unfold-card
            className="relative rounded-[1.85rem] sm:rounded-[2.25rem] p-5 sm:p-10 md:p-12 bg-white/85 backdrop-blur-xl border border-[#B8923E]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_34px_82px_-20px_rgba(140,104,25,0.18)] space-y-4 sm:space-y-6 overflow-hidden will-change-transform"
          >
            <div
              className="absolute -left-24 -top-24 w-72 h-72 rounded-full blur-3xl opacity-22 pointer-events-none"
              style={{ backgroundColor: edition.theme.accentHex }}
              aria-hidden="true"
            />

            {/* Sweeping Diagonal Porcelain-Gold Sheen */}
            <div
              ref={sheenRef}
              className="absolute inset-y-0 -inset-x-12 pointer-events-none will-change-transform"
              style={{
                background:
                  'linear-gradient(112deg, transparent 34%, rgba(255,252,238,0.45) 49%, rgba(255,255,255,0.62) 50%, rgba(255,252,238,0.38) 51%, transparent 66%)',
              }}
              aria-hidden="true"
            />

            {/* Header Row */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div ref={crestRef} className="shrink-0">
                  <SocietyCrest accentColor={edition.theme.accentHex} className="w-9 h-9 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <p
                    ref={leadRef}
                    className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#8C6414]"
                  >
                    {edition.invitationLead}
                  </p>
                  <p
                    ref={guestRef}
                    className="text-sm sm:text-lg font-semibold text-[#6B4D0E]"
                  >
                    {resolvedGuest}
                  </p>
                </div>
              </div>

              <div ref={editionTitleWrapRef} className="shrink-0">
                <span className="gold-foil-text font-serif italic text-lg sm:text-2xl">
                  {edition.content1}
                </span>
              </div>
            </div>

            {/* Top DrawSVG Gold Hairline Rule */}
            <svg
              viewBox="0 0 800 12"
              preserveAspectRatio="none"
              className="relative w-full h-3 overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`${uid}-ruleTop`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B8923E" stopOpacity="0.18" />
                  <stop offset="50%" stopColor="#B8923E" stopOpacity="0.62" />
                  <stop offset="100%" stopColor="#B8923E" stopOpacity="0.18" />
                </linearGradient>
              </defs>
              <line
                data-rule-draw
                x1="0"
                y1="6"
                x2="800"
                y2="6"
                stroke={`url(#${uid}-ruleTop)`}
                strokeWidth="1.35"
              />
              <polygon
                data-rule-diamond
                points="400,2 404,6 400,10 396,6"
                fill={edition.theme.accentHex}
                fillOpacity="0.65"
              />
            </svg>

            {/* Focal Editorial Invitation Narrative (SplitText masked lines + autoSplit) */}
            <p
              ref={textRef}
              className="relative text-xl sm:text-3xl md:text-[2.25rem] font-medium tracking-tight leading-[1.34] text-[#5B4210]"
            >
              {edition.invitationMessage}
            </p>

            {/* Staggered Ceremonial Metadata Chips */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
              <div
                data-card-detail
                className="rounded-2xl p-3 sm:p-4 bg-[#FAF8F3]/90 border border-[#B8923E]/25 space-y-1"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#8C6414]">
                  <CalendarBlank size={14} style={{ color: edition.theme.accentHex }} />
                  <span>Date</span>
                </span>
                <p className="text-sm sm:text-base font-semibold text-[#6B4D0E]">
                  {EVENT_METADATA.fullDateLabel}
                </p>
              </div>

              <div
                data-card-detail
                className="rounded-2xl p-3 sm:p-4 bg-[#FAF8F3]/90 border border-[#B8923E]/25 space-y-1"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#8C6414]">
                  <MapPin size={14} style={{ color: edition.theme.accentHex }} />
                  <span>Venue</span>
                </span>
                <p className="text-sm sm:text-base font-semibold text-[#6B4D0E]">
                  {EVENT_METADATA.venue}
                </p>
              </div>

              <div
                data-card-detail
                className="rounded-2xl p-3 sm:p-4 bg-[#FAF8F3]/90 border border-[#B8923E]/25 space-y-1"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#8C6414]">
                  <Users size={14} style={{ color: edition.theme.accentHex }} />
                  <span>Host</span>
                </span>
                <p className="text-sm sm:text-base font-semibold text-[#6B4D0E]">
                  {edition.heading2}
                </p>
              </div>
            </div>

            {/* Bottom DrawSVG Gold Hairline Rule */}
            <svg
              viewBox="0 0 800 12"
              preserveAspectRatio="none"
              className="relative w-full h-3 overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`${uid}-ruleBottom`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B8923E" stopOpacity="0.18" />
                  <stop offset="50%" stopColor="#B8923E" stopOpacity="0.62" />
                  <stop offset="100%" stopColor="#B8923E" stopOpacity="0.18" />
                </linearGradient>
              </defs>
              <line
                data-rule-draw
                x1="0"
                y1="6"
                x2="800"
                y2="6"
                stroke={`url(#${uid}-ruleBottom)`}
                strokeWidth="1.35"
              />
              <polygon
                data-rule-diamond
                points="400,2 404,6 400,10 396,6"
                fill={edition.theme.accentHex}
                fillOpacity="0.65"
              />
            </svg>

            {/* Footer Closing Row */}
            <div className="relative flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <p
                ref={closingRef}
                className="font-serif italic text-base sm:text-xl text-[#7A5812]"
              >
                {edition.ceremonialClosing}
              </p>
              <p
                ref={deptRef}
                className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.16em] text-[#8C6414]"
              >
                {edition.content3}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
