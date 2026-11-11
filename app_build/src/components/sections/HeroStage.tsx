import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, CalendarBlank, EnvelopeOpen, MapPin } from '@phosphor-icons/react';
import { EVENT_METADATA } from '../../data/invitations';
import type { InvitationEdition } from '../../types/invitation';
import { gsap, SplitText, useGSAP } from '../../utils/gsapConfig';
import { SocietyCrest } from '../ui/SocietyCrest';
import { TiltSurface } from '../ui/TiltSurface';

interface HeroStageProps {
  edition: InvitationEdition;
  guestName?: string;
  batchLabel?: string;
  heroRevealed: boolean;
  onReplayEnvelope?: () => void;
}

/**
 * Full-viewport, light-themed luxury gold Antigravity Hero stage featuring Heading 1 (14 NOV),
 * Heading 2 (COMPUTING SOCIETY), Content 1–4, floating 3D crest card, SplitText, and GSAP parallax.
 */
export function HeroStage({
  edition,
  guestName,
  batchLabel,
  heroRevealed,
  onReplayEnvelope,
}: HeroStageProps) {
  const heroRef = useRef<HTMLElement>(null);
  const content2Ref = useRef<HTMLParagraphElement>(null);

  const { contextSafe } = useGSAP({ scope: heroRef });

  useLayoutEffect(() => {
    if (!heroRef.current) return;
    const q = gsap.utils.selector(heroRef);
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        isMobile: '(max-width: 767px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};
          const revealItems = q('[data-hero-reveal]');
          const heroCards = q('[data-hero-card]');
          const allHeroTargets = [...revealItems, ...heroCards];

          if (reduceMotion) {
            gsap.set(allHeroTargets, {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
              clearProps: 'clipPath',
            });
            return;
          }

          if (!heroRevealed) {
            gsap.set(allHeroTargets, { opacity: 0 });
            return;
          }

          const tl = gsap.timeline({ defaults: { ease: 'luxurySilk' } });

          tl.fromTo(
            heroCards,
            {
              y: 44,
              opacity: 0,
              scale: 0.94,
              transformPerspective: 1100,
              rotateX: 11,
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              transformPerspective: 1100,
              rotateX: 0,
              duration: 0.95,
              stagger: 0.12,
            }
          ).fromTo(
            revealItems,
            { y: 24, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
            {
              y: 0,
              opacity: 1,
              clipPath: 'inset(0 0 0% 0)',
              duration: 0.85,
              stagger: 0.08,
              clearProps: 'clipPath',
            },
            '-=0.72'
          );

          let splitContent2: SplitText | null = null;
          if (content2Ref.current) {
            splitContent2 = SplitText.create(content2Ref.current, {
              type: 'words',
              aria: 'auto',
            });
            if (splitContent2.words.length > 0) {
              tl.fromTo(
                splitContent2.words,
                { y: 16, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.58,
                  stagger: 0.03,
                  ease: 'power3.out',
                },
                '-=0.72'
              );
            }
          }

          if (isDesktop) {
            gsap.to(q('[data-parallax="mid"]'), {
              y: -58,
              rotateX: -5,
              transformPerspective: 1100,
              ease: 'none',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.65,
                refreshPriority: 10,
              },
            });

            gsap.to(q('[data-parallax="fg"]'), {
              y: -26,
              ease: 'none',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.65,
                refreshPriority: 10,
              },
            });
          } else {
            gsap.to(q('[data-parallax="mid"]'), {
              y: -18,
              ease: 'none',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.6,
                refreshPriority: 10,
              },
            });
          }

          return () => {
            splitContent2?.revert();
          };
      },
      heroRef
    );

    return () => mm.revert();
  }, [edition.slug, heroRevealed]);

  const resolvedGuest = guestName || edition.defaultGuestTitle;

  const scrollToUnfold = contextSafe(() => {
    gsap.to(window, {
      duration: 1.05,
      scrollTo: { y: '#invitation-unfold', offsetY: 0 },
      ease: 'power3.inOut',
    });
  });

  return (
    <section
      ref={heroRef}
      className={`relative min-h-[100dvh] flex flex-col justify-between pt-8 sm:pt-12 pb-8 overflow-hidden transition-opacity duration-200 ${
        heroRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Top quiet edition watermark (menu-less, never truncated) */}
      <div
        data-hero-reveal
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-[#B8923E]/30 shadow-[0_6px_20px_rgba(140,104,25,0.08)]">
          <SocietyCrest accentColor={edition.theme.accentHex} className="w-7 h-7 shrink-0" />
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#7A5812] font-medium">
            {edition.editionBadge}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onReplayEnvelope && (
            <button
              type="button"
              onClick={onReplayEnvelope}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-[0.16em] px-3 py-1 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-[#B8923E]/35 shadow-[0_6px_20px_rgba(140,104,25,0.08)] text-[#7A5812] hover:text-[#4F3708] transition-colors cursor-pointer"
            >
              <EnvelopeOpen size={13} style={{ color: edition.theme.accentHex }} />
              <span>Replay Envelope</span>
            </button>
          )}

          <span
            className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md border border-[#B8923E]/35 shadow-[0_6px_20px_rgba(140,104,25,0.08)] font-medium"
            style={{ color: edition.theme.accentHex }}
          >
            {EVENT_METADATA.venue}
          </span>
        </div>
      </div>

      {/* Main Asymmetric Hero Stage */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          {/* Left Typographic Lockup */}
          <div className="lg:col-span-7" data-parallax="fg">
            <div
              data-hero-card
              className="rounded-[2rem] p-6 sm:p-8 lg:p-10 bg-white/82 backdrop-blur-xl border border-[#B8923E]/32 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_28px_64px_-18px_rgba(140,104,25,0.16)] space-y-6"
            >
            {/* Heading 1: 14 NOV */}
            <div data-hero-reveal className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span className="gold-foil-text font-mono text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-none">
                {edition.heading1}
              </span>
              <span className="h-px w-10 bg-[#B8923E]/45 hidden sm:inline-block align-middle" />
              <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.22em] text-[#8C6414]">
                {EVENT_METADATA.weekdayLabel}
              </span>
            </div>

            {/* Heading 2: COMPUTING SOCIETY */}
            <div data-hero-reveal className="w-full max-w-5xl">
              <h1 className="gold-foil-text text-[clamp(2.55rem,5.2vw,4.85rem)] font-bold tracking-tighter leading-[0.94] uppercase">
                {edition.heading2}
              </h1>
            </div>

            {/* Content 1 & Content 2 */}
            <div data-hero-reveal className="space-y-2.5 max-w-3xl">
              <p className="font-serif italic text-3xl sm:text-4xl md:text-[2.65rem] leading-[1.08] text-[#7D5A11]">
                {edition.content1}
              </p>
              <p ref={content2Ref} className="text-base sm:text-lg text-[#5C4518] leading-relaxed">
                {edition.content2}
              </p>
            </div>

            {/* Optional Personalized Guest Tag (?guest= / ?batch=) */}
            {(guestName || batchLabel) && (
              <div
                data-hero-reveal
                className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 rounded-xl border bg-white/80 backdrop-blur-md shadow-[0_8px_24px_rgba(140,104,25,0.06)]"
                style={{ borderColor: edition.theme.accentBorderRgba }}
              >
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#8C6414]">
                  Addressed To
                </span>
                <span className="text-sm font-semibold text-[#5A400D]">{resolvedGuest}</span>
                {batchLabel && (
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#B8923E]/12"
                    style={{ color: edition.theme.accentHex }}
                  >
                    {batchLabel}
                  </span>
                )}
              </div>
            )}

            {/* Content 3 & Content 4 */}
            <div
              data-hero-reveal
              className="pt-3 border-t border-[#B8923E]/30 space-y-1 max-w-2xl"
            >
              <p className="text-sm sm:text-base font-semibold tracking-wide text-[#7A5812]">
                {edition.content3}
              </p>
              <p className="text-sm sm:text-base text-[#5E481A] leading-relaxed">
                {edition.content4}
              </p>
            </div>
            </div>
          </div>

          {/* Right Weightless 3D Porcelain Glass Invitation Crest Card */}
          <div className="lg:col-span-5" data-parallax="mid">
            <div data-hero-card className="animate-float-spatial">
              <TiltSurface maxTiltDeg={7}>
                <div
                  className="relative rounded-[2rem] p-7 sm:p-8 bg-white/85 backdrop-blur-xl border border-[#B8923E]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_28px_64px_-16px_rgba(140,104,25,0.18)] overflow-hidden"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Subtle Isometric Wireframe Accent Inside Card */}
                  <div
                    className="absolute -right-10 -bottom-12 w-56 h-56 opacity-25 pointer-events-none"
                    style={{ transform: 'perspective(700px) rotateX(58deg) rotateZ(-42deg)' }}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                      <rect
                        x="20"
                        y="20"
                        width="160"
                        height="160"
                        rx="20"
                        stroke={edition.theme.accentHex}
                        strokeWidth="1.4"
                      />
                      <circle cx="100" cy="100" r="46" stroke="#8C6414" strokeOpacity="0.35" />
                    </svg>
                  </div>

                  {/* Soft Warm Atmospheric Accent Tint */}
                  <div
                    className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-2xl opacity-22 pointer-events-none"
                    style={{ backgroundColor: edition.theme.accentHex }}
                    aria-hidden="true"
                  />

                  <div className="relative space-y-6" style={{ transform: 'translateZ(20px)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <SocietyCrest
                        accentColor={edition.theme.accentHex}
                        className="w-16 h-16 shrink-0"
                      />
                      <div className="text-right">
                        <span className="block text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C6414]">
                          Official Crest
                        </span>
                        <span
                          className="block text-xs sm:text-sm font-mono font-semibold mt-0.5"
                          style={{ color: edition.theme.accentHex }}
                        >
                          {edition.passCategoryLabel}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8C6414]">
                        Cordially Addressed To
                      </p>
                      <p className="text-xl sm:text-2xl font-semibold text-[#6E4E0F] leading-snug">
                        {resolvedGuest}
                      </p>
                      <p className="text-sm text-[#5E481A] leading-relaxed">
                        {edition.cardSummary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#B8923E]/25">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[#8C6414]">
                          <CalendarBlank size={13} style={{ color: edition.theme.accentHex }} />
                          <span>Date</span>
                        </span>
                        <span className="block text-sm font-semibold text-[#6E4E0F] mt-1">
                          {EVENT_METADATA.fullDateLabel}
                        </span>
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[#8C6414]">
                          <MapPin size={13} style={{ color: edition.theme.accentHex }} />
                          <span>Venue</span>
                        </span>
                        <span className="block text-sm font-semibold text-[#6E4E0F] mt-1">
                          {EVENT_METADATA.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltSurface>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Scroll Cue */}
      <div
        data-hero-reveal
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-center pt-2"
      >
        <button
          type="button"
          onClick={scrollToUnfold}
          className="group inline-flex flex-col items-center gap-1.5 px-5 py-2 rounded-full bg-white/82 hover:bg-white backdrop-blur-md border border-[#B8923E]/30 shadow-[0_6px_20px_rgba(140,104,25,0.08)] text-[11px] font-mono uppercase tracking-[0.22em] text-[#7A5812] hover:text-[#573E0B] transition-colors cursor-pointer"
        >
          <span>Scroll to Unfold Invitation</span>
          <ArrowDown
            size={16}
            className="animate-scroll-cue"
            style={{ color: edition.theme.accentHex }}
          />
        </button>
      </div>
    </section>
  );
}
