import * as Yup from "yup";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .trim(),
  
  parent_id: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "is-valid-id",
      "Invalid parent category selected",
      function (value) {
        // Allow empty/null values (optional field)
        if (!value || value === "" || value === "none") {
          return true;
        }
        // Ensure it's a valid number or numeric string
        return !isNaN(Number(value));
      }
    ),
  
  featured_image: Yup.mixed()
    .nullable()
    .notRequired()
    .test(
      "fileSize",
      "Image size must be less than 5MB",
      function (value) {
        // If no file is selected, validation passes
        if (!value) return true;
        
        // Check if it's a File object
        if (value instanceof File) {
          return value.size <= MAX_FILE_SIZE;
        }
        
        return true;
      }
    )
    .test(
      "fileFormat",
      "Unsupported image format. Please use JPEG, PNG, GIF, or WEBP",
      function (value) {
        // If no file is selected, validation passes
        if (!value) return true;
        
        // Check if it's a File object
        if (value instanceof File) {
          return SUPPORTED_IMAGE_FORMATS.includes(value.type);
        }
        
        return true;
      }
    ),
  
  remove_featured_image: Yup.string()
    .nullable()
    .notRequired()
    .oneOf(["1", null], "Invalid remove image flag"),
});