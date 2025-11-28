import { useSelector } from "react-redux";
import { RootState } from "../../components/store/store";
import { UserRole } from "../../constants/user-roles";

export const useHasPermission = (permission: string): boolean => {
  const { user, userRoles, userPermissions } = useSelector(
    (state: RootState) => state.auth
  );

  if (!user || !userRoles || !userPermissions) return false;
  // SuperAdmin has all permissions
  if (userRoles.includes(UserRole.SuperAdmin)) {
    return true;
  }
  if (userRoles.includes(UserRole.Admin)) {
    return userPermissions.includes(permission) || permission === "course:view";
  }

  if (userRoles.includes(UserRole.Staff)) {
    return userPermissions.includes(permission);
  }

  return userPermissions.includes(permission);
};
