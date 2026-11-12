import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../utils/gsapConfig';

interface ScrollProgressProps {
  accentColor: string;
  routeSlug: string;
}

/**
 * GPU-composited top scroll-progress hairline driven by GSAP ScrollTrigger.
 */
export function ScrollProgress({ accentColor, routeSlug }: ScrollProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!barRef.current) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' });
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.12,
          refreshPriority: -5,
        },
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' });
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          refreshPriority: -5,
        },
      });
    });

    return () => mm.revert();
  }, [routeSlug]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-slate-900/5 pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full will-change-transform"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, #D9B96B 55%, ${accentColor} 100%)`,
        }}
      />
    </div>
  );
}
