/**
 * Type definitions for the MMT auth token system.
 *
 * The runtime functions (issueAuthToken, inspectAuthToken, etc.)
 * originally lived in `tokens.ts` and depended on the `authToken`
 * model and `AppRole` enum — both of which are DTC-only and not in
 * the MMT schema. They were never called from any MMT code path.
 *
 * What IS used by MMT is the `AuthTokenPurpose` type, imported by
 * transport.ts and delivery.ts for typing their token URLs. We
 * keep that type here in a types-only file so the rest of the
 * codebase can still reference it without the broken Prisma
 * references.
 *
 * If the auth token system is ever needed on MMT, the full
 * implementation will need to be re-added with an MMT-shaped
 * `authToken` model and `AppRole` enum.
 */

export type AuthTokenPurpose = "INVITE" | "PASSWORD_RESET" | "LESSON_CONFIRMATION";
