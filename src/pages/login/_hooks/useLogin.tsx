// useLogin.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "../../../components/ui/use-toast";
import { yupResolver } from "@hookform/resolvers/yup";
// import { useNavigate } from "react-router-dom";

import { userLogin } from "../../../api/auth";
import { loginSuccess } from "../../../components/store/auth/authSlice";
import { useAuth } from "../../../components/context/AuthContext";
import { LoginSchema } from "../_components/LoginSchema";
// import { ROUTES } from "../../../routes/url.constants";

interface LoginPayload {
  email: string;
  password: string;
}

export function useLogin() {
  // const navigate = useNavigate();
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

// In useLogin.tsx
// In useLogin.tsx
const onLogin = async (payload: LoginPayload) => {
  try {
    setIsLoginPending(true);
    const loginResponse = await userLogin(payload);
    console.log("Login Response:", loginResponse);
    
    if (loginResponse?.message === "SUCCESS") {
      // Create auth data matching the TokenData interface
      const authData = {
        accessToken: loginResponse.token, // Your API returns 'token' not 'accessToken'
        refreshToken: loginResponse.refreshToken || "",
        refreshTokenExp: loginResponse.refreshTokenExpiry || "", // Can be empty string if not provided
        user: loginResponse.user,
        groups: loginResponse.groups,
        permissions: loginResponse.permissions,
      };
      
      console.log("🔐 Calling login with:", authData);
      
      // This calls AuthContext.login() which calls setTokens()
      login(authData);
      dispatch(loginSuccess(authData));

      toast({
        title: "Success",
        description: "Logged In Successfully.",
        variant: "default",
      });
      
      // Don't navigate here - AuthContext.login() handles it
    } else {
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
    console.error("Login error:", e);
    toast({
      title: "Error",
      description: "An unexpected error occurred during login. Please try again later.",
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