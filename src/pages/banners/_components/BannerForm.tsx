import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Loader2 } from "lucide-react";
import * as Yup from "yup";
import { AxiosError } from "axios";
import { Banner } from "../../../types/banner";
import { bannerSchema } from "./bannerSchema";

interface BannerFormProps {
  initialData?: Banner | null;
  onSubmit: (formData: FormData) => Promise<Banner>;
  isSubmitting: boolean;
  onCloseModal: () => void;
}

type FormErrors = Record<string, string | string[] | undefined>;

export const BannerForm: React.FC<BannerFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCloseModal,
}) => {
  const isEditMode = !!initialData;

  const [data, setData] = useState({
    title: initialData?.title ?? "",
    banner_text_1: initialData?.banner_text_1 ?? "",
    banner_text_2: initialData?.banner_text_2 ?? "",
    link_url: initialData?.link_url ?? "",
    order_column: String(initialData?.order_column ?? 0),
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
      const validated = await bannerSchema.validate(data, {
        abortEarly: false,
      });

      const formData = new FormData();
      formData.append("title", validated.title);
      formData.append("banner_text_1", validated.banner_text_1 ?? "");
      formData.append("banner_text_2", validated.banner_text_2 ?? "");
      formData.append("link_url", validated.link_url ?? "");
      formData.append("order_column", String(validated.order_column ?? 0));
      formData.append("is_active", data.is_active ? "1" : "0");

      if (imageFile) {
        formData.append("banner_image", imageFile);
      }
      if (removeImage) {
        formData.append("delete_banner_image", "1");
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
            placeholder="Shown on the CTA button (e.g. Winter Collection)"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.title)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner_text_1">Subtitle</Label>
          <Textarea
            id="banner_text_1"
            name="banner_text_1"
            value={data.banner_text_1}
            onChange={handleChange}
            placeholder="Hero subtitle text"
            rows={2}
            className="resize-none"
          />
          {errors.banner_text_1 && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.banner_text_1)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner_text_2">Secondary text</Label>
          <Textarea
            id="banner_text_2"
            name="banner_text_2"
            value={data.banner_text_2}
            onChange={handleChange}
            placeholder="Optional secondary line"
            rows={2}
            className="resize-none"
          />
          {errors.banner_text_2 && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.banner_text_2)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="link_url">CTA link</Label>
            <Input
              id="link_url"
              name="link_url"
              value={data.link_url}
              onChange={handleChange}
              placeholder="/collection or https://..."
            />
            {errors.link_url && (
              <p className="text-sm text-red-600 mt-1">
                {getErrorMessage(errors.link_url)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_column">Order</Label>
            <Input
              id="order_column"
              name="order_column"
              type="number"
              min={0}
              value={data.order_column}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.order_column && (
              <p className="text-sm text-red-600 mt-1">
                {getErrorMessage(errors.order_column)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner_image">Banner image</Label>
          {initialData?.banner_image && !removeImage && (
            <div className="mb-2">
              <img
                src={initialData.banner_image}
                alt={initialData.title}
                className="h-28 w-full max-w-sm object-cover rounded-md border"
              />
            </div>
          )}
          <Input
            id="banner_image"
            name="banner_image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WEBP, up to 3MB.
          </p>
          {initialData?.banner_image && (
            <label className="flex items-center gap-2 text-sm mt-1">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={(e) => setRemoveImage(e.target.checked)}
              />
              Remove current image
            </label>
          )}
          {errors.banner_image && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.banner_image)}
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
          Active (visible on the storefront)
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
              ? "Update Banner"
              : "Add Banner"}
        </Button>
      </div>
    </form>
  );
};
