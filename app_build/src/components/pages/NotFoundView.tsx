import { EVENT_METADATA, INVITATION_EDITIONS } from '../../data/invitations';
import { AmbientBackdrop } from '../layout/AmbientBackdrop';
import { SocietyCrest } from '../ui/SocietyCrest';

/**
 * Light-themed discreet fallback view that intentionally withholds private guest route links.
 */
export function NotFoundView() {
  const defaultTheme = INVITATION_EDITIONS.overview.theme;

  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center px-4 py-16 overflow-x-hidden">
      <AmbientBackdrop theme={defaultTheme} />
      <div className="relative z-10 max-w-lg w-full rounded-3xl p-8 sm:p-10 bg-white/85 backdrop-blur-xl border border-[#B8923E]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_32px_64px_-20px_rgba(140,104,25,0.16)] text-center space-y-6">
        <div className="flex justify-center">
          <SocietyCrest accentColor={defaultTheme.accentHex} className="w-16 h-16" />
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#8C6414]">
            {EVENT_METADATA.heading1} · {EVENT_METADATA.heading2}
          </p>
          <h1 className="gold-foil-text text-3xl sm:text-4xl font-bold tracking-tight">
            Private Invitation Link Required
          </h1>
          <p className="text-sm sm:text-base text-[#5E481A] leading-relaxed">
            This digital invitation is shared via private guest-specific links. Please open the
            exact link issued to you by the {EVENT_METADATA.heading2}, {EVENT_METADATA.content3}.
          </p>
        </div>

        <p className="pt-2 border-t border-[#B8923E]/25 text-xs font-mono uppercase tracking-[0.16em] text-[#8C6414]">
          {EVENT_METADATA.content4}
        </p>
      </div>
    </main>
  );
}
