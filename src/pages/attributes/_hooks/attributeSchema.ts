// _hooks/attributeSchema.ts
import * as Yup from "yup";

export const attributeSchema = Yup.object().shape({
  name: Yup.string()
    .required("Attribute name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  slug: Yup.string()
    .optional()
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and hyphen-separated (e.g., shoe-size)"
    )
    .max(100, "Slug cannot exceed 100 characters"),
});

export const attributeValueSchema = Yup.object().shape({
  attribute_id: Yup.string().required("Attribute is required"),
  value: Yup.string()
    .required("Value is required")
    .min(1, "Value must be at least 1 character")
    .max(100, "Value must not exceed 100 characters")
    .trim(),
});