"use strict";

// cPanel/Passenger requires a stable JavaScript startup file in the
// application root. Each deployment atomically moves the `current` symlink to
// a versioned release, so this adapter never needs release-specific paths.
process.env.NODE_ENV ||= "production";

import("./current/scripts/start-production.mjs").catch(error => {
  console.error("[startup] GoldVault failed to start", error);
  process.exitCode = 1;
});
