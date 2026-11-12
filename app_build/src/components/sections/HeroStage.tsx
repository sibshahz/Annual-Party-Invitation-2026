import { useEffect, useRef } from 'react';
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
  embedded?: boolean;
  onScrollToUnfold?: () => void;
  onReplayEnvelope?: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * Full-viewport, light-themed luxury gold Antigravity Hero stage featuring Heading 1 (14 NOV),
 * Heading 2 (COMPUTING SOCIETY), Content 1–4, floating 3D crest card, SplitText, and GSAP choreography.
 */
export function HeroStage({
  edition,
  guestName,
  batchLabel,
  heroRevealed,
  embedded = false,
  onScrollToUnfold,
  onReplayEnvelope,
}: HeroStageProps) {
  const heroRef = useRef<HTMLElement>(null);
  const content2Ref = useRef<HTMLParagraphElement>(null);
  const animCtrlRef = useRef<{ play: () => void; reverse: () => void } | null>(null);
  const heroRevealedRef = useRef(heroRevealed);
  heroRevealedRef.current = heroRevealed;

  const { contextSafe } = useGSAP(
    () => {
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
          const leadAccent = q('[data-hero-role="lead-accent"]');
          const supportItems = q('[data-hero-role="support"]');
          const standaloneCards = q('[data-hero-card]');

          if (reduceMotion) {
            gsap.set([...leadAccent, ...supportItems, ...standaloneCards], {
              autoAlpha: 1,
              x: 0,
              y: 0,
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              rotation: 0,
              rotateX: 0,
              rotateY: 0,
            });
            animCtrlRef.current = null;
            return;
          }

          const tl = gsap.timeline({ paused: true, defaults: { ease: 'luxurySilk' } });

          // In embedded mode, the outer panel carries the stage cleanly (one entrance per container);
          // in standalone mode, give the porcelain cards a single unified entrance first.
          if (!embedded && standaloneCards.length > 0) {
            tl.fromTo(
              standaloneCards,
              {
                y: 24,
                autoAlpha: 0,
                scale: 0.97,
                transformPerspective: 1100,
                rotateX: 6,
              },
              {
                y: 0,
                autoAlpha: 1,
                scale: 1,
                transformPerspective: 1100,
                rotateX: 0,
                duration: 0.62,
                stagger: { amount: 0.08, ease: 'power1.out' },
              },
              0
            );
          }

          const copyStart = embedded ? 0 : 0.14;

          if (leadAccent.length > 0) {
            tl.fromTo(
              leadAccent,
              { y: 12, x: -4, rotation: -1.2, autoAlpha: 0 },
              { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 0.48, ease: 'luxurySilk' },
              copyStart
            );
          }

          let splitContent2: SplitText | null = null;
          if (content2Ref.current) {
            splitContent2 = SplitText.create(content2Ref.current, {
              type: 'words',
              aria: 'auto',
            });
            if (splitContent2.words.length > 0) {
              tl.fromTo(
                splitContent2.words,
                { y: 10, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.42,
                  stagger: { amount: 0.2, from: 'start', ease: 'power1.out' },
                  ease: 'editorialGlide',
                },
                copyStart + 0.07
              );
            }
          }

          if (supportItems.length > 0) {
            tl.fromTo(
              supportItems,
              { y: 10, x: 4, rotation: 1, autoAlpha: 0 },
              {
                y: 0,
                x: 0,
                rotation: 0,
                autoAlpha: 1,
                duration: 0.38,
                stagger: { amount: 0.06, ease: 'power1.out' },
                ease: 'emilOut',
              },
              copyStart + 0.16
            );
          }

          animCtrlRef.current = {
            play: () => tl.play(),
            reverse: () => tl.reverse(),
          };

          if (heroRevealedRef.current) {
            tl.play(0);
          }

          if (!embedded) {
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
          }

          return () => {
            animCtrlRef.current = null;
            tl.kill();
            splitContent2?.revert();
          };
        },
        heroRef
      );

      return () => mm.revert();
    },
    { scope: heroRef, dependencies: [edition.slug, embedded], revertOnUpdate: true }
  );

  useEffect(() => {
    if (!animCtrlRef.current) return;
    if (heroRevealed) {
      animCtrlRef.current.play();
    } else {
      animCtrlRef.current.reverse();
    }
  }, [heroRevealed]);

  const resolvedGuest = guestName || edition.defaultGuestTitle;

  const scrollToUnfold = contextSafe(() => {
    if (onScrollToUnfold) {
      onScrollToUnfold();
      return;
    }
    if (prefersReducedMotion()) {
      document.getElementById('invitation-unfold')?.scrollIntoView({ behavior: 'auto' });
      return;
    }
    gsap.to(window, {
      duration: 1.05,
      scrollTo: { y: '#invitation-unfold', offsetY: 0 },
      ease: 'power3.inOut',
    });
  });

  return (
    <section
      ref={heroRef}
      className={
        embedded
          ? 'relative w-full h-full flex flex-col justify-between pt-4 sm:pt-8 pb-4 sm:pb-6 overflow-y-auto lg:overflow-hidden'
          : `relative min-h-[100dvh] flex flex-col justify-between pt-8 sm:pt-12 pb-8 overflow-hidden transition-opacity duration-200 ${
              heroRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`
      }
    >
      {/* Top quiet edition watermark (menu-less, never truncated) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
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
              className="btn-tactile inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-[0.16em] px-3 py-1 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-[#B8923E]/35 shadow-[0_6px_20px_rgba(140,104,25,0.08)] text-[#7A5812] hover:text-[#4F3708] cursor-pointer"
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
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-10 items-center">
          {/* Left Typographic Lockup */}
          <div className="lg:col-span-7" data-parallax="fg" data-hero-column="lead">
            <div
              data-hero-card
              className="rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 bg-white/82 backdrop-blur-xl border border-[#B8923E]/32 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_28px_64px_-18px_rgba(140,104,25,0.16)] space-y-3.5 sm:space-y-6"
            >
              {/* Heading 1: 14 NOV */}
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
                <span className="gold-foil-text font-mono text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-none">
                  {edition.heading1}
                </span>
                <span className="h-px w-10 bg-[#B8923E]/45 hidden sm:inline-block align-middle" />
                <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.22em] text-[#8C6414]">
                  {EVENT_METADATA.weekdayLabel}
                </span>
              </div>

              {/* Heading 2: COMPUTING SOCIETY */}
              <div className="w-full max-w-5xl">
                <h1 className="gold-foil-text text-[clamp(2.15rem,5vw,4.85rem)] font-bold tracking-tighter leading-[0.94] uppercase">
                  {edition.heading2}
                </h1>
              </div>

              {/* Content 1 & Content 2 */}
              <div className="space-y-1.5 sm:space-y-2.5 max-w-3xl">
                <p
                  data-hero-role="lead-accent"
                  className="font-serif italic text-2xl sm:text-4xl md:text-[2.65rem] leading-[1.08] text-[#7D5A11]"
                >
                  {edition.content1}
                </p>
                <p ref={content2Ref} className="text-sm sm:text-lg text-[#5C4518] leading-relaxed">
                  {edition.content2}
                </p>
              </div>

              {/* Optional Personalized Guest Tag (?guest= / ?batch=) */}
              {(guestName || batchLabel) && (
                <div
                  data-hero-role="support"
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
                data-hero-role="support"
                className="pt-2.5 sm:pt-3 border-t border-[#B8923E]/30 space-y-0.5 sm:space-y-1 max-w-2xl"
              >
                <p className="text-xs sm:text-base font-semibold tracking-wide text-[#7A5812]">
                  {edition.content3}
                </p>
                <p className="text-xs sm:text-base text-[#5E481A] leading-relaxed">
                  {edition.content4}
                </p>
              </div>
            </div>
          </div>

          {/* Right Weightless 3D Porcelain Glass Invitation Crest Card */}
          <div className="lg:col-span-5" data-parallax="mid" data-hero-column="crest">
            <div data-hero-card>
              <div className="animate-float-spatial">
                <TiltSurface maxTiltDeg={7}>
                <div
                  className="relative rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-8 bg-white/85 backdrop-blur-xl border border-[#B8923E]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_28px_64px_-16px_rgba(140,104,25,0.18)] overflow-hidden"
                  style={{ transformStyle: 'preserve-3d' }}
                >
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

                  <div
                    className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-2xl opacity-22 pointer-events-none"
                    style={{ backgroundColor: edition.theme.accentHex }}
                    aria-hidden="true"
                  />

                  <div className="relative space-y-4 sm:space-y-6" style={{ transform: 'translateZ(20px)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <SocietyCrest
                        accentColor={edition.theme.accentHex}
                        className="w-12 h-12 sm:w-16 sm:h-16 shrink-0"
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

                    <div className="space-y-1.5 sm:space-y-2">
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8C6414]">
                        Cordially Addressed To
                      </p>
                      <p className="text-lg sm:text-2xl font-semibold text-[#6E4E0F] leading-snug">
                        {resolvedGuest}
                      </p>
                      <p className="text-xs sm:text-sm text-[#5E481A] leading-relaxed">
                        {edition.cardSummary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 sm:pt-4 border-t border-[#B8923E]/25">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[#8C6414]">
                          <CalendarBlank size={13} style={{ color: edition.theme.accentHex }} />
                          <span>Date</span>
                        </span>
                        <span className="block text-xs sm:text-sm font-semibold text-[#6E4E0F] mt-1">
                          {EVENT_METADATA.fullDateLabel}
                        </span>
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[#8C6414]">
                          <MapPin size={13} style={{ color: edition.theme.accentHex }} />
                          <span>Venue</span>
                        </span>
                        <span className="block text-xs sm:text-sm font-semibold text-[#6E4E0F] mt-1">
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
      </div>

      {/* Minimal Scroll Cue */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-center pt-1 sm:pt-2">
        <button
          type="button"
          onClick={scrollToUnfold}
          className="btn-tactile group inline-flex flex-col items-center gap-1 px-5 py-1.5 sm:py-2 rounded-full bg-white/82 hover:bg-white backdrop-blur-md border border-[#B8923E]/30 shadow-[0_6px_20px_rgba(140,104,25,0.08)] text-[11px] font-mono uppercase tracking-[0.22em] text-[#7A5812] hover:text-[#573E0B] cursor-pointer"
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
