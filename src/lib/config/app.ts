const defaultPublicAppUrl = "https://movemytest.co.uk";

function getPublicAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) {
    return defaultPublicAppUrl;
  }

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return defaultPublicAppUrl;
  }
}

const publicAppUrl = getPublicAppUrl();

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "MoveMyTest",
  companyName: "MoveMyTest",
  companyWebsite: publicAppUrl,
  publicAppUrl,
  companyTagline: "Free, private driving test swaps.",
  supportEmail: "support@movemytest.co.uk",
};
