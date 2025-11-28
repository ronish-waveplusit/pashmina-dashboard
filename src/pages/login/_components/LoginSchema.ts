import * as yup from "yup";

export const LoginSchema = () =>
  yup.object({
    email: yup.string().required("Required"),
    password: yup.string().min(6).required("Required"),
  });
