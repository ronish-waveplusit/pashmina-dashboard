import { createContext, useEffect, useState, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { authLogout } from "../../api/auth-logout";
import { PUBLIC_ROUTES, ROUTES } from "../../routes/url.constants";
import { getTokens, isSessionExpired, setTokens } from "../../utils/helper/token";

interface AuthContextProps {
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: any) => void;
  logout: () => void;
  handleLogout: (code: string | number | boolean) => void;
  logoutStatus: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  handleLogout: () => {},
  logoutStatus: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [logoutStatus, setLogoutStatus] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { token } = getTokens();
  const isTokensExpired = isSessionExpired();
  const isPublicPath = PUBLIC_ROUTES.includes(location.pathname);

  useEffect(() => {
    if (!token || isTokensExpired) {
      setIsAuthenticated(false);
      setLoading(false);
      if (!isPublicPath) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);

    if (isAuthenticated && isPublicPath) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [
    token,
    isTokensExpired,
    isPublicPath,
    isAuthenticated,
    navigate,
    location.pathname,
  ]);

  const login = (data: any) => {
    setTokens(data);
    setIsAuthenticated(true);
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  const handlePostLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rtk_exp");
    localStorage.removeItem("persist:root");
    localStorage.removeItem("reminders");
    setIsAuthenticated(false);
    setLogoutStatus(false);
    if (!isPublicPath) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  // ✅ Fixed: React Query v5 syntax
  const { mutateAsync: mutateAuthLogout } = useMutation({
    mutationFn: authLogout,
    onSuccess: () => {
      setLoading(false);
      handlePostLogout();
    },
    onMutate: () => {
      setLoading(true);
    },
    onError: () => {
      setLoading(false);
      handlePostLogout();
    },
  });

  const logout = async () => {
    if (!isAuthenticated || isPublicPath) {
      handlePostLogout();
      return;
    }
    try {
      await mutateAuthLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogout = (code: string | number | boolean) => {
    setLogoutStatus(!!code);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
        handleLogout,
        logoutStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};