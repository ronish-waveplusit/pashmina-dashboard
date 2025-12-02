// _components/AttributeForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import * as Yup from "yup";
import { AttributePayload } from "../../../types/attribute";
import { AxiosError } from "axios";
import { attributeSchema } from "../_hooks/attributeSchema";

interface AttributeFormProps {
  initialData?: AttributePayload | null;
  onSubmit: (formData: FormData) => Promise<AttributePayload>;
  isSubmitting: boolean;
  onCloseModal: () => void;
}

type FormErrors = Partial<
  Record<keyof Yup.InferType<typeof attributeSchema>, string | string[]>
>;

export const AttributeForm: React.FC<AttributeFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCloseModal,
}) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
  
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form with initialData when editing
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || "",
       
      });
    } else {
      setFormData({ name: ""});
    }
  }, [initialData, isEditMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate with Yup
      await attributeSchema.validate(formData, { abortEarly: false });

      const data = new FormData();
      data.append("name", formData.name.trim());

      // Only send slug if it's not empty (backend usually generates it)
     
      if (isEditMode) {
        data.append("_method", "PUT");
      }

      await onSubmit(data);
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
        // Laravel validation errors
        setErrors(err.response.data.errors);
      } else {
        console.error(err);
        throw err;
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
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Attribute Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Color, Size, Material"
            autoFocus
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.name)}
            </p>
          )}
        </div>

       
       
      </div>

      {/* Action Buttons */}
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
              : "Creating..."
            : isEditMode
            ? "Update Attribute"
            : "Create Attribute"}
        </Button>
      </div>
    </form>
  );
};