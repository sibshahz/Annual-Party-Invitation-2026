/**
 * Domain types for the menu-less Computing Society Annual Function 2026 animated invitation routes.
 */

export type EditionSlug = 'overview' | 'chief-guest' | 'farewell' | 'welcome';

export interface EditionTheme {
  accentHex: string;
  accentSoftRgba: string;
  accentBorderRgba: string;
  atmosphericGlowRgba: string;
}

export interface InvitationEdition {
  slug: EditionSlug;
  routePath: string;
  pageTitleLabel: string;
  editionBadge: string;
  defaultGuestTitle: string;
  /** Mapped from .gemini/base.md Heading 1 */
  heading1: string;
  /** Mapped from .gemini/base.md Heading 2 */
  heading2: string;
  /** Mapped from .gemini/base.md Content 1 */
  content1: string;
  /** Mapped from .gemini/base.md Content 2 (route-specific invitation salutation & headline) */
  content2: string;
  /** Mapped from .gemini/base.md Content 3 */
  content3: string;
  /** Mapped from .gemini/base.md Content 4 */
  content4: string;
  cardSummary: string;
  invitationLead: string;
  invitationMessage: string;
  ceremonialClosing: string;
  passCategoryLabel: string;
  theme: EditionTheme;
}
