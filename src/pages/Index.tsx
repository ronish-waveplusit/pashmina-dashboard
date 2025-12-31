import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES, ROUTES } from "../routes/url.constants";
import { useAuth } from "../components/context/AuthContext";

function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logoutStatus } = useAuth();

  useEffect(() => {
    if (loading || logoutStatus) {
      console.log("Waiting for auth check, loading or logout in progress:", {
        loading,
        logoutStatus,
      });
      return;
    }

    console.log("Auth check complete, isAuthenticated:", isAuthenticated);
    // Skip redirect if on a public route
    if (PUBLIC_ROUTES.includes(location.pathname)) {
      console.log("On public route, no redirect.");
      return;
    }
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, isAuthenticated, loading, logoutStatus]);

  return <div />;
}

export default Index;
