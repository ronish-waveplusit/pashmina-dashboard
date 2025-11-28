import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import * as Yup from "yup";
import { AttributePayload, AttributeValuePayload } from "../../../types/attribute";
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
  selectedAttribute?: AttributePayload | null;
  attributes: AttributePayload[];
  onSubmit: (formData: FormData) => Promise<AttributeValuePayload>;
  isSubmitting: boolean;
  onCloseModal: () => void;
}

type FormErrors = Partial<
  Record<keyof Yup.InferType<typeof attributeValueSchema>, string | string[]>
>;

export const AttributeValueForm: React.FC<AttributeValueFormProps> = ({
  initialData,
  selectedAttribute,
  attributes,
  onSubmit,
  isSubmitting,
  onCloseModal,
}) => {
  const isEditMode = !!initialData;

  const [valueData, setValueData] = useState({
    attribute_id: "",
    value: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEditMode && initialData) {
      setValueData({
        attribute_id: initialData.attribute_id.toString(),
        value: initialData.value || "",
      });
    } else if (selectedAttribute) {
      setValueData({
        attribute_id: selectedAttribute.id.toString(),
        value: "",
      });
    }
  }, [initialData, selectedAttribute, isEditMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setValueData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
    setValueData((prev) => ({
      ...prev,
      attribute_id: value,
    }));

    if (errors.attribute_id) {
      setErrors((prev) => ({ ...prev, attribute_id: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await attributeValueSchema.validate(valueData, {
        abortEarly: false,
      });

      const formData = new FormData();
      formData.append("attribute_id", valueData.attribute_id);
      formData.append("value", valueData.value.trim());

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Attribute Selection Field */}
        <div className="space-y-2">
          <Label htmlFor="attribute_id">
            Attribute <span className="text-red-500">*</span>
          </Label>
          <Select
            value={valueData.attribute_id}
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

        {/* Value Field */}
        <div className="space-y-2">
          <Label htmlFor="value">
            Value <span className="text-red-500">*</span>
          </Label>
          <Input
            id="value"
            name="value"
            value={valueData.value}
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