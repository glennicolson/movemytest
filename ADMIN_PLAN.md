# MoveMyTest Admin Dashboard — Build Plan

## Objective
Build a standalone admin dashboard for MoveMyTest, using the DTC Test Swap admin as UI inspiration but with zero DTC/CRM dependencies.

## Approach
Build fresh components that use only the MoveMyTest standalone Prisma schema. Do NOT copy DTC admin components directly (they are tightly coupled to CRM models).

---

## Phase 1: Foundation — Staff Auth Layout

### Files to Create
1. `src/app/(staff)/layout.tsx`
   - `requirePermission("adminWorkspace")` guard
   - Minimal AppShell with admin nav
   - No DTC-specific popups (Book Lesson, Record Payment)

2. `src/app/(staff)/admin/page.tsx`
   - Server component
   - Fetches all admin data in parallel
   - Renders `AdminTabs` client component

---

## Phase 2: Data Layer

### Files to Create
3. `src/features/admin/types.ts`
   - Clean serialisable types matching Prisma includes
   - No CRM/User model references

4. `src/features/admin/queries.ts`
   - Server-side Prisma queries
   - Uses standalone model names: `learnerAccount`, `listing`, `match`, `instructorAccount`, `report`, `emailQueue`, `instructorAuditLog`, `adminNote`, `testCentre`

---

## Phase 3: Client Components (Tabs)

### Files to Create
5. `src/components/admin/admin-tabs.tsx`
   - Tab navigation (Dashboard, Learners, Listings, Matches, Instructors, Support, Emails, Audit, Centres)
   - Passes data to tab-specific components

6. `src/components/admin/admin-overview.tsx`
   - Metrics cards (total learners, active listings, proposed matches, open reports, pending emails)

7. `src/components/admin/admin-learners.tsx`
   - Searchable learner directory
   - Shows email, mobile, status, listings count

8. `src/components/admin/admin-listings.tsx`
   - Listings table with centre, date, status, instructor

9. `src/components/admin/admin-matches.tsx`
   - Matches view with learner pairings, scores, statuses

10. `src/components/admin/admin-instructors.tsx`
    - Instructor directory with ADI, linked learners

11. `src/components/admin/admin-support.tsx`
    - Support ticket management with reply capability

12. `src/components/admin/admin-emails.tsx`
    - Email queue (pending/sent/failed)

13. `src/components/admin/admin-audit.tsx`
    - Audit trail of instructor actions

14. `src/components/admin/admin-centres.tsx`
    - Test centre freshness tracking

---

## Shared Components (reused across tabs)

15. `src/components/admin/status-pill.tsx`
    - Color-coded status badges

16. `src/components/admin/metric-card.tsx`
    - Summary metric cards

17. `src/components/admin/search-field.tsx`
    - Search input for filtering tables

18. `src/components/admin/collapsible-section.tsx`
    - Expandable/collapsible detail sections

---

## Phase 4: Server Actions

19. `src/features/admin/actions.ts`
    - Reply to support tickets
    - Update ticket status
    - Resend failed emails
    - Add admin notes

---

## Schema Model Mapping (DTC → MoveMyTest)

| DTC Model | MoveMyTest Model | Notes |
|-----------|-------------------|-------|
| `testSwapLearnerAccount` | `learnerAccount` | Direct fields: email, mobileNumber |
| `testSwapInstructorAccount` | `instructorAccount` | Direct fields: email, firstName, lastName |
| `testSwapListing` | `listing` | Uses `LearnerAccount` not `User` |
| `testSwapMatch` | `match` | Same structure |
| `testSwapReport` | `report` | Reporter is `LearnerAccount` not `User` |
| `testSwapEmailQueue` | `emailQueue` | Same structure |
| `testSwapInstructorAuditLog` | `instructorAuditLog` | Same structure |
| `testSwapAdminNote` | `adminNote` | Author reference changes |
| `testCentre` | `testCentre` | Same structure |

---

## Key Simplifications vs DTC

| Feature | DTC | MoveMyTest |
|---------|-----|------------|
| CRM linking | Shows CRM vs standalone | All standalone — remove distinction |
| Branch filtering | Multi-branch | Single site |
| User model fallback | `user?.email` or `testSwapAccount?.email` | Only `account.email` |
| Instructor CRM profile | `crmInstructorProfile.user` | Direct fields on `InstructorAccount` |
| Booking references | Encrypted secrets with expiry | Simplified |
| Email sender | `Support@thedtc.co.uk` | `admin@movemytest.co.uk` (configurable) |

---

## Simplifications for Initial Build

1. **No booking reference secrets** in admin view (complex encryption)
2. **No instructor invite tracking** (simplified invites)
3. **No call window countdown** (can add later)
4. **No auto-expiry logic** in admin page (keep it simple)
5. **Basic search only** (no advanced filters initially)

---

## Branding

- Page title: "MoveMyTest Admin"
- Description: "Admin Portal for MoveMyTest — learner test swap management"
- Email: "admin@movemytest.co.uk" (or configurable)
- No DTC/Driving Test Centre references

---

## Testing Checklist

- [ ] Admin page loads with `ADMIN` role session
- [ ] Non-admin users redirected
- [ ] Dashboard shows metrics
- [ ] Each tab loads without errors
- [ ] Search filters work
- [ ] Support ticket replies work
- [ ] Email queue displays correctly
- [ ] No TypeScript errors
- [ ] Build passes

---

## Current Status

**Started:** 2026-05-28 ~16:26  
**Phase:** Building foundation (staff layout + admin page)
