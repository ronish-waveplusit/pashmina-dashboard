// useLogin.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "../../../components/ui/use-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";

import { userLogin } from "../../../api/auth";
import { loginSuccess } from "../../../components/store/auth/authSlice";
import { useAuth } from "../../../components/context/AuthContext";
import { LoginSchema } from "../_components/LoginSchema";
import { ROUTES } from "../../../routes/url.constants";

interface LoginPayload {
  email: string;
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const [isLoginPending, setIsLoginPending] = useState(false);
  const dispatch = useDispatch();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(LoginSchema()),
    reValidateMode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (payload: LoginPayload) => {
    try {
      setIsLoginPending(true);
      const loginResponse = await userLogin(payload);

      if (loginResponse?.message === "SUCCESS") {
        // Handle successful login
        login(loginResponse.data);
        dispatch(loginSuccess(loginResponse.data));

        toast({
          title: "Success",
          description: "Logged In Successfully.",
          variant: "default",
        });
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        // Handle API error response (e.g., { message: "FAILED", errors: "Invalid credentials" })
        const errorMessage =
          loginResponse?.errors ||
          loginResponse?.message ||
          "Invalid email or password.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (e) {
      // Handle unexpected errors (should be rare with updated userLogin)
      toast({
        title: "Error",
        description:
          "An unexpected error occurred during login. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoginPending(false);
    }
  };

  return {
    register,
    handleSubmit,
    onLogin,
    clearErrors,
    errors,
    isLoginPending,
  };
}