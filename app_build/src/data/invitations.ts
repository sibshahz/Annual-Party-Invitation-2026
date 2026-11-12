import type { EditionSlug, InvitationEdition } from "../types/invitation";

/**
 * Canonical institutional and event metadata from .gemini/base.md.
 */
export const EVENT_METADATA = {
  heading1: "14 NOV",
  heading2: "COMPUTING SOCIETY",
  content1: "Grand Annual Function 2026",
  content3: "Department of Computer Science",
  content4: "Government Akhtar Nawaz Khan (S) Degree College, KTS, Haripur",
  venue: "Main College Hall",
  fullDateLabel: "14th November, 2026",
  weekdayLabel: "Saturday, 14 November 2026",
} as const;

export const INVITATION_EDITIONS: Record<EditionSlug, InvitationEdition> = {
  overview: {
    slug: "overview",
    routePath: "/",
    pageTitleLabel: "Official Invitation",
    editionBadge: "Official Invitation",
    defaultGuestTitle: "Honoured Faculty & Students",
    heading1: EVENT_METADATA.heading1,
    heading2: EVENT_METADATA.heading2,
    content1: EVENT_METADATA.content1,
    content2:
      "Cordial Invitation to Celebrate Innovation, Fellowship & Academic Distinction",
    content3: EVENT_METADATA.content3,
    content4: EVENT_METADATA.content4,
    cardSummary:
      "Celebrating a defining year of engineering spirit, scholarly fellowship, and departmental pride in the Main College Hall.",
    invitationLead: "You Are Cordially Invited",
    invitationMessage:
      "With sincere warmth and pride, the Computing Society invites you to join faculty, dignitaries, and students in the Main College Hall on the fourteenth of November, 2026, for our Grand Annual Function.",
    ceremonialClosing: "Computing Society 2026",
    passCategoryLabel: "OFFICIAL INVITATION",
    theme: {
      accentHex: "#9A7322",
      accentSoftRgba: "rgba(207, 169, 86, 0.16)",
      accentBorderRgba: "rgba(184, 146, 62, 0.34)",
      atmosphericGlowRgba: "rgba(218, 184, 108, 0.28)",
    },
  },

  "chief-guest": {
    slug: "chief-guest",
    routePath: "/chief-guest",
    pageTitleLabel: "Chief Guest · Principal Prof. Qazi Ehsan Ahmed",
    editionBadge: "Chief Guest",
    defaultGuestTitle: "Principal Prof. Qazi Ehsan Ahmed",
    heading1: EVENT_METADATA.heading1,
    heading2: EVENT_METADATA.heading2,
    content1: EVENT_METADATA.content1,
    content2:
      "Honouring Principal Prof. Qazi Ehsan Ahmed as Chief Guest of the Evening",
    content3: EVENT_METADATA.content3,
    content4: EVENT_METADATA.content4,
    cardSummary:
      "Your esteemed leadership and gracious presence as Chief Guest honour our faculty and inspire the Department of Computer Science.",
    invitationLead: "Honoured Request for Our Chief Guest",
    invitationMessage:
      "On behalf of the faculty and students of the Department of Computer Science, it is our distinct privilege to invite Principal Prof. Qazi Ehsan Ahmed as Chief Guest at the Grand Annual Function 2026 on 14th November in the Main College Hall.",
    ceremonialClosing: "Faculty & Computing Society Cabinet",
    passCategoryLabel: "CHIEF GUEST · PRINCIPAL",
    theme: {
      accentHex: "#946D1E",
      accentSoftRgba: "rgba(207, 169, 86, 0.18)",
      accentBorderRgba: "rgba(184, 146, 62, 0.38)",
      atmosphericGlowRgba: "rgba(222, 190, 114, 0.30)",
    },
  },

  farewell: {
    slug: "farewell",
    routePath: "/farewell",
    pageTitleLabel: "Farewell Party · Class of Batch-V",
    editionBadge: "Farewell Party · Class of Batch-V",
    defaultGuestTitle: "Class of Batch-V",
    heading1: EVENT_METADATA.heading1,
    heading2: EVENT_METADATA.heading2,
    content1: "Grand Farewell Party 2026",
    content2:
      "Farewell Party Honouring the Graduating Class of Batch-V · Grand Annual Function 2026",
    content3: EVENT_METADATA.content3,
    content4: EVENT_METADATA.content4,
    cardSummary:
      "Celebrating the Class of Batch-V at our Farewell Party — honouring your years of code, fellowship, and lasting legacy in KTS, Haripur.",
    invitationLead: "Farewell Party Tribute to Class of Batch-V",
    invitationMessage:
      "In honour of the Class of Batch-V, the Computing Society warmly invites you to the Grand Farewell Party 2026 during our Annual Function on 14th November in the Main College Hall to celebrate your achievements and bid a memorable farewell.",
    ceremonialClosing: "Farewell Party · Junior Batches & Computing Society",
    passCategoryLabel: "BATCH-V FAREWELL PARTY",
    theme: {
      accentHex: "#9A7322",
      accentSoftRgba: "rgba(212, 174, 94, 0.17)",
      accentBorderRgba: "rgba(184, 146, 62, 0.35)",
      atmosphericGlowRgba: "rgba(218, 184, 108, 0.27)",
    },
  },

  welcome: {
    slug: "welcome",
    routePath: "/welcome",
    pageTitleLabel: "Welcome Invitation",
    editionBadge: "Welcome Students Edition",
    defaultGuestTitle: "Incoming Computing Scholars",
    heading1: EVENT_METADATA.heading1,
    heading2: EVENT_METADATA.heading2,
    content1: EVENT_METADATA.content1,
    content2: "Warmly Welcoming Our Incoming Students to Computer Science",
    content3: EVENT_METADATA.content3,
    content4: EVENT_METADATA.content4,
    cardSummary:
      "Step into a vibrant community of builders, algorithmic thinkers, and mentors ready to launch your journey in Haripur.",
    invitationLead: "Welcome to the Department of Computer Science",
    invitationMessage:
      "With immense enthusiasm, the Computing Society welcomes our incoming batch to Government Akhtar Nawaz Khan (S) Degree College, KTS, Haripur. Join us in the Main College Hall on 14th November, 2026 as we celebrate your new beginning.",
    ceremonialClosing: "Computing Society Reception & Mentorship Wing",
    passCategoryLabel: "WELCOME SCHOLARS EDITION",
    theme: {
      accentHex: "#9A7322",
      accentSoftRgba: "rgba(207, 169, 86, 0.16)",
      accentBorderRgba: "rgba(184, 146, 62, 0.34)",
      atmosphericGlowRgba: "rgba(218, 184, 108, 0.26)",
    },
  },
};
