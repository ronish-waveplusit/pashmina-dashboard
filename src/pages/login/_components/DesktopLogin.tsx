import React from "react";
import { useLogin } from "../_hooks/useLogin";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ROUTES } from "../../../routes/url.constants"; // Import ROUTES for navigation


const DesktopLogin: React.FC = () => {
  const {
    handleSubmit,
    onLogin,
    clearErrors,
    errors,
    register,
    isLoginPending,
  } = useLogin();
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle navigation to forgot password page
  const handleForgotPassword = () => {
    navigate(ROUTES.FORGET_PASSWORD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-light p-4">
      <div className="glass max-w-md w-full rounded-2xl overflow-hidden shadow-glass-lg">
        <div className="p-8">
          <div className="flex justify-center  h-[150px]">
            <img
              src="/logo.png"
              alt="Pashmina"
              className="w-full h-full object-contain"
            />
          </div>



          <p className="text-center font-semibold text-xl mb-6">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-primary w-full border"
                required
                placeholder="Enter your email"
                onInput={() => clearErrors("email")}
                {...register("email", { required: true })}
              />
              {errors.email && (
                <p
                  className="text-red-500 text-xs"
                  style={{ marginTop: "6px" }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-primary w-full border"
                required
                placeholder="Enter your password"
                {...register("password", { required: true })}
                onInput={() => clearErrors("password")}
              />
              {errors.password && (
                <p
                  className="text-red-500 text-xs"
                  style={{ marginTop: "6px" }}
                >
                  {errors.password.message}
                </p>
              )}
              {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-sm text-coffee hover:underline focus:outline-none"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="button-primary w-full flex justify-center items-center"
              disabled={isLoginPending}
            >
              {isLoginPending ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesktopLogin;
