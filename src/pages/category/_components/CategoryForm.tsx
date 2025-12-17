// src/pages/category/_components/CategoryForm.tsx
import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import * as Yup from "yup";
import { CategoryPayload } from "../../../types/category";
import { AxiosError } from "axios";
import { categorySchema } from "./categorySchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface CategoryPayloadFormProps {
  initialData?: CategoryPayload | null;
  onSubmit: (formData: FormData) => Promise<CategoryPayload>;
  isSubmitting: boolean;
  onCloseModal: () => void;
  categories: CategoryPayload[];
  isLoadingCategories?: boolean;
}

type FormErrors = Partial<
  Record<keyof Yup.InferType<typeof categorySchema>, string | string[]>
>;

export const CategoryForm: React.FC<CategoryPayloadFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCloseModal,
  categories,
  isLoadingCategories = false,
}) => {
  const isEditMode = !!initialData;

  // Initialize state directly from initialData (or empty for "Add")
  const [categoryData, setCategoryData] = useState({
    name: initialData?.name ?? "",
    parent_id: initialData?.parent?.id ? String(initialData.parent.id) : "",
  });

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [existingImageUrl] = useState<string | null>(initialData?.featured_image ?? null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.featured_image ?? null
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
    const newParentId = value === "none" ? "" : value;
    setCategoryData((prev) => ({ ...prev, parent_id: newParentId }));
    if (errors.parent_id) {
      setErrors((prev) => ({ ...prev, parent_id: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        featured_image: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)',
      }));
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        featured_image: 'Image size must be less than 2MB',
      }));
      return;
    }

    setFeaturedImage(file);
    setRemoveExistingImage(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (errors.featured_image) {
      setErrors((prev) => ({ ...prev, featured_image: undefined }));
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    if (existingImageUrl) {
      setRemoveExistingImage(true);
    }
    const input = document.getElementById("featured_image") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await categorySchema.validate(
        {
          ...categoryData,
          featured_image: featuredImage,
          remove_featured_image: removeExistingImage ? "1" : null,
        },
        { abortEarly: false }
       );

      const formData = new FormData();
      formData.append("name", categoryData.name);
      if (categoryData.parent_id) {
        formData.append("parent_id", categoryData.parent_id);
      }
      if (featuredImage) {
        formData.append("featured_image", featuredImage);
      }
      if (removeExistingImage && !featuredImage) {
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
          if (error.path) {
            yupErrors[error.path as keyof FormErrors] = error.message;
          }
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

  const availableParentCategories = categories.filter(
    (cat) => !isEditMode || cat.id !== initialData?.id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={categoryData.name}
            onChange={handleInputChange}
            placeholder="Enter category name"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors.name)}</p>
          )}
        </div>

        {/* Parent Category */}
        <div className="space-y-2">
          <Label htmlFor="parent_id">Parent Category</Label>
          <Select
            value={categoryData.parent_id || "none"}
            onValueChange={handleSelectChange}
            disabled={isLoadingCategories}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select parent category (optional)"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Top Level)</SelectItem>
              {availableParentCategories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parent_id && (
            <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors.parent_id)}</p>
          )}
        </div>

        {/* Featured Image */}
        <div className="space-y-2">
          <Label htmlFor="featured_image">Featured Image</Label>

          {imagePreview && (
            <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!imagePreview && (
            <div className="relative">
              <Input
                id="featured_image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <Label
                htmlFor="featured_image"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF, WEBP (max 5MB)
                  </p>
                </div>
              </Label>
            </div>
          )}

          {errors.featured_image && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.featured_image)}
            </p>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCloseModal} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
            ? "Update Category"
            : "Add Category"}
        </Button>
      </div>
    </form>
  );
};