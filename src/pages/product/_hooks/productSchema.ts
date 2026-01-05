import * as yup from "yup";

// Base schema for common fields
const baseProductSchema = {
  name: yup
    .string()
    .required("Product name is required")
    .min(3, "Product name must be at least 3 characters")
    .max(255, "Product name must not exceed 255 characters"),
  
  code: yup
    .string()
    .required("Product code is required")
    .min(2, "Product code must be at least 2 characters")
    .max(50, "Product code must not exceed 50 characters")
    .matches(/^[A-Z0-9-_]+$/i, "Product code can only contain letters, numbers, hyphens and underscores"),
  
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  
  composition: yup
    .string()
    .max(255, "Composition must not exceed 255 characters")
    .optional()
    .nullable(),
  
  excerpt: yup
    .string()
    .max(500, "Excerpt must not exceed 500 characters")
    .optional()
    .nullable(),
  
  status: yup
    .string()
    .oneOf(["active", "inactive"], "Invalid status")
    .required("Status is required"),
  
  category_id: yup
    .array()
    .of(yup.number())
    .min(1, "At least one category is required")
    .required("Category is required"),
};

// Color product validation schema
export const colorProductSchema = yup.object().shape({
  ...baseProductSchema,
  
  variation_type: yup
    .string()
    .oneOf(["color"], "Invalid variation type")
    .required(),
  
  price: yup
    .string()
    .required("Price is required")
    .test("is-valid-price", "Price must be a valid number greater than 0", (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }),
  
  sale_price: yup
    .string()
    .required("Sale price is required")
    .test("is-valid-sale-price", "Sale price must be a valid number", (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    })
    .test("is-less-than-price", "Sale price must be less than or equal to regular price", function(value) {
      const { price } = this.parent;
      if (!value || !price) return true;
      return parseFloat(value) <= parseFloat(price);
    }),
  
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .integer("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  
  low_stock_threshold: yup
    .number()
    .typeError("Low stock threshold must be a number")
    .required("Low stock threshold is required")
    .integer("Low stock threshold must be a whole number")
    .min(0, "Low stock threshold cannot be negative")
    .max(1000, "Low stock threshold seems too high"),
});

// Size/Color product validation schema
export const sizeColorProductSchema = yup.object().shape({
  ...baseProductSchema,
  
  variation_type: yup
    .string()
    .oneOf(["size_color"], "Invalid variation type")
    .required(),
  
//   attributes: yup
//     .array()
//     .of(
//       yup.object().shape({
//         attribute_id: yup
//           .number()
//           .required("Attribute ID is required")
//           .positive("Attribute ID must be positive"),
        
//         attribute_value_ids: yup
//           .array()
//           .of(yup.number().positive())
//           .min(1, "At least one attribute value is required")
//           .required("Attribute values are required"),
//       })
//     )
//     .min(1, "At least one attribute is required")
//     .required("Attributes are required"),
  
//   variations: yup
//     .array()
//     .of(
//       yup.object().shape({
//         id: yup.number().optional(),
        
//         sku: yup
//           .string()
//           .required("SKU is required")
//           .min(2, "SKU must be at least 2 characters")
//           .max(100, "SKU must not exceed 100 characters"),
        
//         price: yup
//           .string()
//           .required("Price is required")
//           .test("is-valid-price", "Price must be a valid number greater than 0", (value) => {
//             if (!value) return false;
//             const num = parseFloat(value);
//             return !isNaN(num) && num > 0;
//           }),
        
//         sale_price: yup
//           .string()
//           .required("Sale price is required")
//           .test("is-valid-sale-price", "Sale price must be a valid number", (value) => {
//             if (!value) return false;
//             const num = parseFloat(value);
//             return !isNaN(num) && num >= 0;
//           })
//           .test("is-less-than-price", "Sale price must be less than or equal to regular price", function(value) {
//             const { price } = this.parent;
//             if (!value || !price) return true;
//             return parseFloat(value) <= parseFloat(price);
//           }),
        
//         quantity: yup
//           .number()
//           .typeError("Quantity must be a number")
//           .required("Quantity is required")
//           .integer("Quantity must be a whole number")
//           .min(0, "Quantity cannot be negative"),
        
//         low_stock_threshold: yup
//           .number()
//           .typeError("Low stock threshold must be a number")
//           .required("Low stock threshold is required")
//           .integer("Low stock threshold must be a whole number")
//           .min(0, "Low stock threshold cannot be negative")
//           .max(1000, "Low stock threshold seems too high"),
        
//         status: yup
//           .string()
//           .oneOf(["active", "inactive"], "Invalid status")
//           .required("Status is required"),
        
//         attributes: yup
//           .array()
//           .of(
//             yup.object().shape({
//               attribute_id: yup.number().required(),
//               attribute_value_id: yup.number().required(),
//             })
//           )
//           .min(1, "Variation must have at least one attribute")
//           .required("Variation attributes are required"),
//       })
//     )
//     .min(1, "At least one variation is required")
//     .required("Variations are required")
//     .test("unique-variations", "Duplicate variations are not allowed", function(variations) {
//       if (!variations || variations.length === 0) return true;
      
//       const seen = new Set();
//       for (const variation of variations) {
//         const key = variation.attributes
//           ?.map(attr => `${attr.attribute_id}:${attr.attribute_value_id}`)
//           .sort()
//           .join("|");
        
//         if (seen.has(key)) {
//           return this.createError({
//             message: "You have duplicate variations with the same attribute combinations",
//             path: this.path,
//           });
//         }
//         seen.add(key);
//       }
//       return true;
//     }),
});

// Combined validation schema that validates based on variation type
export const productSchema = yup.lazy((value: any) => {
  if (value.variation_type === "color") {
    return colorProductSchema;
  }
  return sizeColorProductSchema;
});

// Helper function to format validation errors for display
export const formatValidationErrors = (error: yup.ValidationError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  
  if (error.inner && error.inner.length > 0) {
    error.inner.forEach((err) => {
      if (err.path) {
        if (!errors[err.path]) {
          errors[err.path] = [];
        }
        errors[err.path].push(err.message);
      }
    });
  } else if (error.path && error.message) {
    errors[error.path] = [error.message];
  }
  
  return errors;
};

// Helper function to validate form data
export const validateProductForm = async (
  data: any
): Promise<{ isValid: boolean; errors: Record<string, string[]> }> => {
  try {
    await productSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: formatValidationErrors(error),
      };
    }
    return {
      isValid: false,
      errors: { general: ["An unexpected validation error occurred"] },
    };
  }
};