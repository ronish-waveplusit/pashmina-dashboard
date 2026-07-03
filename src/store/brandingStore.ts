import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BrandingState {
  /** URL of the uploaded logo, or null when none is set. */
  logo: string | null;
  /** URL of the uploaded favicon, or null when none is set. */
  favicon: string | null;
  /** Merge in new branding values (undefined = leave that field untouched). */
  setBranding: (branding: {
    logo?: string | null;
    favicon?: string | null;
  }) => void;
}

/**
 * Holds the site logo/favicon URLs. Persisted to localStorage so the values
 * are available instantly on every reload — including the unauthenticated
 * login page — without waiting on (or even calling) the settings API.
 */
export const useBrandingStore = create<BrandingState>()(
  persist(
    (set) => ({
      logo: null,
      favicon: null,
      setBranding: (branding) =>
        set((state) => ({
          logo: branding.logo !== undefined ? branding.logo : state.logo,
          favicon:
            branding.favicon !== undefined ? branding.favicon : state.favicon,
        })),
    }),
    { name: "branding-store" }
  )
);
