// attributeSchema.ts
import * as Yup from "yup";

export const attributeValueSchema = Yup.object().shape({
  attribute_id: Yup.string()
    .required("Please select an attribute")
    .matches(/^\d+$/, "Invalid attribute selected")
    .test("is-valid-id", "Please select a valid attribute", (value) => {
      const num = Number(value);
      return !isNaN(num) && num > 0;
    }),

  value: Yup.string()
    .required("Value is required")
    .min(1, "Value cannot be empty")
    .max(100, "Value must not exceed 100 characters")
    .trim(),
});