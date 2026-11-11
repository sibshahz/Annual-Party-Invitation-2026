import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INVITATION_EDITIONS } from '../../data/invitations';
import type { EditionSlug } from '../../types/invitation';
import { gsap, ScrollTrigger, useGSAP } from '../../utils/gsapConfig';
import { sanitizeQueryValue } from '../../utils/personalization';
import { AmbientBackdrop } from '../layout/AmbientBackdrop';
import { ScrollProgress } from '../layout/ScrollProgress';
import { GoldenEnvelopeStage } from '../sections/GoldenEnvelopeStage';
import { HeroStage } from '../sections/HeroStage';
import { InstitutionalSeal } from '../sections/InstitutionalSeal';
import { InvitationCardReveal } from '../sections/InvitationCardReveal';

interface InvitationViewProps {
  editionSlug: EditionSlug;
}

/**
 * Single-page, menu-less animated invitation view rendered strictly for its
 * assigned guest route without navigation bars or cross-route links.
 */
export function InvitationView({ editionSlug }: InvitationViewProps) {
  const edition = INVITATION_EDITIONS[editionSlug];
  const [searchParams] = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);

  const queryGuest = sanitizeQueryValue(searchParams.get('guest'));
  const queryBatch = sanitizeQueryValue(searchParams.get('batch'));

  const [envelopeOpen, setEnvelopeOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [heroRevealed, setHeroRevealed] = useState<boolean>(envelopeOpen);
  const [replayNonce, setReplayNonce] = useState(0);
  const [surgeNonce, setSurgeNonce] = useState(0);

  const { contextSafe } = useGSAP({ scope: rootRef });

  useEffect(() => {
    document.title = `${edition.heading1} | ${edition.heading2} — ${edition.pageTitleLabel}`;
    window.scrollTo(0, 0);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setEnvelopeOpen(prefersReduced);
    setHeroRevealed(prefersReduced);

    let cancelled = false;
    const refreshId = window.requestAnimationFrame(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(refreshId);
    };
  }, [edition.slug, edition.heading1, edition.heading2, edition.pageTitleLabel]);

  const handleOpeningStart = useCallback(() => {
    setSurgeNonce((n) => n + 1);
  }, []);

  const handleRevealHero = useCallback(() => {
    setHeroRevealed(true);
  }, []);

  const handleEnvelopeComplete = useCallback(() => {
    setEnvelopeOpen(true);
    setHeroRevealed(true);
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  const handleReplayEnvelope = contextSafe(() => {
    const startReplay = () => {
      setHeroRevealed(false);
      setEnvelopeOpen(false);
      setReplayNonce((n) => n + 1);
    };

    if (window.scrollY > 12) {
      gsap.to(window, {
        duration: 0.45,
        scrollTo: { y: 0 },
        ease: 'power2.out',
        onComplete: startReplay,
      });
    } else {
      startReplay();
    }
  });

  return (
    <div ref={rootRef} className="relative min-h-[100dvh] text-[#5C4518]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#7A5812] focus:text-[#FAF8F3] focus:font-semibold"
      >
        Skip to invitation content
      </a>

      <ScrollProgress accentColor={edition.theme.accentHex} routeSlug={edition.slug} />
      <AmbientBackdrop theme={edition.theme} surgeNonce={surgeNonce} />

      <GoldenEnvelopeStage
        edition={edition}
        guestName={queryGuest}
        batchLabel={queryBatch}
        isOpen={envelopeOpen}
        replayNonce={replayNonce}
        onOpeningStart={handleOpeningStart}
        onRevealHero={handleRevealHero}
        onComplete={handleEnvelopeComplete}
      />

      <main id="main-content" className="relative z-10 overflow-x-hidden w-full max-w-full">
        <HeroStage
          edition={edition}
          guestName={queryGuest}
          batchLabel={queryBatch}
          heroRevealed={heroRevealed}
          onReplayEnvelope={handleReplayEnvelope}
        />
        <InvitationCardReveal edition={edition} guestName={queryGuest} />
        <InstitutionalSeal edition={edition} />
      </main>
    </div>
  );
}
