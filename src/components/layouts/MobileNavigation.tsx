import { Link, useLocation } from "react-router-dom";
import {
  ChartArea,
  FileText,
  ClipboardList,

  Package,
  Warehouse,
  BriefcaseBusiness,
} from "lucide-react";
import { cn } from "../../lib/utils";

import { useIsMobile } from "../../hooks/use-mobile";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { UserRole } from "../../constants/user-roles";

const MobileNavigation = () => {
  const location = useLocation();
  const { user, userRoles, userPermissions } = useSelector(
    (state: RootState) => state.auth
  );

  const isMobile = useIsMobile();

  const navItems = [
    { name: "Products", path: "/products", icon: Package, badge: 0 },
    { name: "Inventory", path: "/inventory", icon: Warehouse, badge: 0 },
    { name: "Chalani", path: "/chalani", icon: BriefcaseBusiness, badge: 0 },
    { name: "Reports", path: "/reports", icon: ChartArea, badge: 0 },
    { name: "Study Materials", path: "/materials", icon: FileText, badge: 0 },
    { name: "Assignments", path: "/assignments", icon: ClipboardList, badge: 0 },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!user || !userRoles || !userPermissions) return false;

    if (userRoles.includes(UserRole.Student)) {
      return [
        "Products",
        "Study Materials",
        "Assignments",
      ].includes(item.name);
    }

    // If SuperAdmin, show all items
    if (userRoles.includes(UserRole.SuperAdmin)) {
      return true;
    }

    // Map navigation item names to permission names
    const permissionMap: { [key: string]: string } = {
      Products: "dashboard:view",
      Inventory: "dashboard:view",

      Chalani: "dashboard:view",
    };

    const permissionName =
      permissionMap[item.name] || `${item.name.toLowerCase()}:view`;

    if (userRoles.includes(UserRole.Admin)) {
      return (
        userPermissions.includes(permissionName) ||
        [
          "dashboard:view",
          "course-class:view",
          "student:view",
          "user:view",
        ].includes(permissionName)
      );
    }

    if (userRoles.includes(UserRole.Staff)) {
      return (
        !["Finance", "Attendance", "Payroll", "Reports"].includes(item.name) &&
        userPermissions.includes(permissionName)
      );
    }

    // For other roles (not Student, SuperAdmin, Admin, or Staff), check specific permissions
    return userPermissions.includes(permissionName);
  });

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path !== "/dashboard" && location.pathname.startsWith(path))
    );
  };

  // Don't render anything if not on mobile
  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-7xl mx-auto px-2">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full px-1 text-muted-foreground transition-all duration-200 ease-in-out",
              isActive(item.path) && "text-coffee"
            )}
          >
            <div className="relative">
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  isActive(item.path) && "text-coffee"
                )}
              />
              {/* ✅ Check if badge exists and is greater than 0 */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 text-[10px] font-medium flex items-center justify-center rounded-full bg-red-500 text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] mt-1 transition-all duration-200",
                isActive(item.path) && "font-semibold text-coffee"
              )}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;