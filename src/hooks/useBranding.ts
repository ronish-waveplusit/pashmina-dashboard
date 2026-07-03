import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../api/setting";
import { isSessionExpired } from "../utils/helper/token";
import { useBrandingStore } from "../store/brandingStore";

/**
 * Pull the logo/favicon out of the key/value settings response.
 * The settings endpoint returns each as a `{ key, value }` row whose value is
 * the image URL (or null once deleted).
 */
const LOGO_KEY = "logo";
const FAVICON_KEY = "favicon";

/**
 * Applies the current favicon URL to the document's <link rel="icon">, and —
 * when the user is signed in — refreshes the branding store from the settings
 * API in the background. On the login page (no session) it does nothing but
 * apply whatever was persisted from a previous session, so no API call fires.
 *
 * Mount this once, high in the tree (App), so branding stays in sync app-wide.
 */
export const useBranding = () => {
  const favicon = useBrandingStore((s) => s.favicon);
  const setBranding = useBrandingStore((s) => s.setBranding);

  const authed = !isSessionExpired();

  const { data } = useQuery({
    queryKey: ["settings-all"],
    queryFn: () => getSettings({ page: 1, per_page: 100, paginate: true }),
    // Only hit the (authenticated) settings endpoint when signed in; otherwise
    // rely on the persisted store so the login page still shows the logo.
    enabled: authed,
    staleTime: 1000 * 60 * 5,
  });

  // Sync the store whenever fresh settings arrive.
  useEffect(() => {
    if (!data?.data) return;
    const rows = data.data;
    // The branding rows carry their file URL in a dedicated `logo`/`favicon`
    // field (not `value`); fall back to `value` just in case.
    const logoRow = rows.find((s) => s.key === LOGO_KEY);
    const faviconRow = rows.find((s) => s.key === FAVICON_KEY);
    const logo = logoRow?.logo ?? logoRow?.value ?? null;
    const favicon = faviconRow?.favicon ?? faviconRow?.value ?? null;
    setBranding({ logo, favicon });
  }, [data, setBranding]);

  // Keep the browser-tab favicon in sync with the store.
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
