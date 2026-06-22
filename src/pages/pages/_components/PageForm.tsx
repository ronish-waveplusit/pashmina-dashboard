import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Loader2 } from "lucide-react";
import * as Yup from "yup";
import { AxiosError } from "axios";
import { Page } from "../../../types/page";
import { pageSchema } from "./pageSchema";

interface PageFormProps {
  initialData?: Page | null;
  onSubmit: (formData: FormData) => Promise<Page>;
  isSubmitting: boolean;
  onCloseModal: () => void;
}

type FormErrors = Record<string, string | string[] | undefined>;

export const PageForm: React.FC<PageFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCloseModal,
}) => {
  const isEditMode = !!initialData;

  const [data, setData] = useState({
    title: initialData?.title ?? "",
    content: initialData?.content ?? "",
    meta_description: initialData?.meta_description ?? "",
    is_active: initialData?.is_active ?? true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = await pageSchema.validate(data, { abortEarly: false });

      const formData = new FormData();
      formData.append("title", validated.title);
      formData.append("content", validated.content ?? "");
      formData.append("meta_description", validated.meta_description ?? "");
      formData.append("is_active", data.is_active ? "1" : "0");

      if (imageFile) {
        formData.append("featured_image", imageFile);
      }
      if (removeImage) {
        formData.append("delete_featured_image", "1");
      }
      if (isEditMode) {
        formData.append("_method", "PUT");
      }

      await onSubmit(formData);
      onCloseModal();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const yupErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) yupErrors[error.path] = error.message;
        });
        setErrors(yupErrors);
      } else if (err instanceof AxiosError && err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const getErrorMessage = (error: string | string[] | undefined) => {
    if (Array.isArray(error)) return error[0];
    return error;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={data.title}
            onChange={handleChange}
            placeholder="e.g. About"
          />
          {initialData?.slug && (
            <p className="text-xs text-muted-foreground">
              Slug: <span className="font-mono">{initialData.slug}</span> (used
              in the URL, generated from the title)
            </p>
          )}
          {!isEditMode && (
            <p className="text-xs text-muted-foreground">
              Tip: title “About” produces the <span className="font-mono">about</span>{" "}
              page the storefront looks for.
            </p>
          )}
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.title)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content (HTML allowed)</Label>
          <Textarea
            id="content"
            name="content"
            value={data.content}
            onChange={handleChange}
            placeholder="<p>Your page content…</p>"
            rows={10}
          />
          {errors.content && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.content)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta_description">Meta description (SEO)</Label>
          <Textarea
            id="meta_description"
            name="meta_description"
            value={data.meta_description}
            onChange={handleChange}
            placeholder="Short summary shown in search results"
            rows={2}
            className="resize-none"
          />
          {errors.meta_description && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.meta_description)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured_image">Featured image</Label>
          {initialData?.featured_image && !removeImage && (
            <div className="mb-2">
              <img
                src={initialData.featured_image}
                alt={initialData.title}
                className="h-28 w-full max-w-sm object-cover rounded-md border"
              />
            </div>
          )}
          <Input
            id="featured_image"
            name="featured_image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WEBP, up to 2MB.
          </p>
          {initialData?.featured_image && (
            <label className="flex items-center gap-2 text-sm mt-1">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={(e) => setRemoveImage(e.target.checked)}
              />
              Remove current image
            </label>
          )}
          {errors.featured_image && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.featured_image)}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.is_active}
            onChange={(e) =>
              setData((prev) => ({ ...prev, is_active: e.target.checked }))
            }
          />
          Active (published)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCloseModal}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
              ? "Update Page"
              : "Add Page"}
        </Button>
      </div>
    </form>
  );
};
