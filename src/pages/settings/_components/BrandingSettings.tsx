import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2, ImagePlus, Trash2 } from "lucide-react";
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

interface Props {
  /** Current logo URL from the settings API (server truth). */
  logoUrl?: string | null;
  /** Current favicon URL from the settings API (server truth). */
  faviconUrl?: string | null;
}

interface Slot {
  file: File | null;
  preview: string | null;
  remove: boolean;
  error: string | null;
}

const emptySlot: Slot = { file: null, preview: null, remove: false, error: null };

/**
 * Logo & favicon uploader. Sends both binaries (and delete_logo / delete_favicon
 * flags) in a single multipart request, then updates the persisted branding
 * store so the login page and browser tab reflect the change without a reload.
 */
export const BrandingSettings: React.FC<Props> = ({ logoUrl, faviconUrl }) => {
  const queryClient = useQueryClient();
  const setBranding = useBrandingStore((s) => s.setBranding);

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
      setSlot({ file: null, preview: null, remove: false, error });
      return false;
    }
    setSlot({
      file,
      preview: URL.createObjectURL(file),
      remove: false,
      error: null,
    });
    return true;
  };

  const markRemove = (
    setSlot: React.Dispatch<React.SetStateAction<Slot>>
  ) => setSlot({ file: null, preview: null, remove: true, error: null });

  const hasChanges =
    logo.file !== null ||
    favicon.file !== null ||
    logo.remove ||
    favicon.remove;

  const handleSave = async () => {
    // The settings endpoint is keyed, so logo and favicon go as separate
    // requests, each carrying its own `key` + `group` (the endpoint rejects a
    // request with no `key`). Binary is sent as `logo` / `favicon`; removal
    // uses the `delete_logo` / `delete_favicon` flags.
    // Uploads go as POST multipart (key + group + binary); deletes go as PUT
    // with just the delete flag.
    const requests: Promise<unknown>[] = [];

    if (logo.file) {
      const fd = new FormData();
      fd.append("key", "logo");
      fd.append("group", "general");
      fd.append("logo", logo.file);
      requests.push(saveBranding(fd, "post"));
    } else if (logo.remove) {
      requests.push(saveBranding({ delete_logo: 1 }, "put"));
    }

    if (favicon.file) {
      const fd = new FormData();
      fd.append("key", "favicon");
      fd.append("group", "general");
      fd.append("favicon", favicon.file);
      requests.push(saveBranding(fd, "post"));
    } else if (favicon.remove) {
      requests.push(saveBranding({ delete_favicon: 1 }, "put"));
    }

    if (requests.length === 0) return;

    setIsSaving(true);
    try {
      await Promise.all(requests);
      // Reflect the change immediately in the persisted store.
      setBranding({
        ...(logo.file
          ? { logo: logo.preview }
          : logo.remove
            ? { logo: null }
            : {}),
        ...(favicon.file
          ? { favicon: favicon.preview }
          : favicon.remove
            ? { favicon: null }
            : {}),
      });
      // Refetch settings so the store/store-URLs pick up the real server URLs.
      queryClient.invalidateQueries({ queryKey: ["settings-all"] });
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
    // Preview precedence: newly picked > removed (blank) > current server URL.
    const shown = slot.preview ?? (slot.remove ? null : currentUrl ?? null);
    const canRemove = !slot.remove && (slot.file !== null || !!currentUrl);

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
            ) : slot.remove ? (
              <p className="text-xs text-red-600">
                Will be removed on Save.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{help}</p>
            )}
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => markRemove(setSlot)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
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
          Logo appears on the login page and admin header; the favicon is the
          browser-tab icon.
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
