import React, { useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useIsMobile } from "../../hooks/use-mobile";
import { Coffee, X, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

import { UserRole } from "../../constants/user-roles";
import { NAV_GROUPS } from "../../constants/navConstants";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// Store scroll position outside component to persist across re-renders
let sidebarScrollPosition = 0;

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, userRoles, userPermissions } = useSelector(
    (state: RootState) => state.auth
  );
 
  const themeName = "Barista";
  const themeLogo =  null;
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null); // Ref for the nav container

  // Save scroll position whenever it changes
  const saveScrollPosition = useCallback(() => {
    if (navRef.current) {
      sidebarScrollPosition = navRef.current.scrollTop;
    }
  }, []);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    if (navRef.current) {
      navRef.current.scrollTop = sidebarScrollPosition;
    }
  }, []);

  // Store scroll position before navigation
  const handleLinkClick = useCallback(() => {
    saveScrollPosition();
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen, saveScrollPosition]);

  // Save scroll position on scroll
  useEffect(() => {
    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener("scroll", saveScrollPosition);
      return () => {
        navElement.removeEventListener("scroll", saveScrollPosition);
      };
    }
  }, [saveScrollPosition]);

  // Restore scroll position after component mounts and on route changes
  useEffect(() => {
    const timer = setTimeout(restoreScrollPosition, 0);
    return () => clearTimeout(timer);
  }, [location.pathname, restoreScrollPosition]);

  // Also restore on sidebar open/close
  useEffect(() => {
    if (sidebarOpen) {
      const timer = setTimeout(restoreScrollPosition, 100);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen, restoreScrollPosition]);

 

  const filteredNavGroups = NAV_GROUPS.map((group) => {
    // SuperAdmin sees all navigation items without permission filtering
    if (userRoles?.includes(UserRole.SuperAdmin)) {
      const excluded = ["Study Materials", "Assignments"];
      const superAdminItems = group.items.filter(
        (item) => !excluded.includes(item.name)
      );
      return { ...group, items: superAdminItems };
    }

    // Filter navigation items based on userPermissions for non-SuperAdmin users
    const filteredItems = group.items.filter((item) => {
      if (!user || !userPermissions) return false;

      const permissionMap: { [key: string]: string } = {
        Dashboard: "dashboard:view",
        Users: "user:view",
        Instructors: "user:view",
        Students: "student:view",
        Enquiries: "enquiry:view",
        Contact: "lead:view",
        Reminders: "notifications:view",
        "Course Enrollments": "enrollment:view",
        Courses: "course:view",
        Classes: "course-class:view",
        Batches: "batch:view",
        Attendance: "attendance:view",
        Referrers: "referer:view",
        POS: "pos:view",
        Products: "product:view",
        // Items: "item:view",
        // Vendors: "item:view",
        // Purchase: "item:view",
        // "Inventory Report": "item:view",
        Finance: "transaction:create",
        Payroll: "payroll:view",
        Shifts: "shift:view",
        Reports: "report:view",
        "Staff Report": "report:view",
        Documents: "document:view",
        Sources: "source:view",
        CourseCategory: "course-category:view",
        Narrations: "narration:view",
        "Transaction Category": "transaction-category:view",
        "Content Pages": "content:view",
        "Menu Management": "menu:view",
        Blog: "blog:view",
        Comments: "comment:view",
        Settings: "setting:view",
        Support: "support:view",
        "Study Materials": "student-course:view",
        Assignments: "student-assignment:view",
        Permissions: "permission:view",
      };

      const permissionName =
        permissionMap[item.name] || `${item.name.toLowerCase()}:view`;

      return userPermissions.includes(permissionName);
    });

    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "w-64 bg-white border-r  shadow-sm flex flex-col transition-transform duration-300 ease-in-out",
        "fixed top-0 left-0 h-screen z-40",
        isMobile && !sidebarOpen && "-translate-x-full"
      )}
    >
      <div className="p-6 flex items-center justify-between border-b shrink-0">
        <div className="flex items-center space-x-2">
          {themeLogo ? (
            <img
              src={themeLogo}
              alt={`${themeName} Logo`}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
               
              }}
            />
          ) : null}
          <Coffee
            className={cn("h-8 w-8 text-coffee", themeLogo && "hidden")}
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight leading-none text-coffee-dark">
              {themeName}
            </h1>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav
        ref={navRef}
        className="flex-1 p-4 overflow-y-auto"
        style={{ scrollBehavior: "auto" }}
      >
        {filteredNavGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h2 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const normalizedPathname = location.pathname.endsWith("/")
                  ? location.pathname.slice(0, -1)
                  : location.pathname;
                const normalizedItemPath = item.path.endsWith("/")
                  ? item.path.slice(0, -1)
                  : item.path;

                const isActive =
                  normalizedPathname === normalizedItemPath ||
                  (normalizedItemPath === "/dashboard" &&
                    normalizedPathname === "") ||
                  (normalizedItemPath !== "/dashboard" &&
                    normalizedItemPath !== "" &&
                    normalizedPathname.startsWith(normalizedItemPath));

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={handleLinkClick}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="flex-1">{item.name}</span>
                      
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userRoles?.join(", ").replace("_", " ") || ""}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
