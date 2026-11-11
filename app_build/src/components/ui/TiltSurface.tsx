import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from '../../utils/gsapConfig';

interface TiltSurfaceProps {
  children: ReactNode;
  className?: string;
  maxTiltDeg?: number;
}

/**
 * Spatial 3D tilt container powered by GSAP quickTo() and gsap.matchMedia(),
 * enabled only on fine-pointer devices when reduced motion is not requested.
 */
export function TiltSurface({
  children,
  className = '',
  maxTiltDeg = 6,
}: TiltSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canTiltRef = useRef(false);
  const quickTiltXRef = useRef<((value: number) => gsap.core.Tween) | null>(null);
  const quickTiltYRef = useRef<((value: number) => gsap.core.Tween) | null>(null);

  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      canTiltRef.current = true;
      gsap.set(el, { transformPerspective: 1000, rotationX: 0, rotationY: 0, z: 0 });

      quickTiltXRef.current = gsap.quickTo(el, 'rotationX', {
        duration: 0.42,
        ease: 'power3.out',
      });
      quickTiltYRef.current = gsap.quickTo(el, 'rotationY', {
        duration: 0.42,
        ease: 'power3.out',
      });

      return () => {
        canTiltRef.current = false;
        quickTiltXRef.current = null;
        quickTiltYRef.current = null;
      };
    });

    return () => mm.revert();
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canTiltRef.current || !surfaceRef.current) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const normX = gsap.utils.clamp(-0.5, 0.5, (event.clientX - rect.left) / rect.width - 0.5);
    const normY = gsap.utils.clamp(-0.5, 0.5, (event.clientY - rect.top) / rect.height - 0.5);

    quickTiltYRef.current?.(normX * (maxTiltDeg * 2));
    quickTiltXRef.current?.(-normY * (maxTiltDeg * 2));
  };

  const handlePointerLeave = () => {
    if (!canTiltRef.current) return;
    quickTiltXRef.current?.(0);
    quickTiltYRef.current?.(0);
  };

  return (
    <div
      ref={surfaceRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
