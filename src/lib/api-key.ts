/**
 * Internal API Key Authentication
 * Shared between DTC and MMT for secure cross-platform communication
 */

export const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get("X-API-Key");
  return apiKey === INTERNAL_API_KEY && !!INTERNAL_API_KEY;
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized - Invalid API key" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
