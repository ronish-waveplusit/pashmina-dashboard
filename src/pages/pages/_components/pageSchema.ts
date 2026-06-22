import * as Yup from "yup";

export const pageSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(255, "Title must not exceed 255 characters")
    .trim(),

  content: Yup.string().default(""),

  meta_description: Yup.string()
    .max(500, "Meta description must not exceed 500 characters")
    .default(""),
});
