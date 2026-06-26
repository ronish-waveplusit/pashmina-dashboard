import type { LucideIcon } from "lucide-react";
import { Store, Share2, Mail, Info, Home } from "lucide-react";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "url";
  placeholder?: string;
  help?: string;
  rows?: number;
  /** Render across two columns on wider screens (short fields). */
  half?: boolean;
}

export interface GroupDef {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  fields: FieldDef[];
  /** When true, the form also shows an image uploader (About journey image). */
  hasImage?: boolean;
  imageLabel?: string;
  imageHelp?: string;
}

/**
 * Source of truth for the storefront-editable settings, grouped into tabs.
 * Keys map 1:1 to the `settings` table keys the blades read.
 */
export const SETTINGS_GROUPS: GroupDef[] = [
  {
    id: "general",
    label: "General",
    icon: Store,
    description: "Brand name and description used across the storefront.",
    fields: [
      { key: "site_name", label: "Site name", type: "text", placeholder: "New Monalisa Pashmina", half: true },
      { key: "site_tagline", label: "Tagline", type: "text", placeholder: "Pashmina", half: true },
      { key: "site_description", label: "Description", type: "textarea", rows: 3, placeholder: "Hand-loomed in the Himalayas since 1962." },
      { key: "site_location", label: "Location", type: "text", placeholder: "Kathmandu, Nepal", half: true },
      { key: "atelier_tagline", label: "Atelier tagline", type: "text", placeholder: "Visits to the workshop are by appointment.", half: true },
    ],
  },
  {
    id: "home",
    label: "Home",
    icon: Home,
    description: "The hero headline and the two intro lines above the home banner.",
    fields: [
      {
        key: "hero_words",
        label: "Hero rotating words",
        type: "text",
        placeholder: "Heritage, Culture, Elegance",
        help: "Comma-separated. Each word animates in turn as the big hero title.",
      },
      {
        key: "hero_left_text",
        label: "Intro line (left of banner)",
        type: "textarea",
        rows: 2,
        placeholder: "From the high-altitude Changthang plateau, through the looms of Kathmandu, to the world.",
      },
      {
        key: "hero_right_text",
        label: "Intro line (right of banner)",
        type: "textarea",
        rows: 2,
        placeholder: "Pure cashmere, hand-spun and woven by master artisans across three generations.",
      },
    ],
  },
  {
    id: "social",
    label: "Social",
    icon: Share2,
    description: "Links shown in the footer.",
    fields: [
      { key: "social_instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/...", half: true },
      { key: "social_twitter", label: "Twitter / X URL", type: "url", placeholder: "https://x.com/...", half: true },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    description: "Shown on the contact page and footer.",
    fields: [
      { key: "contact_address", label: "Address", type: "textarea", rows: 2, placeholder: "Loom House, Pashmina Bazaar\nKathmandu 44600, Nepal", help: "Line breaks are preserved on the storefront." },
      { key: "contact_phone", label: "Phone", type: "text", placeholder: "+977 1 4220 1234", half: true },
      { key: "contact_email", label: "Email", type: "text", placeholder: "hello@example.com", half: true },
      { key: "contact_hours", label: "Opening hours", type: "textarea", rows: 2, placeholder: "Monday — Saturday\n10:00 – 18:00 NPT", help: "Line breaks are preserved on the storefront." },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: Info,
    description: "The About page hero and journey section.",
    fields: [
      { key: "about_hero_label", label: "Hero label", type: "text", placeholder: "Since 1962" },
      { key: "about_hero_title", label: "Hero title", type: "text", placeholder: "Our Story" },
      { key: "about_hero_subtitle", label: "Hero subtitle", type: "textarea", rows: 3, placeholder: "Three generations of master weavers..." },
      { key: "about_journey_title", label: "Journey title", type: "text", placeholder: "From the plateau to the loom" },
      { key: "about_story", label: "Journey story", type: "textarea", rows: 8, placeholder: "Write the story here...", help: "One paragraph per line." },
    ],
    hasImage: true,
    imageLabel: "Journey image",
    imageHelp: "Upload JPG, PNG or WEBP. Replaces the journey section photo on the About page.",
  },
];
