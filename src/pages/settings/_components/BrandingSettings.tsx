import React, { useState } from "react";
import { AxiosError } from "axios";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "../../../components/ui/use-toast";
import { saveBranding } from "../../../api/setting";
import { useBrandingStore } from "../../../store/brandingStore";

const IMAGE_MAX_MB = 3;

// Logo/favicon accept a wider set than the shared validator (favicons are often
// SVG or ICO), so validate locally here.
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];

const validateBrandingFile = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG, WEBP, SVG or ICO image.";
  }
  if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `Image is ${sizeMb}MB — please use one ${IMAGE_MAX_MB}MB or smaller.`;
  }
  return null;
};

interface Slot {
  file: File | null;
  preview: string | null;
  error: string | null;
}

const emptySlot: Slot = { file: null, preview: null, error: null };

/**
 * Logo & favicon uploader. Images can only be replaced (not removed): picking a
 * new file uploads it via the media-settings endpoint, then updates the
 * persisted branding store so the login page, sidebar and browser tab reflect
 * the change without a reload. Current images are read from the same store.
 */
export const BrandingSettings: React.FC = () => {
  const setBranding = useBrandingStore((s) => s.setBranding);
  const logoUrl = useBrandingStore((s) => s.logo);
  const faviconUrl = useBrandingStore((s) => s.favicon);

  const [logo, setLogo] = useState<Slot>(emptySlot);
  const [favicon, setFavicon] = useState<Slot>(emptySlot);
  const [isSaving, setIsSaving] = useState(false);

  const pickFile = (
    file: File | null,
    setSlot: React.Dispatch<React.SetStateAction<Slot>>
  ): boolean => {
    if (!file) {
      setSlot(emptySlot);
      return true;
    }
    const error = validateBrandingFile(file);
    if (error) {
      setSlot({ file: null, preview: null, error });
      return false;
    }
    setSlot({ file, preview: URL.createObjectURL(file), error: null });
    return true;
  };

  const hasChanges = logo.file !== null || favicon.file !== null;

  const handleSave = async () => {
    // Replace-only: upload each picked image via the media-settings endpoint
    // (key = logo_image | favicon_image, file = binary).
    if (!logo.file && !favicon.file) return;

    setIsSaving(true);
    try {
      const [logoRes, faviconRes] = await Promise.all([
        logo.file ? saveBranding("logo_image", logo.file) : null,
        favicon.file ? saveBranding("favicon_image", favicon.file) : null,
      ]);

      // Update the persisted store from the URLs the server returned.
      setBranding({
        ...(logoRes?.url ? { logo: logoRes.url } : {}),
        ...(faviconRes?.url ? { favicon: faviconRes.url } : {}),
      });
      setLogo(emptySlot);
      setFavicon(emptySlot);
      toast({ title: "Branding saved" });
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message
          : err instanceof Error
            ? err.message
            : "Please try again.";
      toast({
        variant: "destructive",
        title: "Save failed",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSlot = (
    title: string,
    help: string,
    slot: Slot,
    currentUrl: string | null | undefined,
    setSlot: React.Dispatch<React.SetStateAction<Slot>>,
    boxClass: string
  ) => {
    // Preview precedence: newly picked > current server URL.
    const shown = slot.preview ?? currentUrl ?? null;

    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <Label className="text-sm font-medium">{title}</Label>
        <div className="mt-3 flex items-start gap-4">
          <div
            className={`shrink-0 overflow-hidden rounded-md border bg-background ${boxClass}`}
          >
            {shown ? (
              <img
                src={shown}
                alt={title}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/x-icon"
              onChange={(e) => {
                if (!pickFile(e.target.files?.[0] ?? null, setSlot)) {
                  e.target.value = "";
                }
              }}
              className="cursor-pointer"
            />
            {slot.error ? (
              <p className="text-xs text-red-600">{slot.error}</p>
            ) : slot.file ? (
              <p className="text-xs text-muted-foreground">
                New image selected — click Save to upload.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {help} Upload a new image to replace the current one.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4 border-t pt-6">
      <div>
        <h3 className="text-sm font-semibold">Branding</h3>
        <p className="text-xs text-muted-foreground">
          Logo appears on the login page, sidebar and admin header; the favicon
          is the browser-tab icon.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {renderSlot(
          "Logo",
          `JPG, PNG, WEBP or SVG. Max ${IMAGE_MAX_MB}MB.`,
          logo,
          logoUrl,
          setLogo,
          "h-24 w-40"
        )}
        {renderSlot(
          "Favicon",
          `Square PNG, SVG or ICO. Max ${IMAGE_MAX_MB}MB.`,
          favicon,
          faviconUrl,
          setFavicon,
          "h-16 w-16"
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? "Saving…" : "Save branding"}
        </Button>
      </div>
    </div>
  );
};

export default BrandingSettings;
