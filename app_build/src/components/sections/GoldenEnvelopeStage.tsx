import { useId, useRef, useState } from 'react';
import { ArrowDown } from '@phosphor-icons/react';
import {
  gsap,
  Observer,
  SplitText,
  useGSAP,
} from '../../utils/gsapConfig';
import type { InvitationEdition } from '../../types/invitation';
import { SocietyCrest } from '../ui/SocietyCrest';

interface GoldenEnvelopeStageProps {
  edition: InvitationEdition;
  guestName?: string;
  batchLabel?: string;
  replayNonce: number;
  disabled?: boolean;
  onOpeningStart: () => void;
  onEmerged: (closeTimeline: gsap.core.Timeline) => void;
  onRequestScrollDown: () => void;
}

const MOTE_PATHS = [
  'M138,245 C92,188 68,125 56,48',
  'M542,245 C588,188 612,125 624,48',
  'M175,215 C140,145 128,88 142,24',
  'M505,215 C540,145 552,88 538,24',
  'M245,190 C228,125 232,68 258,18',
  'M435,190 C452,125 448,68 422,18',
];

const SEAL_CLOSED_PATH =
  'M48,10 C55,10 59,15 65,14 C71,13 76,18 78,24 C84,26 86,32 85,38 C89,43 88,50 85,55 C87,61 84,68 78,70 C76,76 70,80 64,79 C59,84 52,85 48,82 C42,85 35,84 30,79 C24,80 18,76 16,70 C10,68 7,61 9,55 C6,50 5,43 9,38 C8,32 10,26 16,24 C18,18 23,13 29,14 C35,15 41,10 48,10 Z';

const SEAL_OPEN_STARBURST_PATH =
  'M48,2 C54,18 65,14 78,10 C74,24 84,32 94,38 C80,46 82,58 92,68 C76,68 70,79 72,92 C59,82 48,84 48,95 C48,84 37,82 24,92 C26,79 20,68 4,68 C14,58 16,46 2,38 C12,32 22,24 18,10 C31,14 42,18 48,2 Z';

/**
 * Theatrical 3D luxury golden envelope opening sequence.
 * Remains opened with emerged card until the user scrolls down, then provides a
 * ScrollTrigger-scrubbed closing & left-exit child timeline to InvitationView.
 */
export function GoldenEnvelopeStage({
  edition,
  guestName,
  batchLabel,
  replayNonce,
  disabled = false,
  onOpeningStart,
  onEmerged,
  onRequestScrollDown,
}: GoldenEnvelopeStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const envelopeShellRef = useRef<HTMLDivElement>(null);
  const envelopeBodyRef = useRef<HTMLDivElement>(null);
  const envelopeBackRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pocketRef = useRef<HTMLDivElement>(null);
  const sealBtnRef = useRef<HTMLButtonElement>(null);
  const sealShapeRef = useRef<SVGPathElement>(null);
  const sealOpenShapeRef = useRef<SVGPathElement>(null);
  const sealRingRef = useRef<SVGCircleElement>(null);
  const pulseRing1Ref = useRef<SVGCircleElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const cardSubtitleRef = useRef<HTMLParagraphElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const scrollPromptRef = useRef<HTMLDivElement>(null);

  const hasTriggeredRef = useRef(false);
  const hasEmergedRef = useRef(false);
  const triggerOpenRef = useRef<() => void>(() => {});
  const [isUnsealing, setIsUnsealing] = useState(false);
  const [isEmerged, setIsEmerged] = useState(false);

  const onOpeningStartRef = useRef(onOpeningStart);
  onOpeningStartRef.current = onOpeningStart;
  const onEmergedRef = useRef(onEmerged);
  onEmergedRef.current = onEmerged;

  const uid = useId().replace(/:/g, '');
  const resolvedGuest = guestName || edition.defaultGuestTitle;

  const { contextSafe } = useGSAP(
    () => {
      if (disabled || !stageRef.current) return;

      hasTriggeredRef.current = false;
      hasEmergedRef.current = false;
      setIsUnsealing(false);
      setIsEmerged(false);

      const q = gsap.utils.selector(stageRef);
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          isMobile: '(max-width: 767px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};

          if (reduceMotion) return;

          const arriveX = isDesktop ? 108 : 64;
          const arriveY = isDesktop ? 112 : 76;

          const foilLines = gsap.utils.toArray<SVGGeometryElement>(q('[data-foil-draw]'));
          const motes = gsap.utils.toArray<SVGGElement>(q('[data-gold-mote]'));
          const motePaths = gsap.utils.toArray<SVGPathElement>(q('[data-mote-path]'));

          let splitSubtitle: SplitText | null = null;
          if (cardSubtitleRef.current) {
            splitSubtitle = SplitText.create(cardSubtitleRef.current, {
              type: 'words',
              aria: 'auto',
            });
            gsap.set(splitSubtitle.words, { autoAlpha: 0, y: 14 });
          }

          // Initial 3D resting geometry (positioned along curved arrival arc start)
          gsap.set(stageRef.current, { autoAlpha: 1, clearProps: 'pointerEvents' });
          gsap.set(envelopeShellRef.current, {
            transformPerspective: 1600,
            transformOrigin: '50% 50%',
            rotationX: 16,
            rotationY: -10,
            rotation: 9,
            x: arriveX,
            y: arriveY,
            xPercent: 0,
            yPercent: 0,
            scale: 0.9,
            autoAlpha: 1,
          });
          gsap.set(envelopeBodyRef.current, {
            transformPerspective: 1400,
            transformOrigin: '50% 50%',
            rotationX: 0,
            rotationY: 0,
            rotation: 0,
            y: 0,
          });
          gsap.set(flapRef.current, {
            transformPerspective: 1400,
            transformOrigin: 'top center',
            rotationX: 0,
            zIndex: 30,
          });
          gsap.set(cardRef.current, {
            xPercent: 0,
            yPercent: 0,
            scale: 0.96,
            rotation: 0,
            rotationX: 3,
            transformPerspective: 1200,
            transformOrigin: '50% 50%',
            zIndex: 10,
          });
          gsap.set(sealBtnRef.current, {
            scale: 1,
            x: 0,
            y: 0,
            rotation: 0,
            transformOrigin: '50% 50%',
            autoAlpha: 1,
          });
          gsap.set(foilLines, { drawSVG: '0% 0%' });
          if (sealRingRef.current) {
            gsap.set(sealRingRef.current, {
              drawSVG: '0% 0%',
              transformOrigin: '50% 50%',
            });
          }
          if (pulseRing1Ref.current) {
            gsap.set(pulseRing1Ref.current, {
              transformOrigin: '50% 50%',
              scale: 0.96,
              autoAlpha: 0,
            });
          }
          if (hintRef.current) {
            gsap.set(hintRef.current, { autoAlpha: 0, y: 8 });
          }
          if (scrollPromptRef.current) {
            gsap.set(scrollPromptRef.current, { autoAlpha: 0, y: 12 });
          }
          gsap.set(sheenRef.current, { xPercent: -135 });
          gsap.set(motes, { autoAlpha: 0, scale: 0.4 });

          // Pointer-reactive 3D micro-tilt using gsap.quickTo while sealed
          const quickRotX = envelopeBodyRef.current
            ? gsap.quickTo(envelopeBodyRef.current, 'rotationX', { duration: 0.42, ease: 'power3.out' })
            : null;
          const quickRotY = envelopeBodyRef.current
            ? gsap.quickTo(envelopeBodyRef.current, 'rotationY', { duration: 0.42, ease: 'power3.out' })
            : null;

          const mapPointerX = gsap.utils.pipe(
            gsap.utils.clamp(-0.5, 0.5),
            gsap.utils.mapRange(-0.5, 0.5, -7, 7)
          );
          const mapPointerY = gsap.utils.pipe(
            gsap.utils.clamp(-0.5, 0.5),
            gsap.utils.mapRange(-0.5, 0.5, 6, -6)
          );

          const handlePointerMove = (e: PointerEvent) => {
            if (hasTriggeredRef.current || !envelopeBodyRef.current || !quickRotX || !quickRotY) return;
            const rect = envelopeBodyRef.current.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            quickRotY(mapPointerX(nx));
            quickRotX(mapPointerY(ny));
          };

          if (isDesktop) {
            window.addEventListener('pointermove', handlePointerMove, { passive: true });
          }

          // Subtle weightless levitation while waiting
          const floatTween = gsap.to(envelopeBodyRef.current, {
            y: -7,
            rotation: 0.85,
            duration: 2.6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            paused: true,
          });

          const shadowFloatTween = gsap.to(shadowRef.current, {
            scaleX: 0.94,
            opacity: 0.55,
            duration: 2.6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            paused: true,
          });

          const emergedFloatTween = gsap.to(envelopeBodyRef.current, {
            y: -5,
            rotation: 0.65,
            duration: 2.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            paused: true,
          });

          const emergedShadowFloatTween = gsap.to(shadowRef.current, {
            scaleX: 0.95,
            opacity: 0.58,
            duration: 2.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            paused: true,
          });

          const handleEmergedFloatScroll = () => {
            if (!hasEmergedRef.current) return;
            if (window.scrollY > 6) {
              if (!emergedFloatTween.paused()) {
                emergedFloatTween.pause();
                emergedShadowFloatTween.pause();
                gsap.to(envelopeBodyRef.current, {
                  y: 0,
                  rotation: 0,
                  duration: 0.24,
                  ease: 'emilOut',
                  overwrite: 'auto',
                });
                gsap.to(shadowRef.current, { scaleX: 1, opacity: 0.72, duration: 0.24, ease: 'emilOut', overwrite: 'auto' });
              }
            } else if (emergedFloatTween.paused()) {
              emergedFloatTween.play();
              emergedShadowFloatTween.play();
            }
          };

          // Calm, intentional wax-seal prompt (one clean ripple + gentle breathing ring)
          const ringPromptTl = gsap.timeline({ paused: true });
          if (sealRingRef.current) {
            ringPromptTl.to(
              sealRingRef.current,
              {
                scale: 1.05,
                autoAlpha: 0.72,
                duration: 1.15,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
              },
              0
            );
          }
          if (pulseRing1Ref.current) {
            ringPromptTl.fromTo(
              pulseRing1Ref.current,
              { scale: 1.0, autoAlpha: 0.85 },
              {
                scale: 1.65,
                autoAlpha: 0,
                duration: 1.35,
                repeat: -1,
                repeatDelay: 1.5,
                ease: 'power2.out',
              },
              0.2
            );
          }

          const emergeCardY = isDesktop ? -58 : -50;
          const emergeCardScale = isDesktop ? 1.03 : 1.01;
          const shellEmergeY = gsap.utils.clamp(
            isDesktop ? 76 : 52,
            isDesktop ? 142 : 96,
            Math.round(window.innerHeight * (isDesktop ? 0.175 : 0.13))
          );

          let lastNudgeMs = 0;
          const triggerSealedScrollNudge = () => {
            if (hasTriggeredRef.current) return;
            const now = performance.now();
            if (now - lastNudgeMs < 480) return;
            lastNudgeMs = now;

            if (envelopeBodyRef.current) {
              gsap.fromTo(
                envelopeBodyRef.current,
                { y: 0 },
                { y: -6, duration: 0.13, yoyo: true, repeat: 1, ease: 'emilOut', overwrite: 'auto' }
              );
            }
            if (hintRef.current) {
              gsap.fromTo(
                hintRef.current,
                { scale: 1 },
                { scale: 1.045, duration: 0.14, yoyo: true, repeat: 1, ease: 'emilOut', overwrite: 'auto' }
              );
            }
          };

          // Lock scroll while sealed or mid-unseal so the page waits until card emerges
          const lockScrollWheel = Observer.create({
            target: window,
            type: 'wheel',
            tolerance: 8,
            preventDefault: true,
            onDown: triggerSealedScrollNudge,
            onUp: triggerSealedScrollNudge,
          });

          const lockScrollTouch = Observer.create({
            target: window,
            type: 'touch',
            tolerance: 10,
            preventDefault: false,
            onUp: triggerSealedScrollNudge,
          });

          const keepTopWhileSealed = () => {
            if (!hasEmergedRef.current && window.scrollY > 0) {
              window.scrollTo(0, 0);
            }
          };

          const lockKeyScroll = (e: KeyboardEvent) => {
            if (!hasEmergedRef.current && (e.key === 'ArrowDown' || e.key === 'PageDown')) {
              e.preventDefault();
              triggerSealedScrollNudge();
            }
          };

          window.addEventListener('scroll', keepTopWhileSealed, { passive: true });
          window.addEventListener('keydown', lockKeyScroll);

          const buildScrollCloseTimeline = (): gsap.core.Timeline => {
            const closeTl = gsap.timeline();

            closeTl
              .addLabel('closeEnvelope', 0)
              .fromTo(
                scrollPromptRef.current,
                { autoAlpha: 1, y: 0 },
                { autoAlpha: 0, y: 12, duration: 0.28, ease: 'power2.out', immediateRender: false },
                'closeEnvelope'
              )
              .fromTo(
                cardRef.current,
                {
                  yPercent: emergeCardY,
                  scale: emergeCardScale,
                  rotationX: 0,
                },
                {
                  yPercent: 0,
                  scale: 0.96,
                  rotationX: 3,
                  duration: 0.95,
                  ease: 'power1.inOut',
                  immediateRender: false,
                },
                'closeEnvelope'
              )
              .fromTo(
                cardRef.current,
                { xPercent: 0, rotation: 0 },
                {
                  xPercent: 2,
                  rotation: 1.6,
                  duration: 0.45,
                  ease: 'sine.inOut',
                  immediateRender: false,
                },
                'closeEnvelope'
              )
              .fromTo(
                cardRef.current,
                { xPercent: 2, rotation: 1.6 },
                {
                  xPercent: 0,
                  rotation: 0,
                  duration: 0.5,
                  ease: 'emilOut',
                  immediateRender: false,
                },
                'closeEnvelope+=0.45'
              )
              .fromTo(
                envelopeShellRef.current,
                { x: 0, y: shellEmergeY },
                {
                  motionPath: {
                    path: [
                      { x: 0, y: shellEmergeY },
                      { x: isDesktop ? -34 : -22, y: Math.round(shellEmergeY * 0.4) },
                      { x: 0, y: 0 },
                    ],
                    curviness: 1.35,
                    fromCurrent: false,
                  },
                  duration: 0.95,
                  ease: 'arcDepart',
                  immediateRender: false,
                },
                'closeEnvelope'
              )
              .fromTo(
                envelopeShellRef.current,
                { rotation: 0 },
                {
                  rotation: -2.5,
                  duration: 0.45,
                  ease: 'sine.inOut',
                  immediateRender: false,
                },
                'closeEnvelope'
              )
              .fromTo(
                envelopeShellRef.current,
                { rotation: -2.5 },
                {
                  rotation: 0,
                  duration: 0.5,
                  ease: 'emilOut',
                  immediateRender: false,
                },
                'closeEnvelope+=0.45'
              )
              .fromTo(
                flapRef.current,
                { rotationX: 176 },
                {
                  rotationX: 0,
                  duration: 0.85,
                  ease: 'power1.inOut',
                  immediateRender: false,
                },
                'closeEnvelope+=0.22'
              )
              // Swap flap back in front of card right at 90deg mid-fold (works both forwards & backwards on scrub)
              .set(flapRef.current, { zIndex: 30 }, 'closeEnvelope+=0.64')
              .fromTo(
                sealShapeRef.current,
                { morphSVG: SEAL_OPEN_STARBURST_PATH },
                {
                  morphSVG: {
                    shape: SEAL_CLOSED_PATH,
                    type: 'rotational',
                  },
                  duration: 0.24,
                  ease: 'power2.out',
                  immediateRender: false,
                },
                'closeEnvelope+=0.94'
              )
              .fromTo(
                sealBtnRef.current,
                { autoAlpha: 0, scale: 0.74, x: 64, y: -28, rotation: 26 },
                {
                  autoAlpha: 1,
                  scale: 1,
                  rotation: 0,
                  motionPath: {
                    path: [
                      { x: 64, y: -28 },
                      { x: 24, y: -52 },
                      { x: 0, y: 0 },
                    ],
                    curviness: 1.35,
                    fromCurrent: false,
                  },
                  duration: 0.24,
                  ease: 'emilOut',
                  immediateRender: false,
                },
                'closeEnvelope+=0.94'
              )
              .addLabel('exitLeft', 'closeEnvelope+=1.12')
              .fromTo(
                envelopeShellRef.current,
                { xPercent: 0, yPercent: 0, rotation: 0, rotationY: 0, rotationX: 0, scale: 1 },
                {
                  motionPath: {
                    path: [
                      { xPercent: 0, yPercent: 0 },
                      { xPercent: -52, yPercent: -18 },
                      { xPercent: -165, yPercent: 38 },
                    ],
                    curviness: 1.35,
                    fromCurrent: false,
                  },
                  rotation: -14,
                  rotationY: -15,
                  rotationX: 6,
                  scale: 0.9,
                  duration: 1.03,
                  ease: 'arcDepart',
                  immediateRender: false,
                },
                'exitLeft'
              )
              .fromTo(
                stageRef.current,
                { autoAlpha: 1 },
                {
                  autoAlpha: 0,
                  duration: 0.35,
                  ease: 'emilOut',
                  immediateRender: false,
                },
                'exitLeft+=0.68'
              );

            return closeTl;
          };

          // Master Unseal & Emerge Choreography (stops at emerged state; waits for scroll)
          const openTl = gsap.timeline({
            paused: true,
            defaults: { ease: 'luxurySilk' },
          });

          openTl
            .addLabel('unseal', 0)
            .to(
              envelopeShellRef.current,
              {
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                rotation: 0,
                x: 0,
                y: 0,
                duration: 0.28,
                ease: 'emilOut',
                overwrite: 'auto',
              },
              'unseal'
            )
            .to(
              foilLines,
              {
                drawSVG: '0% 100%',
                duration: 0.25,
                ease: 'power2.out',
                overwrite: 'auto',
              },
              'unseal'
            )
            .to(
              sheenRef.current,
              {
                autoAlpha: 0,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: 'auto',
              },
              'unseal'
            )
            .to(
              hintRef.current,
              { autoAlpha: 0, y: 8, duration: 0.22, ease: 'emilOut', overwrite: 'auto' },
              'unseal'
            )
            .to(
              [pulseRing1Ref.current, sealRingRef.current].filter(Boolean),
              {
                autoAlpha: 0,
                scale: '+=0.18',
                duration: 0.22,
                ease: 'emilOut',
                overwrite: 'auto',
              },
              'unseal'
            )
            .to(
              envelopeBodyRef.current,
              {
                rotationX: 0,
                rotationY: 0,
                rotation: 0,
                y: 0,
                duration: 0.36,
                ease: 'emilOut',
                overwrite: 'auto',
              },
              'unseal'
            )
            .to(
              shadowRef.current,
              {
                scaleX: 1,
                opacity: 0.72,
                duration: 0.3,
                ease: 'emilOut',
                overwrite: 'auto',
              },
              'unseal'
            )
            .to(
              sealShapeRef.current,
              {
                morphSVG: {
                  shape: sealOpenShapeRef.current || SEAL_OPEN_STARBURST_PATH,
                  type: 'rotational',
                },
                duration: 0.28,
                ease: 'waxSnap',
              },
              'unseal'
            )
            .to(
              sealBtnRef.current,
              {
                scale: 1.14,
                rotation: -8,
                motionPath: {
                  path: [
                    { x: 0, y: 0 },
                    { x: -8, y: -14 },
                  ],
                  curviness: 1.2,
                  fromCurrent: false,
                },
                duration: 0.2,
                ease: 'waxSnap',
              },
              'unseal'
            )
            .to(
              sealBtnRef.current,
              {
                scale: 0.74,
                autoAlpha: 0,
                rotation: 26,
                motionPath: {
                  path: [
                    { x: -8, y: -14 },
                    { x: 24, y: -52 },
                    { x: 64, y: -28 },
                  ],
                  curviness: 1.35,
                  fromCurrent: false,
                },
                duration: 0.28,
                ease: 'emilOut',
              },
              'unseal+=0.2'
            )
            .addLabel('unfold', 'unseal+=0.22')
            .to(
              flapRef.current,
              {
                rotationX: 176,
                duration: 0.66,
                ease: 'flapHinge',
              },
              'unfold'
            )
            .set(flapRef.current, { zIndex: 2 }, 'unfold+=0.31')
            .addLabel('emerge', 'unfold+=0.34')
            .to(
              cardRef.current,
              {
                yPercent: emergeCardY,
                scale: emergeCardScale,
                rotationX: 0,
                duration: 0.84,
                ease: 'luxurySilk',
              },
              'emerge'
            )
            .to(
              cardRef.current,
              {
                xPercent: -2.2,
                rotation: -1.8,
                duration: 0.36,
                ease: 'sine.inOut',
              },
              'emerge'
            )
            .to(
              cardRef.current,
              {
                xPercent: 0,
                rotation: 0,
                duration: 0.48,
                ease: 'emilOut',
              },
              'emerge+=0.36'
            )
            .to(
              envelopeShellRef.current,
              {
                y: shellEmergeY,
                duration: 0.84,
                ease: 'luxurySilk',
              },
              'emerge'
            )
            .to(
              envelopeShellRef.current,
              {
                x: 16,
                rotation: 2,
                duration: 0.36,
                ease: 'sine.inOut',
              },
              'emerge'
            )
            .to(
              envelopeShellRef.current,
              {
                x: 0,
                rotation: 0,
                duration: 0.48,
                ease: 'emilOut',
              },
              'emerge+=0.36'
            );

          if (splitSubtitle && splitSubtitle.words.length > 0) {
            openTl.to(
              splitSubtitle.words,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.46,
                stagger: { amount: 0.18, from: 'start', ease: 'power1.out' },
                ease: 'editorialGlide',
              },
              'emerge+=0.20'
            );
          }

          const moteDuration = gsap.utils.distribute({
            base: 0.56,
            amount: 0.16,
            from: 'center',
          });

          motes.forEach((mote, idx) => {
            const pathEl = motePaths[idx];
            if (!pathEl) return;
            const offset = (idx * 0.025).toFixed(3);
            openTl.to(
              mote,
              {
                motionPath: {
                  path: pathEl,
                  align: pathEl,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false,
                },
                scale: gsap.utils.random(0.85, 1.25),
                rotation: idx % 2 === 0 ? 55 : -55,
                duration: moteDuration(idx, mote, motes),
                ease: 'power1.out',
              },
              `emerge+=${(0.16 + Number(offset)).toFixed(3)}`
            );
            openTl.to(
              mote,
              { autoAlpha: 0.92, duration: 0.18, ease: 'power1.out' },
              `emerge+=${(0.16 + Number(offset)).toFixed(3)}`
            );
            openTl.to(
              mote,
              { autoAlpha: 0, duration: 0.24, ease: 'emilOut' },
              `emerge+=${(0.54 + Number(offset)).toFixed(3)}`
            );
          });

          const markEmerged = () => {
            if (hasEmergedRef.current) return;
            hasEmergedRef.current = true;
            setIsEmerged(true);

            lockScrollWheel.kill();
            lockScrollTouch.kill();
            window.removeEventListener('scroll', keepTopWhileSealed);
            window.removeEventListener('keydown', lockKeyScroll);

            window.addEventListener('scroll', handleEmergedFloatScroll, { passive: true });

            const closeTl = buildScrollCloseTimeline();
            onEmergedRef.current(closeTl);
          };

          if (scrollPromptRef.current) {
            openTl.to(
              scrollPromptRef.current,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.32,
                ease: 'emilOut',
              },
              'emerge+=0.52'
            );
          }

          openTl.eventCallback('onComplete', () => {
            markEmerged();
            emergedFloatTween.play();
            emergedShadowFloatTween.play();
          });

          // Arrival + sealed shimmer + white click-indicator ring draw
          const arriveTl = gsap.timeline();
          arriveTl
            .addLabel('arrive', 0)
            .to(
              envelopeShellRef.current,
              {
                motionPath: {
                  path: [
                    { x: arriveX, y: arriveY },
                    { x: Math.round(arriveX * 0.28), y: isDesktop ? -22 : -14 },
                    { x: 0, y: 0 },
                  ],
                  curviness: 1.35,
                  fromCurrent: false,
                },
                rotationX: 0,
                rotationY: 0,
                rotation: 0,
                scale: 1,
                duration: 0.85,
                ease: 'arcArrive',
              },
              'arrive'
            )
            .to(
              foilLines,
              {
                drawSVG: '0% 100%',
                duration: 0.64,
                stagger: { amount: 0.16, ease: 'power1.out' },
                ease: 'power2.inOut',
              },
              'arrive+=0.18'
            )
            .to(
              sheenRef.current,
              {
                xPercent: 135,
                duration: 0.85,
                ease: 'power2.inOut',
              },
              'arrive+=0.26'
            )
            .to(
              hintRef.current,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.42,
                ease: 'emilOut',
              },
              'arrive+=0.42'
            )
            .call(() => {
              floatTween.play();
              shadowFloatTween.play();
            }, undefined, 'arrive+=0.55');

          if (sealRingRef.current) {
            arriveTl
              .to(
                sealRingRef.current,
                {
                  drawSVG: '0% 100%',
                  duration: 0.58,
                  ease: 'power2.out',
                },
                'arrive+=0.32'
              )
              .call(() => {
                if (!hasTriggeredRef.current) {
                  ringPromptTl.play(0);
                }
              });
          } else {
            arriveTl.call(() => {
              if (!hasTriggeredRef.current) {
                ringPromptTl.play(0);
              }
            });
          }

          const runUnseal = () => {
            if (hasTriggeredRef.current) return;
            hasTriggeredRef.current = true;
            setIsUnsealing(true);

            arriveTl.kill();
            ringPromptTl.kill();
            floatTween.kill();
            shadowFloatTween.kill();
            window.removeEventListener('pointermove', handlePointerMove);

            onOpeningStartRef.current();
            openTl.play(0);
          };

          triggerOpenRef.current = runUnseal;

          return () => {
            lockScrollWheel.kill();
            lockScrollTouch.kill();
            arriveTl.kill();
            ringPromptTl.kill();
            openTl.kill();
            floatTween.kill();
            shadowFloatTween.kill();
            emergedFloatTween.kill();
            emergedShadowFloatTween.kill();
            splitSubtitle?.revert();
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('scroll', keepTopWhileSealed);
            window.removeEventListener('scroll', handleEmergedFloatScroll);
            window.removeEventListener('keydown', lockKeyScroll);
          };
        },
        stageRef
      );

      return () => mm.revert();
    },
    {
      scope: stageRef,
      dependencies: [edition.slug, replayNonce, disabled],
      revertOnUpdate: true,
    }
  );

  const handleOpenClick = contextSafe(() => {
    triggerOpenRef.current();
  });

  if (disabled) return null;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={`${edition.editionBadge} golden envelope`}
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center px-4 py-6 bg-[#FAF8F3]/10 overflow-hidden select-none ${
        isEmerged ? 'touch-pan-y pointer-events-none' : 'touch-none pointer-events-auto'
      }`}
    >
      {/* MotionPath Golden Light Motes Overlay */}
      <svg
        viewBox="0 0 680 540"
        fill="none"
        className="pointer-events-none absolute inset-0 m-auto w-[min(98vw,680px)] h-auto z-50 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${uid}-moteGrad`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF2" />
            <stop offset="45%" stopColor="#F6D57A" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#D69F34" stopOpacity="0" />
          </radialGradient>
        </defs>

        {MOTE_PATHS.map((d, idx) => (
          <path key={d} data-mote-path d={d} stroke="none" fill="none" data-idx={idx} />
        ))}

        {MOTE_PATHS.map((_, idx) => (
          <g key={`mote-${idx}`} data-gold-mote>
            <circle cx="0" cy="0" r="11" fill={`url(#${uid}-moteGrad)`} />
            <path
              d="M0,-8 Q1.2,-1.2 8,0 Q1.2,1.2 0,8 Q-1.2,1.2 -8,0 Q-1.2,-1.2 0,-8 Z"
              fill="#E4B343"
              stroke="#FFF8DC"
              strokeWidth="0.6"
            />
          </g>
        ))}
      </svg>

      {/* 3D Envelope Perspective Stage */}
      <div
        ref={envelopeShellRef}
        className="relative w-[min(90vw,520px)] flex flex-col items-center will-change-transform"
        style={{ perspective: '1600px' }}
      >
        <div
          ref={envelopeBodyRef}
          onClick={handleOpenClick}
          className={`relative w-full aspect-[1.42/1] pointer-events-auto will-change-transform ${
            isEmerged ? 'touch-pan-y' : 'touch-none'
          } ${isUnsealing ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {/* Layer 1: Inner Champagne-Gold Envelope Back & Guilloché Liner */}
          <div
            ref={envelopeBackRef}
            className="absolute inset-0 z-[1] rounded-2xl overflow-hidden shadow-[0_32px_70px_-18px_rgba(122,88,18,0.34)] border border-[#B8923E]/45 will-change-transform"
          >
            <svg viewBox="0 0 520 366" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id={`${uid}-linerGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF8E6" />
                  <stop offset="50%" stopColor="#F2DFAA" />
                  <stop offset="100%" stopColor="#DFBC67" />
                </linearGradient>
              </defs>
              <rect width="520" height="366" fill={`url(#${uid}-linerGrad)`} />
              <rect
                data-foil-draw
                x="16"
                y="16"
                width="488"
                height="334"
                rx="12"
                fill="none"
                stroke="#9E731D"
                strokeOpacity="0.45"
                strokeWidth="1.2"
              />
              <rect
                data-foil-draw
                x="24"
                y="24"
                width="472"
                height="318"
                rx="8"
                fill="none"
                stroke="#C59839"
                strokeOpacity="0.35"
                strokeWidth="0.9"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Layer 2: Emerging Royal Porcelain & Gold Invitation Card Insert */}
          <div
            ref={cardRef}
            className="absolute inset-x-3.5 sm:inset-x-5 top-3 bottom-3 z-[10] rounded-xl bg-[#FFFCF5] border border-[#C2983E]/60 shadow-[0_20px_48px_-14px_rgba(122,88,18,0.28),inset_0_1px_0_rgba(255,255,255,1)] p-4 sm:p-7 flex flex-col justify-between overflow-hidden will-change-transform"
          >
            <div
              className="absolute inset-2 rounded-lg border border-[#B8923E]/30 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-2xl opacity-25 pointer-events-none"
              style={{ backgroundColor: edition.theme.accentHex }}
              aria-hidden="true"
            />

            <div className="relative flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <SocietyCrest accentColor={edition.theme.accentHex} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
                <div>
                  <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C6414]">
                    {edition.heading1} · 2026
                  </p>
                  <p className="text-[11px] sm:text-xs font-semibold text-[#6E4E0F]">
                    {edition.passCategoryLabel}
                  </p>
                </div>
              </div>

              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] px-2.5 py-0.5 rounded-full bg-[#FAF2DB] border border-[#B8923E]/35 text-[#8C6414]">
                Main College Hall
              </span>
            </div>

            <div className="relative text-center space-y-1.5 sm:space-y-2 my-auto py-1">
              <h2 className="gold-foil-text text-xl sm:text-3xl font-bold tracking-tight uppercase leading-none">
                {edition.heading2}
              </h2>
              <p
                ref={cardSubtitleRef}
                className="font-serif italic text-lg sm:text-2xl text-[#7A5812] leading-tight"
              >
                {edition.content1}
              </p>
              <div className="pt-1">
                <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-[#8C6414]">
                  {edition.invitationLead}
                </p>
                <p className="text-sm sm:text-base font-semibold text-[#5A400D] mt-0.5 truncate px-2">
                  {resolvedGuest}
                  {batchLabel ? ` · ${batchLabel}` : ''}
                </p>
              </div>
            </div>

            <div className="relative pt-2 border-t border-[#B8923E]/25 flex items-center justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#8C6414]">
              <span className="truncate">{edition.content3}</span>
              <span className="shrink-0 ml-2">GANK(S) DC Haripur</span>
            </div>
          </div>

          {/* Layer 3: Front Metallic 24k Gold Pocket */}
          <div
            ref={pocketRef}
            className="absolute inset-0 z-[20] rounded-2xl overflow-hidden pointer-events-none will-change-transform"
          >
            <svg viewBox="0 0 520 366" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id={`${uid}-goldLeft`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5E1A4" />
                  <stop offset="55%" stopColor="#DFB65D" />
                  <stop offset="100%" stopColor="#BE8E2E" />
                </linearGradient>
                <linearGradient id={`${uid}-goldRight`} x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F7E5AE" />
                  <stop offset="55%" stopColor="#D8AC4E" />
                  <stop offset="100%" stopColor="#B88729" />
                </linearGradient>
                <linearGradient id={`${uid}-goldBottom`} x1="15%" y1="0%" x2="85%" y2="100%">
                  <stop offset="0%" stopColor="#FAEDC2" />
                  <stop offset="38%" stopColor="#E4BE67" />
                  <stop offset="76%" stopColor="#CA9A38" />
                  <stop offset="100%" stopColor="#DFB75B" />
                </linearGradient>
              </defs>

              <polygon points="0,0 264,196 0,366" fill={`url(#${uid}-goldLeft)`} />
              <polygon points="520,0 256,196 520,366" fill={`url(#${uid}-goldRight)`} />

              <path
                d="M0,366 L235,176 Q260,156 285,176 L520,366"
                fill="rgba(102, 68, 12, 0.2)"
                transform="translate(0, -3)"
              />

              <path
                d="M0,366 L236,178 Q260,159 284,178 L520,366 Z"
                fill={`url(#${uid}-goldBottom)`}
              />

              <path
                data-foil-draw
                d="M14,358 L238,184 Q260,167 282,184 L506,358"
                fill="none"
                stroke="#FFF5D4"
                strokeOpacity="0.72"
                strokeWidth="1.4"
              />
              <path
                data-foil-draw
                d="M2,365 L236,178 Q260,159 284,178 L518,365"
                fill="none"
                stroke="#9C6E19"
                strokeOpacity="0.45"
                strokeWidth="1.2"
              />
            </svg>

            <div className="absolute inset-x-0 bottom-2.5 sm:bottom-5 flex justify-center px-4 sm:px-6">
              <div className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-[#FFFDF7]/90 backdrop-blur-md border border-[#9E731D]/35 shadow-[0_8px_22px_rgba(107,77,14,0.16)] text-center max-w-[84%]">
                <p className="text-[8.5px] sm:text-[10px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#8C6414] truncate">
                  {edition.editionBadge}
                </p>
                <p className="text-[11px] sm:text-sm font-semibold text-[#5A400D] truncate mt-0.5">
                  {resolvedGuest}
                </p>
              </div>
            </div>

            <div
              ref={sheenRef}
              className="absolute inset-y-0 -inset-x-10 pointer-events-none will-change-transform"
              style={{
                background:
                  'linear-gradient(112deg, transparent 28%, rgba(255,252,236,0.52) 48%, rgba(255,255,255,0.68) 50%, rgba(255,252,236,0.45) 52%, transparent 72%)',
              }}
              aria-hidden="true"
            />
          </div>

          {/* Layer 4: 3D Hinged Top Flap */}
          <div
            ref={flapRef}
            className="absolute top-0 left-0 right-0 h-[60%] z-[30] pointer-events-none will-change-transform"
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'top center',
            }}
          >
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <svg viewBox="0 0 520 220" className="w-full h-full drop-shadow-[0_12px_18px_rgba(104,70,12,0.22)]" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id={`${uid}-flapOuter`} x1="10%" y1="0%" x2="90%" y2="100%">
                    <stop offset="0%" stopColor="#FAF0CB" />
                    <stop offset="46%" stopColor="#E6C169" />
                    <stop offset="100%" stopColor="#C49331" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,14 Q0,0 14,0 L506,0 Q520,0 520,14 L284,198 Q260,217 236,198 Z"
                  fill={`url(#${uid}-flapOuter)`}
                  stroke="#A8781E"
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                />
                <path
                  data-foil-draw
                  d="M16,12 L504,12 L281,187 Q260,204 239,187 Z"
                  fill="none"
                  stroke="#FFF7DB"
                  strokeOpacity="0.72"
                  strokeWidth="1.4"
                />
              </svg>
            </div>

            <div
              className="absolute inset-0"
              style={{
                transform: 'rotateX(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <svg viewBox="0 0 520 220" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id={`${uid}-flapInner`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFDF5" />
                    <stop offset="55%" stopColor="#F5E4B7" />
                    <stop offset="100%" stopColor="#E1BF6D" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,14 Q0,0 14,0 L506,0 Q520,0 520,14 L284,198 Q260,217 236,198 Z"
                  fill={`url(#${uid}-flapInner)`}
                  stroke="#B8923E"
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                />
                <path
                  d="M20,16 L500,16 L278,184 Q260,198 242,184 Z"
                  fill="none"
                  stroke="#B8923E"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              </svg>
            </div>
          </div>

          {/* Layer 5: Centered Wrapper around Wax Seal so GSAP scale/y never fights CSS centering */}
          <div className="absolute left-1/2 top-[53%] sm:top-[55%] -translate-x-1/2 -translate-y-1/2 z-[40]">
            <button
              ref={sealBtnRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenClick();
              }}
              disabled={isUnsealing}
              aria-label="Click or press to open golden invitation envelope"
              className={`group w-16 h-16 sm:w-22 sm:h-22 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 will-change-transform ${
                isUnsealing ? 'pointer-events-none cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className="seal-press-target block w-full h-full">
                <svg viewBox="0 0 96 96" className="w-full h-full overflow-visible drop-shadow-[0_10px_20px_rgba(92,62,10,0.34)]" aria-hidden="true">
                  <defs>
                    <radialGradient id={`${uid}-waxGrad`} cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FFF2BF" />
                      <stop offset="38%" stopColor="#E2B54D" />
                      <stop offset="78%" stopColor="#B88322" />
                      <stop offset="100%" stopColor="#855A0E" />
                    </radialGradient>
                    <radialGradient id={`${uid}-waxRim`} cx="50%" cy="50%" r="50%">
                      <stop offset="65%" stopColor="#9A6B17" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#FFF2C4" stopOpacity="0.7" />
                    </radialGradient>
                  </defs>

                  <circle
                    ref={pulseRing1Ref}
                    cx="48"
                    cy="47"
                    r="45"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.9"
                    strokeWidth="2.2"
                  />

                  <path ref={sealOpenShapeRef} d={SEAL_OPEN_STARBURST_PATH} fill="none" opacity="0" />

                  <path
                    ref={sealShapeRef}
                    d={SEAL_CLOSED_PATH}
                    fill={`url(#${uid}-waxGrad)`}
                    stroke="#FFF3C6"
                    strokeOpacity="0.65"
                    strokeWidth="1.2"
                  />

                  <circle cx="48" cy="47" r="24" fill={`url(#${uid}-waxRim)`} stroke="#FFF0BA" strokeOpacity="0.6" strokeWidth="1" />

                  <path
                    d="M39 42L33 47L39 52M57 42L63 47L57 52M50 37L46 57"
                    stroke="#5F3F08"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  <circle
                    ref={sealRingRef}
                    cx="48"
                    cy="47"
                    r="45"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.92"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    transform="rotate(-90 48 47)"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Soft Floor Elevation Shadow */}
        <div
          ref={shadowRef}
          className="mt-5 w-[76%] h-6 rounded-full bg-[#7A5812]/22 blur-xl pointer-events-none will-change-transform"
          aria-hidden="true"
        />

        {/* Invitation Seal Hint */}
        <div ref={hintRef} className="mt-4 flex flex-col items-center gap-1.5 text-center pointer-events-auto">
          <button
            type="button"
            onClick={handleOpenClick}
            className="btn-tactile inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/88 hover:bg-white border border-[#B8923E]/40 shadow-[0_8px_22px_rgba(140,104,25,0.14)] text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A5812] hover:text-[#573E0B] cursor-pointer"
          >
            <span>Click or Press Envelope to Open</span>
          </button>
        </div>
      </div>

      {/* Scroll-Down Cue (appears after card emerges; stays visible until user scrolls down) */}
      <div
        ref={scrollPromptRef}
        className={`absolute bottom-5 sm:bottom-7 inset-x-0 z-50 flex justify-center px-4 ${
          isEmerged ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!isEmerged}
      >
        <button
          type="button"
          tabIndex={isEmerged ? 0 : -1}
          onClick={(e) => {
            e.stopPropagation();
            onRequestScrollDown();
          }}
          className="btn-tactile inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/92 hover:bg-white backdrop-blur-md border border-[#B8923E]/45 shadow-[0_10px_28px_rgba(122,88,18,0.18)] text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A5812] hover:text-[#4F3708] cursor-pointer"
        >
          <span>Scroll Down to Continue</span>
          <ArrowDown
            size={14}
            className="animate-scroll-cue"
            style={{ color: edition.theme.accentHex }}
          />
        </button>
      </div>
    </div>
  );
}
