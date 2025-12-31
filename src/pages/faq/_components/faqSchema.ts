import * as Yup from "yup";

export const faqSchema = Yup.object().shape({
  question: Yup.string()
    .required("Question is required")
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question must not exceed 500 characters")
    .trim(),
  
  answer: Yup.string()
    .required("Answer is required")
    .min(10, "Answer must be at least 10 characters")
    .max(5000, "Answer must not exceed 5000 characters")
    .trim(),
});