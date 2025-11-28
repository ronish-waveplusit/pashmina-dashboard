import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store/store"; // Define store types
import { UserRole } from "../constants/user-roles";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
}

const AuthGuard = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
}: AuthGuardProps) => {
  const { isAuthenticated, user, userRoles, userPermissions, isChecking } =
    useSelector((state: RootState) => state.auth); // Select only the auth slice

  const location = useLocation();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Skip role and permission checks for SuperAdmin
  if (userRoles.includes(UserRole.SuperAdmin)) {
    return <>{children}</>;
  }

  // Check role-based access if roles are specified
  if (
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.some((role) => userRoles.includes(role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission-based access if permissions are specified
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );
    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
