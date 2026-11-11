import type { EditionSlug, InvitationEdition } from '../types/invitation';

/**
 * Canonical institutional and event metadata from .gemini/base.md.
 */
export const EVENT_METADATA = {
  heading1: '14 NOV',
  heading2: 'COMPUTING SOCIETY',
  content1: 'Grand Annual Function 2026',
  content3: 'Department of Computer Science',
  content4: 'Government Akhtar Nawaz Khan (S) Degree College, KTS, Haripur',
  venue: 'Main College Hall',
  fullDateLabel: '14th November, 2026',
  weekdayLabel: 'Saturday, 14 November 2026',
} as const;

export const INVITATION_EDITIONS: Record<EditionSlug, InvitationEdition> = {
  overview: {
    slug: 'overview',
    routePath: '/',
    pageTitleLabel: 'Official Invitation',
    editionBadge: 'Official Invitation',
    defaultGuestTitle: 'Honoured Guests & Scholars',
    heading1: EVENT_METADATA.heading1,
    heading2: EVENT_METADATA.heading2,
    content1: EVENT_METADATA.content1,
    content2: 'Cordial Invitation to Celebrate Innovation, Fellowship & Academic Distinction',
    content3: EVENT_METADATA.content3,
    content4: EVENT_METADATA.content4,
    cardSummary:
      'Celebrating a defining year of engineering spirit, scholarly fellowship, and departmental pride in the Main College Hall.',
    invitationLead: 'You Are Cordially Invited',
    invitationMessage:
      'With sincere warmth and pride, the Computing Society invites you to join faculty, dignitaries, and scholars in the Main College Hall on the fourteenth of November, 2026, for our Grand Annual Function.',
    ceremonialClosing: 'Executive Cabinet · Computing Society 2026',
    passCategoryLabel: 'OFFICIAL INVITATION',
    theme: {
      accentHex: '#9A7322',
      accentSoftRgba: 'rgba(207, 169, 86, 0.16)',
      accentBorderRgba: 'rgba(184, 146, 62, 0.34)',
      atmosphericGlowRgba: 'rgba(218, 184, 108, 0.28)',
    },
  },

  'chief-guest': {
    slug: 'chief-guest',
    routePath: '/chief-guest',
    pageTitleLabel: 'Chief Guest Invitation',
    editionBadge: 'Chief Guest Edition',
    defaultGuestTitle: 'Respected Chief Guest',
    heading1: EVENT_METADATA.heading1,
    heading2: EVENT_METADATA.heading2,
    content1: EVENT_METADATA.content1,
    content2: 'Special Honour Invitation to Grace the Occasion as Chief Guest',
    content3: EVENT_METADATA.content3,
    content4: EVENT_METADATA.content4,
    cardSummary:
      'Your esteemed presence as Chief Guest honours our faculty and inspires the next generation of Computer Science scholars.',
    invitationLead: 'Honoured Request for Your Gracious Presence',
    invitationMessage:
      'On behalf of the Principal, faculty, and students of the Department of Computer Science, it is our distinct privilege to invite your Excellency as Chief Guest at the Grand Annual Function 2026 on 14th November in the Main College Hall.',
    ceremonialClosing: 'Department Chair & Computing Society Cabinet',
    passCategoryLabel: 'CHIEF GUEST OF HONOUR',
    theme: {
      accentHex: '#946D1E',
      accentSoftRgba: 'rgba(207, 169, 86, 0.18)',
      accentBorderRgba: 'rgba(184, 146, 62, 0.38)',
      atmosphericGlowRgba: 'rgba(222, 190, 114, 0.30)',
    },
  },

  farewell: {
    slug: 'farewell',
    routePath: '/farewell',
    pageTitleLabel: 'Farewell Invitation',
    editionBadge: 'Farewell to Pass-Out Students',
    defaultGuestTitle: 'Graduating Scholars',
    heading1: EVENT_METADATA.heading1,
    heading2: EVENT_METADATA.heading2,
    content1: EVENT_METADATA.content1,
    content2: 'Honouring & Bidding a Fond Farewell to Our Pass-Out Students',
    content3: EVENT_METADATA.content3,
    content4: EVENT_METADATA.content4,
    cardSummary:
      'Celebrating your years of late-night code, friendship, and the enduring legacy you leave behind in KTS, Haripur.',
    invitationLead: 'A Tribute to Our Graduating Batch',
    invitationMessage:
      'As you step forward into your next horizon, the Computing Society gathers in the Main College Hall on 14th November, 2026 to celebrate your achievements, honour your memories, and bid a memorable farewell to our pass-out scholars.',
    ceremonialClosing: 'Junior Batches & Computing Society, GANK(S) DC Haripur',
    passCategoryLabel: 'PASS-OUT FAREWELL EDITION',
    theme: {
      accentHex: '#9A7322',
      accentSoftRgba: 'rgba(212, 174, 94, 0.17)',
      accentBorderRgba: 'rgba(184, 146, 62, 0.35)',
      atmosphericGlowRgba: 'rgba(218, 184, 108, 0.27)',
    },
  },

  welcome: {
    slug: 'welcome',
    routePath: '/welcome',
    pageTitleLabel: 'Welcome Invitation',
    editionBadge: 'Welcome Students Edition',
    defaultGuestTitle: 'Incoming Computing Scholars',
    heading1: EVENT_METADATA.heading1,
    heading2: EVENT_METADATA.heading2,
    content1: EVENT_METADATA.content1,
    content2: 'Warmly Welcoming Our Incoming Students to Computer Science',
    content3: EVENT_METADATA.content3,
    content4: EVENT_METADATA.content4,
    cardSummary:
      'Step into a vibrant community of builders, algorithmic thinkers, and mentors ready to launch your journey in Haripur.',
    invitationLead: 'Welcome to the Department of Computer Science',
    invitationMessage:
      'With immense enthusiasm, the Computing Society welcomes our incoming batch to Government Akhtar Nawaz Khan (S) Degree College, KTS, Haripur. Join us in the Main College Hall on 14th November, 2026 as we celebrate your new beginning.',
    ceremonialClosing: 'Computing Society Reception & Mentorship Wing',
    passCategoryLabel: 'WELCOME SCHOLARS EDITION',
    theme: {
      accentHex: '#9A7322',
      accentSoftRgba: 'rgba(207, 169, 86, 0.16)',
      accentBorderRgba: 'rgba(184, 146, 62, 0.34)',
      atmosphericGlowRgba: 'rgba(218, 184, 108, 0.26)',
    },
  },
};
