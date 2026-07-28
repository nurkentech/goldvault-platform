import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  // Production is always served through the HTTPS Namecheap proxy. Some
  // Passenger configurations omit x-forwarded-proto, so do not downgrade the
  // cookie solely because the internal hop uses HTTP.
  if (process.env.NODE_ENV === "production") return true;
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    // Authentication and API calls are same-site. Lax is accepted by browsers
    // without the fragile SameSite=None + Secure coupling and still supports
    // top-level OAuth callbacks.
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
