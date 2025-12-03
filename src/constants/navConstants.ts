import {
  Home,
  UserCog,
  Users,
  BookOpen,
 
  DollarSign,
  Landmark,
  MessageSquare,
  File,
  Award,
  Settings,
  HelpCircle,
  BarChart2,
  PhoneIncoming,
  CirclePlusIcon,
  User,
 
  FileText,
  ClipboardList,
  Shield,
  BarChart3,
  
  Package,
 
  SlidersHorizontal,
  Tags,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    title: "Main",
    items: [{ name: "Dashboard", path: "/dashboard", icon: Home }],
  },
  {
    title: "Product Management",
    items: [
      { name: "Products", path: "/product-form", icon: Package },
      { name: "Categories", path: "/category", icon: Tags },
      // { name: "Reminders", path: "/reminders", icon: Bell },
      {
        name: "Attributes",
        path: "/attributes",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    title: "Education",
    items: [
      { name: "Courses", path: "/courses", icon: BookOpen },
      { name: "Batches", path: "/batches", icon: Users },

      { name: "Instructors", path: "/instructors", icon: Landmark },
      { name: "Students", path: "/students", icon: User },
      { name: "Attendance", path: "/attendance", icon: File },
      { name: "Study Materials", path: "/materials", icon: FileText },
      { name: "Assignments", path: "/assignments", icon: ClipboardList },
      // { name: "POS", path: "/pos", icon: Calendar },
    ],
  },
  {
    title: "User Management",
    items: [
      { name: "Users", path: "/users", icon: UserCog },
      { name: "Permissions", path: "/permissions", icon: Shield },
    ],
  },
  {
    title: "Administration",
    items: [
      // { name: "Products", path: "/products", icon: Package },
      // { name: "Items", path: "/items", icon: Package },
      { name: "Finance", path: "/finance", icon: DollarSign },
      // { name: "Payroll", path: "/payroll", icon: Landmark },
      { name: "Reports", path: "/reports", icon: BarChart2 },
      { name: "Staff Report", path: "/staff-reports", icon: BarChart3 },
    ],
  },
  // {
  //   title: "Inventory Management",
  //   items: [
  //     { name: "Items", path: "/items", icon: FileImage },
  //     { name: "Vendors", path: "/vendors", icon: MessageSquare },
  //     { name: "Purchase", path: "/purchases", icon: MenuSquare },
  //     { name: "Inventory Report", path: "/inventory-reports", icon: Newspaper },
  //   ],
  // },
  // {
  //   title: "Website Management",
  //   items: [
  //     { name: "Content Pages", path: "/content-management", icon: FileImage },
  //     { name: "Menu Management", path: "/menu-management", icon: MenuSquare },
  //     { name: "Blog", path: "/blog-management", icon: Newspaper },
  //     { name: "Comments", path: "/comments-management", icon: MessageSquare },
  //   ],
  // },
  {
    title: "System",
    items: [
      { name: "Settings", path: "/settings", icon: Settings },
      { name: "Referrers", path: "/referrals", icon: Award },
      { name: "CourseCategory", path: "/course-categories", icon: HelpCircle },
      { name: "Sources", path: "/sources", icon: PhoneIncoming },
      { name: "Narrations", path: "/narrations", icon: MessageSquare },
      {
        name: "Transaction Category",
        path: "/transaction-category",
        icon: CirclePlusIcon,
      },
    ],
  },
];
