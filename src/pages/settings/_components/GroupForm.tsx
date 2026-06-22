import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Loader2, ImagePlus } from "lucide-react";
import { GroupDef, FieldDef } from "../settingsConfig";

interface GroupFormProps {
  group: GroupDef;
  initialValues: Record<string, string>;
  currentImageUrl?: string | null;
  onSave: (values: Record<string, string>, imageFile: File | null) => Promise<void>;
  isSaving: boolean;
  /** Blocks the Save button (e.g. while the About page is still loading). */
  disabled?: boolean;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  group,
  initialValues,
  currentImageUrl,
  onSave,
  isSaving,
  disabled = false,
}) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleFile = (file: File | null) => {
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(values, imageFile);
    setImageFile(null);
    setPreviewUrl(null);
  };

  const renderField = (field: FieldDef) => (
    <div key={field.key} className="space-y-2">
      <Label htmlFor={field.key} className="text-sm font-medium">
        {field.label}
      </Label>
      {field.type === "textarea" ? (
        <Textarea
          id={field.key}
          value={values[field.key] ?? ""}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
        />
      ) : (
        <Input
          id={field.key}
          type={field.type === "url" ? "url" : "text"}
          value={values[field.key] ?? ""}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
        />
      )}
      {field.help && (
        <p className="text-xs text-muted-foreground">{field.help}</p>
      )}
    </div>
  );

  const shownImage = previewUrl ?? currentImageUrl ?? null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {group.fields.map((field) => (
          <div
            key={field.key}
            className={field.half ? "sm:col-span-1" : "sm:col-span-2"}
          >
            {renderField(field)}
          </div>
        ))}
      </div>

      {group.hasImage && (
        <div className="mt-6 rounded-lg border bg-muted/30 p-4">
          <Label className="text-sm font-medium">
            {group.imageLabel ?? "Image"}
          </Label>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="h-28 w-44 shrink-0 overflow-hidden rounded-md border bg-background">
              {shownImage ? (
                <img
                  src={shownImage}
                  alt={group.imageLabel ?? "Current image"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <ImagePlus className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                id={`${group.id}-image`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                className="cursor-pointer"
              />
              {imageFile ? (
                <p className="text-xs text-muted-foreground">
                  New image selected — click Save to upload.
                </p>
              ) : (
                group.imageHelp && (
                  <p className="text-xs text-muted-foreground">
                    {group.imageHelp}
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Changes go live on the storefront immediately after saving.
        </p>
        <Button type="submit" disabled={isSaving || disabled}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
};
