import * as Yup from "yup";

export const bannerSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(255, "Title must not exceed 255 characters")
    .trim(),

  banner_text_1: Yup.string()
    .max(500, "Subtitle must not exceed 500 characters")
    .default(""),

  banner_text_2: Yup.string()
    .max(500, "Secondary text must not exceed 500 characters")
    .default(""),

  link_url: Yup.string()
    .max(500, "Link must not exceed 500 characters")
    .default(""),

  order_column: Yup.number()
    .typeError("Order must be a number")
    .integer("Order must be a whole number")
    .min(0, "Order cannot be negative")
    .default(0),
});
