import React, { useState, useEffect } from "react";
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
  isModalOpen: boolean;
  onCloseModal: () => void;
  categories: CategoryPayload[]; // All categories for parent selection
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
}) => {
  const isEditMode = !!initialData;

  const [categoryData, setCategoryData] = useState({
    name: "",
    parent_category_id: "" as string | number,
  });

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEditMode && initialData) {
      setCategoryData({
        name: initialData.name || "",
        parent_category_id: initialData.parent_category_id || "",
      });
      
      if (initialData.featured_image) {
        setExistingImageUrl(initialData.featured_image);
        setImagePreview(initialData.featured_image);
      }
    }
  }, [initialData, isEditMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setCategoryData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
    setCategoryData((prev) => ({ 
      ...prev, 
      parent_category_id: value === "none" ? "" : value 
    }));
    
    if (errors.parent_category_id) {
      setErrors((prev) => ({ ...prev, parent_category_id: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ 
          ...prev, 
          featured_image: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)' 
        }));
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors((prev) => ({ 
          ...prev, 
          featured_image: 'Image size must be less than 5MB' 
        }));
        return;
      }

      setFeaturedImage(file);
      setRemoveExistingImage(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (errors.featured_image) {
        setErrors((prev) => ({ ...prev, featured_image: undefined }));
      }
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    
    if (existingImageUrl) {
      setRemoveExistingImage(true);
    }
    
    // Reset file input
    const fileInput = document.getElementById('featured_image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await categorySchema.validate({
        ...categoryData,
        featured_image: featuredImage,
        remove_featured_image: removeExistingImage ? "1" : null,
      }, {
        abortEarly: false,
      });

      const formData = new FormData();
      formData.append("name", categoryData.name);
      
      if (categoryData.parent_category_id) {
        formData.append("parent_category_id", categoryData.parent_category_id.toString());
      }

      // Add featured image if a new one is selected
      if (featuredImage) {
        formData.append("featured_image", featuredImage);
      }

      // Add remove flag if existing image should be removed
      if (removeExistingImage && !featuredImage) {
        formData.append("remove_featured_image", "1");
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
      } else {
        throw err;
      }
    }
  };

  const getErrorMessage = (error: string | string[] | undefined) => {
    if (Array.isArray(error)) return error[0];
    return error;
  };

  // Filter out the current category from parent options to prevent circular references
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
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.name)}
            </p>
          )}
        </div>

        {/* Parent Category Field */}
        <div className="space-y-2">
          <Label htmlFor="parent_category_id">Parent Category</Label>
          <Select
            value={categoryData.parent_category_id?.toString() || "none"}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Top Level)</SelectItem>
              {availableParentCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parent_category_id && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.parent_category_id)}
            </p>
          )}
        </div>

        {/* Featured Image Field */}
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
                name="featured_image"
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
                  <p className="text-sm text-muted-foreground">
                    Click to upload image
                  </p>
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
            ? "Update Category"
            : "Add Category"}
        </Button>
      </div>
    </form>
  );
};