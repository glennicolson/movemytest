// Clean standalone admin types for MoveMyTest
// These use only the standalone Prisma schema models
// No CRM references, no User model fallbacks

export interface AdminLearner {
  id: string;
  email: string | null;
  mobileNumber: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  accountSetupCompletedAt: Date | string | null;
  lastLoginAt: Date | string | null;
  mobileContactConsentAt: Date | string | null;
  emailVerifiedAt: Date | string | null;
  listings?: {
    id: string;
    status: string;
    currentCentre?: { name: string } | null;
  }[];
  reports?: { id: string; status: string }[];
}

export interface AdminListing {
  id: string;
  status: string;
  currentDateTime: Date | string | null;
  desiredDirection: string | null;
  desiredDateFrom: Date | string | null;
  desiredDateTo: Date | string | null;
  currentCentre?: { name: string } | null;
  originalCentre?: { name: string } | null;
  account?: {
    id: string;
    email: string | null;
    mobileNumber: string | null;
    accountSetupCompletedAt: Date | string | null;
  } | null;
  instructorDetails?: {
    firstName: string;
    lastName: string;
    adiNumber: string;
    instructorAccount?: { id: string } | null;
    availabilityDecisions?: {
      id: string;
      status: string;
      slotType: string;
      matchId: string | null;
      decidedAt: Date | string;
    }[];
  } | null;
}

export interface AdminMatch {
  id: string;
  status: string;
  score: number;
  updatedAt: Date | string;
  callWindowExpiresAt: Date | string | null;
  listingA?: {
    currentCentre?: { name: string } | null;
    currentDateTime: Date | string | null;
    account?: { email: string | null } | null;
    instructorDetails?: {
      firstName: string;
      lastName: string;
      adiNumber: string;
    } | null;
  } | null;
  listingB?: {
    currentCentre?: { name: string } | null;
    currentDateTime: Date | string | null;
    account?: { email: string | null } | null;
    instructorDetails?: {
      firstName: string;
      lastName: string;
      adiNumber: string;
    } | null;
  } | null;
  secrets?: {
    id: string;
    ownerAccountId: string | null;
    revealedAt: Date | string | null;
    expiresAt: Date | string | null;
    deletedAt: Date | string | null;
    createdAt: Date | string;
  }[];
  events?: { id: string }[];
  instructorAvailabilityDecisions?: {
    id: string;
    status: string;
    instructorAccount?: { firstName: string; lastName: string } | null;
  }[];
}

export interface AdminReport {
  id: string;
  reason: string;
  detail: string | null;
  status: string;
  createdAt: Date | string;
  reporterAccountId: string | null;
  reporter?: { email: string | null } | null;
  listing?: { currentCentre?: { name: string } | null } | null;
  match?: { id: string } | null;
  responses?: {
    id: string;
    message: string;
    channel: string;
    createdAt: Date | string;
  }[];
}

export interface AdminInstructor {
  id: string;
  firstName: string;
  lastName: string;
  adiNumber: string;
  email: string | null;
  mobileNumber: string | null;
  status: string;
  lastLoginAt: Date | string | null;
  updatedAt: Date | string;
  listingLinks?: {
    id: string;
    updatedAt: Date | string;
    listing: {
      currentCentre?: { name: string } | null;
      account?: { email: string | null } | null;
    };
    availabilityDecisions?: { status: string }[];
  }[];
  invites?: { id: string; status: string }[];
}

export interface AdminAuditLog {
  id: string;
  action: string;
  detail: unknown;
  createdAt: Date | string;
  instructorAccount?: {
    firstName: string;
    lastName: string;
    adiNumber: string;
  } | null;
  listingInstructor?: {
    listing?: {
      currentCentre?: { name: string } | null;
      account?: { email: string | null } | null;
    } | null;
  } | null;
}

export interface AdminEmail {
  id: string;
  kind: string;
  recipient: string;
  recipientRole: string;
  status: string;
  scheduledFor: Date | string | null;
  sentAt: Date | string | null;
  retryCount: number;
  maxRetries: number;
  error: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AdminNote {
  id: string;
  note: string;
  entityType: string;
  entityId: string;
  createdAt: Date | string;
}

export interface AdminCentre {
  id: string;
  name: string;
  slug: string | null;
  region: string | null;
  updatedAt: Date | string | null;
}

export type ListingStatusCount = { status: string; _count: { _all: number } };
export type MatchStatusCount = { status: string; _count: { _all: number } };
