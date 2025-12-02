// _components/AttributeValueForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import * as Yup from "yup";
import { AttributeValuePayload, AttributeWithValues } from "../../../types/attribute";
import { AxiosError } from "axios";
import { attributeValueSchema } from "../_hooks/attributeSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface AttributeValueFormProps {
  initialData?: AttributeValuePayload | null;
  selectedAttribute?: AttributeWithValues | null;
  attributes: AttributeWithValues[];
  onSubmit: (formData: FormData) => Promise<AttributeValuePayload>;
  isSubmitting: boolean;
  onCloseModal: () => void;
}

export const AttributeValueForm: React.FC<AttributeValueFormProps> = ({
  initialData,
  selectedAttribute,
  attributes,
  onSubmit,
  isSubmitting,
  onCloseModal,
}) => {
  const isEditMode = !!initialData;

  // Keep internal state as "value" for simplicity in form
  const [formData, setFormData] = useState({
    attribute_id: "",
    value: "", // this is what user types → will be sent as "name"
  });

  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  // Sync initial data (API uses "name", we use "value" internally)
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        attribute_id: initialData.attribute_id.toString(),
        value: initialData.name || "", // ← API returns "name"
      });
    } else if (selectedAttribute) {
      setFormData({
        attribute_id: selectedAttribute.id.toString(),
        value: "",
      });
    }
  }, [initialData, selectedAttribute, isEditMode]);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));

  // Remove the error key entirely instead of setting to undefined
  if (errors[name]) {
    setErrors((prev) => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }
};

const handleSelectChange = (value: string) => {
  setFormData((prev) => ({ ...prev, attribute_id: value }));

  if (errors.attribute_id) {
    setErrors((prev) => {
      const { attribute_id: _, ...rest } = prev;
      return rest;
    });
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate using schema (adjust schema to expect "value" or map here)
      await attributeValueSchema.validate(
        {
          attribute_id: formData.attribute_id,
          name: formData.value.trim(), // or rename in schema to "name"
        },
        { abortEarly: false }
      );

      const payload = new FormData();
      payload.append("attribute_id", formData.attribute_id);
      payload.append("name", formData.value.trim()); // ← Send as "name"

      if (isEditMode) {
        payload.append("_method", "PUT");
      }

      await onSubmit(payload);
      onCloseModal();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      } else if (err instanceof AxiosError && err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        console.error("Submission error:", err);
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
        {/* Attribute Selection */}
        <div className="space-y-2">
          <Label htmlFor="attribute_id">
            Attribute <span className="text-red-500">*</span>
          </Label>
          <Select
            key={formData.attribute_id} // fixes pre-select issue
            value={formData.attribute_id}
            onValueChange={handleSelectChange}
            disabled={!!selectedAttribute || isEditMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an attribute" />
            </SelectTrigger>
            <SelectContent>
              {attributes.map((attr) => (
                <SelectItem key={attr.id} value={attr.id.toString()}>
                  {attr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.attribute_id && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.attribute_id)}
            </p>
          )}
        </div>

        {/* Value → displayed as "Value", sent as "name" */}
        <div className="space-y-2">
          <Label htmlFor="value">
            Value <span className="text-red-500">*</span>
          </Label>
          <Input
            id="value"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            placeholder="Enter value (e.g., Red, Large, 5kg)"
          />
          {errors.value && (
            <p className="text-sm text-red-600 mt-1">
              {getErrorMessage(errors.value)}
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
            ? "Update Value"
            : "Add Value"}
        </Button>
      </div>
    </form>
  );
};