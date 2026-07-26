export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const getLocalLoginUrl = (returnPath: string) => {
  const url = new URL("/", window.location.origin);
  url.searchParams.set("auth", "login");

  if (returnPath.startsWith("/") && !returnPath.startsWith("//")) {
    url.searchParams.set("returnPath", returnPath);
  }

  return url.toString();
};

// Generate login URL at runtime so redirect URI reflects the current origin.
// returnPath: where to send the user after OAuth completes (defaults to /profile)
export const getLoginUrl = (returnPath = "/profile") => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL?.trim();
  const appId = import.meta.env.VITE_APP_ID?.trim();

  // Production installations can use GoldVaults' built-in OTP authentication
  // without depending on the external preview OAuth portal.
  if (!oauthPortalUrl || !appId) {
    return getLocalLoginUrl(returnPath);
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  // Encode origin + returnPath as JSON in state so the server can redirect correctly
  const statePayload = JSON.stringify({ origin: window.location.origin, returnPath });
  const state = btoa(statePayload);

  let url: URL;
  try {
    url = new URL("/app-auth", oauthPortalUrl);
  } catch {
    console.warn("Ignoring invalid VITE_OAUTH_PORTAL_URL; using local authentication.");
    return getLocalLoginUrl(returnPath);
  }

  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
