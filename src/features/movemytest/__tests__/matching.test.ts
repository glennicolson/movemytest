import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluatePotentialMatch, type MatchCentre, type MatchListing } from "../matching";
import { bookingReferenceExpiresAt, isBookingReferenceVisible } from "../secrets";
import { containsForbiddenSensitiveValue } from "../validation";

const centres = new Map<string, MatchCentre>([
  ["edinburgh", { id: "edinburgh", nearestCentreIds: ["musselburgh", "dunfermline", "livingston"] }],
  ["musselburgh", { id: "musselburgh", nearestCentreIds: ["edinburgh", "livingston", "dunfermline"] }],
  ["glasgow", { id: "glasgow", nearestCentreIds: ["hamilton", "paisley", "bishopbriggs"] }],
  ["original", { id: "original", nearestCentreIds: [] }],
  ["belfast", { id: "belfast", nearestCentreIds: [] }],
]);

function listing(overrides: Partial<MatchListing> = {}): MatchListing {
  return {
    id: "a",
    userId: "user-a",
    status: "ACTIVE",
    currentCentreId: "edinburgh",
    originalCentreId: null,
    currentDateTime: new Date("2026-07-20T09:00:00.000Z"),
    testType: "WEEKDAY_STANDARD_CAR",
    hasRemainingChange: true,
    desiredDateFrom: new Date("2026-07-01T00:00:00.000Z"),
    desiredDateTo: new Date("2026-08-30T23:59:59.000Z"),
    desiredTimePreference: "ANY",
    desiredCentreIds: ["musselburgh", "edinburgh", "original"],
    desiredDirection: "EITHER",
    jurisdiction: "GB_DVSA",
    country: "SCOTLAND",
    ...overrides,
  };
}

const nowBeforeRule = new Date("2026-05-12T10:00:00.000Z");
const nowAfterRule = new Date("2026-06-10T10:00:00.000Z");

describe("MoveMyTest matching", () => {
  it("matches a compatible happy path", () => {
    const a = listing();
    const b = listing({ id: "b", userId: "user-b", currentCentreId: "musselburgh", currentDateTime: new Date("2026-07-25T10:00:00.000Z"), desiredCentreIds: ["edinburgh"] });
    const result = evaluatePotentialMatch(a, b, centres, nowAfterRule);
    assert.equal(result.eligible, true);
    assert.ok(result.score > 0);
  });

  it("rejects when either user has no remaining change", () => {
    const result = evaluatePotentialMatch(listing({ hasRemainingChange: false }), listing({ id: "b", userId: "user-b", currentCentreId: "musselburgh", desiredCentreIds: ["edinburgh"] }), centres, nowAfterRule);
    assert.equal(result.eligible, false);
    assert.match(result.reasons.join(" "), /remaining allowed change/);
  });

  it("rejects inside the 10 full working day window", () => {
    const result = evaluatePotentialMatch(listing({ currentDateTime: new Date("2026-06-17T09:00:00.000Z") }), listing({ id: "b", userId: "user-b", currentCentreId: "musselburgh", currentDateTime: new Date("2026-07-25T10:00:00.000Z"), desiredCentreIds: ["edinburgh"] }), centres, nowAfterRule);
    assert.equal(result.eligible, false);
    assert.match(result.reasons.join(" "), /10 full working day/);
  });

  it("rejects when test types differ", () => {
    const result = evaluatePotentialMatch(listing(), listing({ id: "b", userId: "user-b", currentCentreId: "musselburgh", testType: "EXTENDED_WEEKDAY", desiredCentreIds: ["edinburgh"] }), centres, nowAfterRule);
    assert.equal(result.eligible, false);
    assert.match(result.reasons.join(" "), /test types/);
  });

  it("allows wider centre movement before 9 June 2026", () => {
    const result = evaluatePotentialMatch(listing({ desiredCentreIds: ["glasgow"] }), listing({ id: "b", userId: "user-b", currentCentreId: "glasgow", desiredCentreIds: ["edinburgh"] }), centres, nowBeforeRule);
    assert.equal(result.eligible, true);
  });

  it("rejects non-nearby centre movement from 9 June 2026", () => {
    const result = evaluatePotentialMatch(listing({ desiredCentreIds: ["glasgow"] }), listing({ id: "b", userId: "user-b", currentCentreId: "glasgow", desiredCentreIds: ["edinburgh"] }), centres, nowAfterRule);
    assert.equal(result.eligible, false);
    assert.match(result.reasons.join(" "), /location rule/);
  });

  it("allows same-centre matches from 9 June 2026", () => {
    const result = evaluatePotentialMatch(listing({ desiredCentreIds: ["edinburgh"] }), listing({ id: "b", userId: "user-b", currentCentreId: "edinburgh", desiredCentreIds: ["edinburgh"] }), centres, nowAfterRule);
    assert.equal(result.eligible, true);
  });

  it("allows 3-nearest-centre matches from 9 June 2026", () => {
    const result = evaluatePotentialMatch(listing(), listing({ id: "b", userId: "user-b", currentCentreId: "musselburgh", desiredCentreIds: ["edinburgh"] }), centres, nowAfterRule);
    assert.equal(result.eligible, true);
  });

  it("allows original first-booked centre matches from 9 June 2026", () => {
    const result = evaluatePotentialMatch(listing({ originalCentreId: "original", desiredCentreIds: ["original"] }), listing({ id: "b", userId: "user-b", currentCentreId: "original", originalCentreId: "edinburgh", desiredCentreIds: ["edinburgh"] }), centres, nowAfterRule);
    assert.equal(result.eligible, true);
  });

  it("rejects NI listings by default", () => {
    const result = evaluatePotentialMatch(listing({ jurisdiction: "NI_DVA", currentCentreId: "belfast", desiredCentreIds: ["belfast"] }), listing({ id: "b", userId: "user-b", jurisdiction: "NI_DVA", currentCentreId: "belfast", desiredCentreIds: ["belfast"] }), centres, nowAfterRule);
    assert.equal(result.eligible, false);
    assert.match(result.reasons.join(" "), /NI\/DVA live matching is disabled/);
  });

  it("flags sensitive-looking values in forbidden form fields", () => {
    assert.equal(containsForbiddenSensitiveValue("4111 1111 1111 1111"), true);
    assert.equal(containsForbiddenSensitiveValue("just a booking ref"), false);
  });

  it("keeps booking references hidden from the owner and after TTL expiry", () => {
    const now = new Date("2026-07-01T10:00:00.000Z");
    const activeSecret = { ownerUserId: "user-a", expiresAt: bookingReferenceExpiresAt(now, 60), deletedAt: null };
    const expiredSecret = { ownerUserId: "user-a", expiresAt: new Date("2026-07-01T10:30:00.000Z"), deletedAt: null };
    const deletedSecret = { ownerUserId: "user-a", expiresAt: bookingReferenceExpiresAt(now, 60), deletedAt: new Date("2026-07-01T10:10:00.000Z") };

    assert.equal(isBookingReferenceVisible(activeSecret, "user-a", now), false);
    assert.equal(isBookingReferenceVisible(activeSecret, "user-b", now), true);
    assert.equal(isBookingReferenceVisible(expiredSecret, "user-b", new Date("2026-07-01T10:31:00.000Z")), false);
    assert.equal(isBookingReferenceVisible(deletedSecret, "user-b", now), false);
  });
});
