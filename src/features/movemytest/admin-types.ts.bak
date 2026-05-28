// Flat serialisable types for the admin MoveMyTest client tab component.
// These mirror the nested Prisma includes from the server page query.

export interface LearnerAccount {
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
  crmUserId: string | null;
  listings?: {
    id: string;
    status: string;
    currentCentre?: { name: string } | null;
  }[];
  reports?: { id: string; status: string }[];
  bookingReferenceSecrets?: {
    id: string;
    revealedAt: Date | string | null;
    expiresAt: Date | string | null;
    deletedAt: Date | string | null;
    createdAt: Date | string;
  }[];
  crmUser?: {
    learnerProfile?: {
      assignedInstructor?: {
        user: { firstName: string | null; lastName: string | null };
      } | null;
    } | null;
  } | null;
}

export interface AdminListing {
  id: string;
  status: string;
  currentDateTime: Date | string | null;
  desiredDirection: string | null;
  desiredDateFrom: Date | string | null;
  desiredDateTo: Date | string | null;
  userId: string | null;
  currentCentre?: { name: string } | null;
  originalCentre?: { name: string } | null;
  movemytestAccount?: {
    id: string;
    email: string | null;
    mobileNumber: string | null;
    accountSetupCompletedAt: Date | string | null;
    crmUserId: string | null;
  } | null;
  user?: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    learnerProfile?: {
      assignedInstructor?: { user: { firstName: string | null; lastName: string | null } } | null;
    } | null;
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
    movemytestAccount?: { email: string | null } | null;
    instructorDetails?: unknown;
  } | null;
  listingB?: {
    currentCentre?: { name: string } | null;
    currentDateTime: Date | string | null;
    movemytestAccount?: { email: string | null } | null;
    instructorDetails?: unknown;
  } | null;
  secrets?: {
    id: string;
    ownerAccountId: string | null;
    ownerUserId: string | null;
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
  reporterUserId: string | null;
  reporterAccountId: string | null;
  reporter?: { email: string | null; firstName: string | null; lastName: string | null } | null;
  reporterMoveMyTestAccount?: { email: string | null } | null;
  listing?: { currentCentre?: { name: string } | null } | null;
  match?: { id: string } | null;
  responses?: {
    id: string;
    message: string;
    channel: string;
    createdAt: Date | string;
    author?: { firstName: string | null; lastName: string | null } | null;
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
  crmInstructorProfile?: {
    user: { firstName: string | null; lastName: string | null };
  } | null;
  listingLinks?: {
    id: string;
    updatedAt: Date | string;
    movemytestListings: {
      currentCentre?: { name: string } | null;
      movemytestAccount?: { email: string | null } | null;
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
      movemytestAccount?: { email: string | null } | null;
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
  createdAt: Date | string;
  user: { firstName: string | null; lastName: string | null };
}

export interface AdminCentre {
  id: string;
  name: string;
  region: string | null;
  sourceLastCheckedAt: Date | string | null;
}
