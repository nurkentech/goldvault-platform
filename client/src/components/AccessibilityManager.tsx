import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function AccessibilityManager() {
  const [location] = useLocation(); const [message, setMessage] = useState("");
  useEffect(() => {
    const title = document.title || "GoldVaults";
    setMessage(`Navigated to ${title}`);
    const main = document.querySelector<HTMLElement>("main");
    if (main && !main.hasAttribute("tabindex")) main.tabIndex = -1;
  }, [location]);
  return <div className="sr-only" aria-live="polite" aria-atomic="true">{message}</div>;
}
