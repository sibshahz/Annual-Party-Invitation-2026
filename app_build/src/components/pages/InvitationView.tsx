import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

const getPrefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * Single-page, menu-less animated invitation view orchestrating the 4-act spatial choreography:
 * 1) Golden envelope opens & holds emerged card until scrolled down -> closes & exits left
 * 2) HeroStage enters right-to-left -> pauses -> exits left
 * 3) InvitationCardReveal scrolls top-to-bottom -> plays multi-skill GSAP text reveal -> exits bottom
 * 4) InstitutionalSeal enters left-to-right and settles centered.
 */
export function InvitationView({ editionSlug }: InvitationViewProps) {
  const edition = INVITATION_EDITIONS[editionSlug];
  const [searchParams] = useSearchParams();

  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const pinnedViewportRef = useRef<HTMLDivElement>(null);
  const heroPanelRef = useRef<HTMLDivElement>(null);
  const cardPanelRef = useRef<HTMLDivElement>(null);
  const sealPanelRef = useRef<HTMLDivElement>(null);

  const closeTlRef = useRef<gsap.core.Timeline | null>(null);
  const masterStRef = useRef<ScrollTrigger | null>(null);
  const isReplayingRef = useRef(false);
  const replayFadeTweenRef = useRef<gsap.core.Tween | null>(null);

  const queryGuest = sanitizeQueryValue(searchParams.get('guest'));
  const queryBatch = sanitizeQueryValue(searchParams.get('batch'));

  const [prefersReduced, setPrefersReduced] = useState<boolean>(getPrefersReducedMotion);
  const [envelopeEmerged, setEnvelopeEmerged] = useState<boolean>(getPrefersReducedMotion);
  const [heroActive, setHeroActive] = useState<boolean>(getPrefersReducedMotion);
  const [cardActive, setCardActive] = useState<boolean>(getPrefersReducedMotion);
  const [sealActive, setSealActive] = useState<boolean>(getPrefersReducedMotion);
  const [replayNonce, setReplayNonce] = useState(0);
  const [surgeNonce, setSurgeNonce] = useState(0);

  // Sync reduced-motion media query changes dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      const reduced = mq.matches;
      setPrefersReduced(reduced);
      if (reduced) {
        setEnvelopeEmerged(true);
        setHeroActive(true);
        setCardActive(true);
        setSealActive(true);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.title = `${edition.heading1} | ${edition.heading2} — ${edition.pageTitleLabel}`;
    window.scrollTo(0, 0);

    const reduced = getPrefersReducedMotion();
    isReplayingRef.current = false;
    closeTlRef.current = null;
    masterStRef.current = null;
    setPrefersReduced(reduced);
    setEnvelopeEmerged(reduced);
    setHeroActive(reduced);
    setCardActive(reduced);
    setSealActive(reduced);

    if (mainRef.current) {
      gsap.set(mainRef.current, { autoAlpha: 1, clearProps: 'opacity,visibility' });
    }

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

  // Master 4-Act Pinned ScrollTrigger Choreography
  const { contextSafe } = useGSAP(
    () => {
      if (prefersReduced || !pinnedViewportRef.current) return;

      const q = gsap.utils.selector(pinnedViewportRef);
      const heroLeadCol = q('[data-hero-column="lead"]');
      const heroCrestCol = q('[data-hero-column="crest"]');
      const unfoldCard = q('[data-unfold-card]');
      const sealLattice = q('[data-seal-lattice]');

      // Keep off-screen acts hidden at the start of their smooth curved MotionPath entry arcs
      gsap.set(heroPanelRef.current, {
        xPercent: 104,
        yPercent: 28,
        rotation: 7,
        rotationY: -9,
        scale: 0.94,
        transformPerspective: 1400,
        transformOrigin: '50% 50%',
        autoAlpha: 0,
      });
      gsap.set(cardPanelRef.current, {
        xPercent: -38,
        yPercent: -106,
        rotation: -8.5,
        scale: 0.94,
        transformOrigin: '50% 50%',
        autoAlpha: 0,
      });
      gsap.set(sealPanelRef.current, {
        xPercent: -104,
        yPercent: 30,
        rotation: -7.5,
        rotationY: 9,
        scale: 0.94,
        transformPerspective: 1400,
        transformOrigin: '50% 50%',
        autoAlpha: 0,
      });

      if (!envelopeEmerged || !closeTlRef.current) {
        masterStRef.current = null;
        return;
      }

      if (heroLeadCol.length > 0) {
        gsap.set(heroLeadCol, {
          xPercent: 6,
          yPercent: 8,
          rotation: -2.2,
          transformOrigin: '50% 50%',
        });
      }
      if (heroCrestCol.length > 0) {
        gsap.set(heroCrestCol, {
          xPercent: 18,
          yPercent: 16,
          rotation: 5.5,
          scale: 0.95,
          transformOrigin: '50% 50%',
        });
      }
      if (sealLattice.length > 0) {
        gsap.set(sealLattice, {
          xPercent: -24,
          yPercent: 18,
          rotation: -16,
          scale: 0.9,
          transformOrigin: '50% 50%',
        });
      }

      const closeTl = closeTlRef.current;

      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinnedViewportRef.current,
          pin: pinnedViewportRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          start: 'top top',
          end: '+=4400',
          scrub: 0.72,
          invalidateOnRefresh: true,
          refreshPriority: 10,
          onUpdate: (self) => {
            const t = self.progress * 10;
            setHeroActive((prev) => (t >= 2.0 ? true : t < 1.45 ? false : prev));
            setCardActive((prev) => (t >= 4.95 ? true : t < 4.2 ? false : prev));
            setSealActive((prev) => (t >= 7.95 ? true : t < 7.2 ? false : prev));
          },
        },
      });

      // Beat 1 (0.00 -> 2.15): Close opened envelope again & glide along a gentle downward-left arc
      masterTl.add(closeTl, 0);

      // Beat 2 (1.55 -> 5.05): HeroStage glides up a serene horizon arc from right -> settles -> curves down-left
      masterTl
        .addLabel('heroEnter', 1.55)
        .to(
          heroPanelRef.current,
          {
            motionPath: {
              path: [
                { xPercent: 104, yPercent: 28 },
                { xPercent: 44, yPercent: -11 },
                { xPercent: 0, yPercent: 0 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: 0,
            rotationY: 0,
            scale: 1,
            transformPerspective: 1400,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'arcArrive',
          },
          'heroEnter'
        )
        .fromTo(
          heroPanelRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.42, ease: 'emilOut' },
          'heroEnter'
        );

      if (heroLeadCol.length > 0) {
        masterTl.to(
          heroLeadCol,
          {
            motionPath: {
              path: [
                { xPercent: 6, yPercent: 8 },
                { xPercent: 2, yPercent: -4 },
                { xPercent: 0, yPercent: 0 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: 0,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'arcArrive',
          },
          'heroEnter'
        );
      }

      if (heroCrestCol.length > 0) {
        masterTl.to(
          heroCrestCol,
          {
            motionPath: {
              path: [
                { xPercent: 18, yPercent: 16 },
                { xPercent: 8, yPercent: -9 },
                { xPercent: 0, yPercent: 0 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: 0,
            scale: 1,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'arcArrive',
          },
          'heroEnter'
        );
      }

      masterTl
        .addLabel('heroExit', 3.95)
        .to(
          heroPanelRef.current,
          {
            motionPath: {
              path: [
                { xPercent: 0, yPercent: 0 },
                { xPercent: -46, yPercent: -11 },
                { xPercent: -108, yPercent: 32 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: -7.5,
            rotationY: 9,
            scale: 0.94,
            transformPerspective: 1400,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'arcDepart',
            immediateRender: false,
          },
          'heroExit'
        )
        .to(
          heroPanelRef.current,
          { autoAlpha: 0, duration: 0.36, ease: 'emilOut', immediateRender: false },
          'heroExit+=0.74'
        );

      if (heroLeadCol.length > 0) {
        masterTl.to(
          heroLeadCol,
          {
            motionPath: {
              path: [
                { xPercent: 0, yPercent: 0 },
                { xPercent: -4, yPercent: -4 },
                { xPercent: -10, yPercent: 10 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: 2.2,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'arcDepart',
            immediateRender: false,
          },
          'heroExit'
        );
      }

      if (heroCrestCol.length > 0) {
        masterTl.to(
          heroCrestCol,
          {
            motionPath: {
              path: [
                { xPercent: 0, yPercent: 0 },
                { xPercent: -8, yPercent: -8 },
                { xPercent: -20, yPercent: 16 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: -5.5,
            scale: 0.95,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'arcDepart',
            immediateRender: false,
          },
          'heroExit'
        );
      }

      // Beat 3 (4.45 -> 8.15): InvitationCardReveal sweeps down a single continuous crescent arc from top-left -> settles -> exits bottom-right
      masterTl
        .addLabel('cardEnter', 4.45)
        .to(
          cardPanelRef.current,
          {
            motionPath: {
              path: [
                { xPercent: -38, yPercent: -106 },
                { xPercent: -26, yPercent: -32 },
                { xPercent: 0, yPercent: 0 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: 0,
            scale: 1,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'arcArrive',
          },
          'cardEnter'
        )
        .fromTo(
          cardPanelRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.42, ease: 'emilOut' },
          'cardEnter'
        );

      if (unfoldCard.length > 0) {
        masterTl.fromTo(
          unfoldCard,
          { transformPerspective: 1200, rotateX: 11, rotateY: -7 },
          {
            transformPerspective: 1200,
            rotateX: 0,
            rotateY: 0,
            duration: 1.1,
            ease: 'arcArrive',
          },
          'cardEnter'
        );
      }

      masterTl
        .addLabel('cardExit', 7.05)
        .to(
          cardPanelRef.current,
          {
            motionPath: {
              path: [
                { xPercent: 0, yPercent: 0 },
                { xPercent: 26, yPercent: 32 },
                { xPercent: 40, yPercent: 108 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: 8.5,
            scale: 0.94,
            transformOrigin: '50% 50%',
            duration: 1.1,
            ease: 'arcDepart',
            immediateRender: false,
          },
          'cardExit'
        )
        .to(
          cardPanelRef.current,
          { autoAlpha: 0, duration: 0.36, ease: 'emilOut', immediateRender: false },
          'cardExit+=0.74'
        );

      if (unfoldCard.length > 0) {
        masterTl.to(
          unfoldCard,
          {
            transformPerspective: 1200,
            rotateX: -9,
            rotateY: 7,
            duration: 1.1,
            ease: 'arcDepart',
            immediateRender: false,
          },
          'cardExit'
        );
      }

      // Beat 4 (7.50 -> 10.00): InstitutionalSeal rises along a gentle lower-left horizon arc and converges with trailing lattice
      masterTl
        .addLabel('sealEnter', 7.5)
        .to(
          sealPanelRef.current,
          {
            motionPath: {
              path: [
                { xPercent: -104, yPercent: 30 },
                { xPercent: -44, yPercent: -11 },
                { xPercent: 0, yPercent: 0 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: 0,
            rotationY: 0,
            scale: 1,
            transformPerspective: 1400,
            transformOrigin: '50% 50%',
            duration: 1.15,
            ease: 'arcArrive',
          },
          'sealEnter'
        )
        .fromTo(
          sealPanelRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.42, ease: 'emilOut' },
          'sealEnter'
        );

      if (sealLattice.length > 0) {
        masterTl.to(
          sealLattice,
          {
            motionPath: {
              path: [
                { xPercent: -24, yPercent: 18 },
                { xPercent: -8, yPercent: -9 },
                { xPercent: 0, yPercent: 0 },
              ],
              curviness: 1.35,
              fromCurrent: false,
            },
            rotation: 0,
            scale: 1,
            transformOrigin: '50% 50%',
            duration: 1.15,
            ease: 'arcArrive',
          },
          'sealEnter'
        );
      }

      masterTl.to({}, { duration: 1.35 }, 8.65);

      masterStRef.current = masterTl.scrollTrigger ?? null;
      window.requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        masterStRef.current = null;
        masterTl.scrollTrigger?.kill();
        masterTl.kill();
      };
    },
    {
      scope: rootRef,
      dependencies: [edition.slug, envelopeEmerged, prefersReduced, replayNonce],
      revertOnUpdate: true,
    }
  );

  const handleOpeningStart = useCallback(() => {
    setSurgeNonce((n) => n + 1);
  }, []);

  const handleEnvelopeEmerged = useCallback((closeTl: gsap.core.Timeline) => {
    closeTlRef.current = closeTl;
    setEnvelopeEmerged(true);
  }, []);

  const scrollToStageProgress = contextSafe((progress: number, duration = 1.35) => {
    const st = masterStRef.current;
    if (!st) return;
    const targetY = st.start + (st.end - st.start) * progress;
    gsap.to(window, {
      duration,
      scrollTo: { y: targetY, autoKill: true },
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  });

  const handleRequestScrollDown = useCallback(() => {
    scrollToStageProgress(0.33, 1.35);
  }, [scrollToStageProgress]);

  const handleScrollToUnfold = useCallback(() => {
    scrollToStageProgress(0.62, 1.3);
  }, [scrollToStageProgress]);

  useLayoutEffect(() => {
    if (replayNonce <= 0 || prefersReduced || !mainRef.current) return;

    replayFadeTweenRef.current?.kill();
    replayFadeTweenRef.current = gsap.fromTo(
      mainRef.current,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.24,
        ease: 'emilOut',
        clearProps: 'opacity,visibility',
      }
    );

    return () => {
      replayFadeTweenRef.current?.kill();
      replayFadeTweenRef.current = null;
    };
  }, [replayNonce, prefersReduced]);

  useEffect(() => {
    return () => {
      replayFadeTweenRef.current?.kill();
    };
  }, []);

  const handleReplayEnvelope = useCallback(() => {
    if (isReplayingRef.current) return;
    isReplayingRef.current = true;

    const startReplay = () => {
      window.scrollTo(0, 0);
      closeTlRef.current = null;
      masterStRef.current = null;
      setHeroActive(false);
      setCardActive(false);
      setSealActive(false);
      setEnvelopeEmerged(false);
      setReplayNonce((n) => n + 1);
      isReplayingRef.current = false;
    };

    if (!prefersReduced && mainRef.current) {
      replayFadeTweenRef.current?.kill();
      replayFadeTweenRef.current = gsap.to(mainRef.current, {
        autoAlpha: 0,
        duration: 0.2,
        ease: 'emilOut',
        onComplete: startReplay,
      });
    } else {
      startReplay();
    }
  }, [prefersReduced]);

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

      <main ref={mainRef} id="main-content" className="relative z-10 overflow-x-clip w-full max-w-full">
        {prefersReduced ? (
          <>
            <HeroStage
              edition={edition}
              guestName={queryGuest}
              batchLabel={queryBatch}
              heroRevealed={true}
            />
            <InvitationCardReveal edition={edition} guestName={queryGuest} />
            <InstitutionalSeal edition={edition} />
          </>
        ) : (
          <div ref={pinnedViewportRef} className="relative w-full h-[100dvh] overflow-hidden">
            <GoldenEnvelopeStage
              edition={edition}
              guestName={queryGuest}
              batchLabel={queryBatch}
              replayNonce={replayNonce}
              disabled={prefersReduced}
              onOpeningStart={handleOpeningStart}
              onEmerged={handleEnvelopeEmerged}
              onRequestScrollDown={handleRequestScrollDown}
            />

            <div
              ref={heroPanelRef}
              className="absolute inset-0 z-20 will-change-transform"
            >
              <HeroStage
                edition={edition}
                guestName={queryGuest}
                batchLabel={queryBatch}
                heroRevealed={heroActive}
                embedded={true}
                onScrollToUnfold={handleScrollToUnfold}
                onReplayEnvelope={handleReplayEnvelope}
              />
            </div>

            <div
              ref={cardPanelRef}
              className="absolute inset-0 z-30 will-change-transform"
            >
              <InvitationCardReveal
                edition={edition}
                guestName={queryGuest}
                isActive={cardActive}
                embedded={true}
              />
            </div>

            <div
              ref={sealPanelRef}
              className="absolute inset-0 z-[25] will-change-transform"
            >
              <InstitutionalSeal
                edition={edition}
                isActive={sealActive}
                embedded={true}
                onReplayEnvelope={handleReplayEnvelope}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
