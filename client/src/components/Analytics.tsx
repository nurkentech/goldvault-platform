import { useEffect } from "react";

const SCRIPT_ID = "goldvaults-analytics";

export default function Analytics() {
  useEffect(() => {
    const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim();
    const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID?.trim();

    // Analytics is optional. An incomplete installation must never affect the
    // customer-facing application.
    if (!endpoint || !websiteId || document.getElementById(SCRIPT_ID)) return;

    let src: string;
    try {
      src = new URL(
        `${endpoint.replace(/\/+$/, "")}/umami`
      ).toString();
    } catch {
      console.warn("Ignoring invalid VITE_ANALYTICS_ENDPOINT.");
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.defer = true;
    script.src = src;
    script.dataset.websiteId = websiteId;
    document.head.appendChild(script);
  }, []);

  return null;
}
