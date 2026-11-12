import type { EditionTheme } from '../../types/invitation';
import { LiquidGoldCanvas } from './LiquidGoldCanvas';

interface AmbientBackdropProps {
  theme: EditionTheme;
  surgeNonce?: number;
}

/**
 * Light-themed Antigravity spatial backdrop layering a real-time 3D molten liquid gold
 * WebGL surface beneath delicate atmospheric washes, isometric lines, and paper grain.
 */
export function AmbientBackdrop({ theme, surgeNonce = 0 }: AmbientBackdropProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <LiquidGoldCanvas surgeNonce={surgeNonce} />

      <div
        className="absolute -top-44 left-1/2 -translate-x-1/2 w-[960px] h-[560px] rounded-full blur-3xl opacity-35"
        style={{
          background: `radial-gradient(circle at center, ${theme.atmosphericGlowRgba} 0%, rgba(250,248,243,0) 70%)`,
        }}
      />

      {/* Subtle spatial isometric grid plane in deep Z-perspective */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.075]">
        <div
          className="w-[160vmax] h-[160vmax]"
          style={{
            transform: 'perspective(900px) rotateX(62deg) rotateZ(-45deg) translateZ(-120px)',
            backgroundImage:
              'linear-gradient(to right, rgba(138,100,20,0.48) 1px, transparent 1px), linear-gradient(to bottom, rgba(138,100,20,0.48) 1px, transparent 1px)',
            backgroundSize: '84px 84px',
            maskImage: 'radial-gradient(circle at center, black 22%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 22%, transparent 70%)',
          }}
        />
      </div>

      <div className="grain-overlay absolute inset-0" />
    </div>
  );
}
