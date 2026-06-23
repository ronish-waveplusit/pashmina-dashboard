import * as Yup from "yup";

export const testimonialSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .max(255, "Name must not exceed 255 characters")
    .trim(),
  location: Yup.string()
    .max(255, "Location must not exceed 255 characters")
    .trim(),
  designation: Yup.string()
    .max(255, "Designation must not exceed 255 characters")
    .trim(),
  review: Yup.string()
    .required("Review is required")
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must not exceed 1000 characters")
    .trim(),
  rating: Yup.number()
    .typeError("Rating must be a number")
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .integer("Rating must be a whole number"),
  display_order: Yup.number()
    .typeError("Order must be a number")
    .min(0, "Order cannot be negative")
    .integer("Order must be a whole number"),
});
