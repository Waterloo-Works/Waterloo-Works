// Configuration settings for the application

/**
 * Controls whether automatic redirects are enabled after authentication actions.
 * Set to false to disable auto-redirects for debugging/development.
 */
export const ENABLE_AUTO_REDIRECTS = false;

// Public base URL used to build redirect URLs for auth flows.
// In production, default to the live domain unless NEXT_PUBLIC_APP_URL is provided.
// In development, default to localhost for local testing.
const inferredBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://waterloo.app"
    : "http://localhost:3000");

export const PUBLIC_APP_URL = inferredBaseUrl;
