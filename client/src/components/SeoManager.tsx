import { useEffect } from "react";
import { useLocation } from "wouter";

const pages: Record<string, { title: string; description: string; schema?: string }> = {
  "/": {
    title: "GoldVaults | Gold & Crypto Investment Platform",
    description: "Buy, hold, exchange, and earn yield on gold and digital assets in one secure platform.",
    schema: "FinancialService",
  },
  "/about": {
    title: "About GoldVaults | Secure Gold & Digital Assets",
    description: "Learn how GoldVaults unifies physical gold custody and digital-asset investing.",
    schema: "AboutPage",
  },
  "/how-it-works": {
    title: "How GoldVaults Works | Deposit, Invest, Earn",
    description: "See how to fund a wallet, invest in gold and crypto plans, and track returns securely.",
    schema: "HowTo",
  },
};

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function SeoManager() {
  const [location] = useLocation();
  useEffect(() => {
    const page = pages[location] ?? {
      title: location.startsWith("/dashboard") ? "Account Dashboard | GoldVaults" : "GoldVaults | Gold & Crypto",
      description: "Secure gold and digital-asset investing with GoldVaults.",
    };
    document.title = page.title;
    setMeta('meta[name="description"]', "name", "description", page.description);
    setMeta('meta[property="og:title"]', "property", "og:title", page.title);
    setMeta('meta[property="og:description"]', "property", "og:description", page.description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", page.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", page.description);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${location === "/" ? "" : location}`;
    document.getElementById("goldvaults-jsonld")?.remove();
    if (page.schema) {
      const script = document.createElement("script");
      script.id = "goldvaults-jsonld";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org", "@type": page.schema,
        name: page.title, description: page.description, url: canonical.href,
        provider: { "@type": "Organization", name: "GoldVaults" },
      });
      document.head.appendChild(script);
    }
  }, [location]);
  return null;
}
