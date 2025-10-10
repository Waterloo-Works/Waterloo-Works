// Configuration settings for the application

/**
 * Controls whether automatic redirects are enabled after authentication actions.
 * Set to false to disable auto-redirects for debugging/development.
 */
export const ENABLE_AUTO_REDIRECTS = false;

// Public base URL used to build redirect URLs for auth flows.
// Set NEXT_PUBLIC_APP_URL in production (e.g., https://waterloo.works)
export const PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
