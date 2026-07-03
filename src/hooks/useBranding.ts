import { useEffect } from "react";
import { useBrandingStore } from "../store/brandingStore";

/**
 * Applies the current favicon URL to the document's <link rel="icon">.
 *
 * Branding (logo + favicon) lives entirely in the persisted branding store:
 * it's written when an admin uploads via the media-settings endpoint, and
 * rehydrated from localStorage on every reload — so no branding API call fires
 * on load (including the unauthenticated login page).
 *
 * Mount this once, high in the tree (App).
 */
export const useBranding = () => {
  const favicon = useBrandingStore((s) => s.favicon);

  useEffect(() => {
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [favicon]);
};
