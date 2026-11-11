import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;

/**
 * Registers all GSAP plugins and bespoke luxury easing curves once for the client bundle.
 */
export function ensureGsapPlugins(): void {
  if (registered || typeof window === 'undefined') return;

  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    ScrollToPlugin,
    CustomEase,
    DrawSVGPlugin,
    MorphSVGPlugin,
    MotionPathPlugin,
    SplitText,
    Observer,
    Flip
  );

  CustomEase.create('luxurySilk', 'M0,0 C0.16,1 0.3,1 1,1');
  CustomEase.create('flapHinge', 'M0,0 C0.3,0.02 0.16,1 1,1');
  CustomEase.create('waxSnap', 'M0,0 C0.22,0.68 0.34,1.16 1,1');

  registered = true;
}

ensureGsapPlugins();

export {
  gsap,
  useGSAP,
  CustomEase,
  DrawSVGPlugin,
  Flip,
  MorphSVGPlugin,
  MotionPathPlugin,
  Observer,
  ScrollToPlugin,
  ScrollTrigger,
  SplitText,
};

