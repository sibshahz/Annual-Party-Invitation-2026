import { useLayoutEffect, useMemo, useRef } from 'react';
import { CalendarBlank, MapPin, Users } from '@phosphor-icons/react';
import { EVENT_METADATA } from '../../data/invitations';
import type { InvitationEdition } from '../../types/invitation';
import { gsap } from '../../utils/gsapConfig';
import { SocietyCrest } from '../ui/SocietyCrest';

interface InvitationCardRevealProps {
  edition: InvitationEdition;
  guestName?: string;
}

/**
 * Light-themed luxury gold ScrollTrigger 3D Antigravity Invitation Card Unfold:
 * pins on desktop while tilting upright from perspective depth and scrubbing the
 * formal invitation message word-by-word; flows naturally unpinned on mobile.
 */
export function InvitationCardReveal({ edition, guestName }: InvitationCardRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  const words = useMemo(() => edition.invitationMessage.split(/\s+/), [edition.invitationMessage]);
  const resolvedGuest = guestName || edition.defaultGuestTitle;

  useLayoutEffect(() => {
    if (!sectionRef.current || !pinTargetRef.current || !cardRef.current || !textRef.current) {
      return;
    }

    const wordNodes = textRef.current.querySelectorAll('[data-scrub-word]');
    const metaChips = cardRef.current.querySelectorAll('[data-card-detail]');
    const mm = gsap.matchMedia();

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinTargetRef.current,
            pin: pinTargetRef.current,
            start: 'top top',
            end: '+=760',
            scrub: 0.7,
            pinSpacing: true,
            anticipatePin: 1,
            refreshPriority: 5,
          },
        });

        tl.fromTo(
          cardRef.current,
          {
            transformPerspective: 1200,
            rotateX: 14,
            scale: 0.9,
            y: 56,
            opacity: 0.35,
          },
          {
            transformPerspective: 1200,
            rotateX: 0,
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.38,
            ease: 'power2.out',
          }
        )
          .fromTo(
            wordNodes,
            { opacity: 0.16 },
            {
              opacity: 1,
              stagger: 0.025,
              duration: 0.55,
              ease: 'none',
            },
            '-=0.15'
          )
          .fromTo(
            metaChips,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.08, duration: 0.28, ease: 'power2.out' },
            '-=0.22'
          );
      });

      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          cardRef.current,
          { y: 36, opacity: 0.35, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 84%',
              once: true,
              refreshPriority: 5,
            },
          }
        );

        gsap.fromTo(
          wordNodes,
          { opacity: 0.18 },
          {
            opacity: 1,
            stagger: 0.03,
            ease: 'none',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 82%',
              end: 'bottom 58%',
              scrub: 0.6,
              refreshPriority: 5,
            },
          }
        );

        gsap.fromTo(
          metaChips,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.5,
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'center 85%',
              once: true,
              refreshPriority: 5,
            },
          }
        );
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(cardRef.current, { opacity: 1, y: 0, scale: 1, rotateX: 0 });
        gsap.set(wordNodes, { opacity: 1 });
        gsap.set(metaChips, { opacity: 1, y: 0 });
      });

    return () => mm.revert();
  }, [edition.slug]);

  return (
    <section
      id="invitation-unfold"
      ref={sectionRef}
      className="relative border-y border-[#B8923E]/22"
      aria-label="Formal invitation message"
    >
      {/* Inner container isolated for GSAP ScrollTrigger pinning */}
      <div
        ref={pinTargetRef}
        className="min-h-[100dvh] flex items-center justify-center py-16 md:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl w-full mx-auto">
          <div
            ref={cardRef}
            className="relative rounded-[2.25rem] p-7 sm:p-11 md:p-14 bg-white/85 backdrop-blur-xl border border-[#B8923E]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_34px_82px_-20px_rgba(140,104,25,0.18)] space-y-8 overflow-hidden will-change-transform"
          >
            <div
              className="absolute -left-24 -top-24 w-72 h-72 rounded-full blur-3xl opacity-22 pointer-events-none"
              style={{ backgroundColor: edition.theme.accentHex }}
              aria-hidden="true"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#B8923E]/25">
              <div className="flex items-center gap-3.5">
                <SocietyCrest accentColor={edition.theme.accentHex} className="w-10 h-10 shrink-0" />
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8C6414]">
                    {edition.invitationLead}
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-[#6B4D0E]">
                    {resolvedGuest}
                  </p>
                </div>
              </div>

              <span className="gold-foil-text font-serif italic text-xl sm:text-2xl">
                {edition.content1}
              </span>
            </div>

            <p
              ref={textRef}
              className="relative text-2xl sm:text-3xl md:text-[2.35rem] font-medium tracking-tight leading-[1.28] text-[#5B4210]"
            >
              {words.map((word, idx) => (
                <span key={`${idx}-${word}`} data-scrub-word className="inline-block mr-[0.28em]">
                  {word}
                </span>
              ))}
            </p>

            {/* Staggered Ceremonial Metadata Chips */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
              <div
                data-card-detail
                className="rounded-2xl p-4 bg-[#FAF8F3]/90 border border-[#B8923E]/25 space-y-1"
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
                className="rounded-2xl p-4 bg-[#FAF8F3]/90 border border-[#B8923E]/25 space-y-1"
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
                className="rounded-2xl p-4 bg-[#FAF8F3]/90 border border-[#B8923E]/25 space-y-1"
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

            <div className="relative flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#B8923E]/25">
              <p className="font-serif italic text-lg sm:text-xl text-[#7A5812]">
                {edition.ceremonialClosing}
              </p>
              <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#8C6414]">
                {edition.content3}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
