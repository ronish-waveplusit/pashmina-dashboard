export const apiRoutes = {
  GET_TOKEN_BY_PASSOWORD: "/v1/login",
  //forget password
  GET_FORGET_PASSWORD: "/forget-password",
  //reset password
  GET_RESET_PASSWORD: "/reset-password",
  GET_PRODUCT_CATEGORIES: "/v1/st/categories",
    GET_PRODUCT: "/v1/products",
  //logout
  AUTH_LOGOUT: "/v1/logout",
  //refresh
  REFRESH_TOKEN: "/refresh",
  //instructors
  GET_INSTRUCTORS: "/instructors",
  //instructors
  GET_STUDENT_USER: "/students",
  //course-categories
  GET_COURSE_CATEGORIES: "/co/course-categories",
  //courses
  GET_COURSES: "/co/course",
  //classes
  GET_CLASSES: "/co/batch",
  //enrollments
  GET_ENROLLMENTS: "/en/enroll",
  //inventory categories
  GET_CATEGORIES: "/inven/categories",
  //shifts
  GET_SHIFTS: "co/shift",
  //classes
  GET_BATCHES: "co/batch",
  GET_STUDENTS_BY_BATCH: "en/users-by-batch",
  //students
  GET_STUDENTS: "en/enroll",
  //class shifts
  GET_CLASS_SHIFTS: "/co/batch_shift",
  GET_REFERRALS: "/referer",
  //product
 
  //Stock
  GET_STOCK: "inven/stocks",
  GET_INVOICES: "en/pay",
  // enquiries
  GET_ENQUIRIES: "/enquiry",
  // contacts
  GET_CONTACTS: "/crm/leads",
  //sources
  GET_SOURCE: "/st/sources",
  //narrations
  GET_NARRATIONS: "/st/narrations",
  //search student
  GET_STUDENT_SEARCH: "/students/search",
  GET_STUDENT_SEARCH_BY_EMAIL: "/students/search-email",
  GET_STUDENTS_COURSE: "/en/student-courses",
  //enrollment history
  GET_ENROLLMENT_HISTORY: "/en/enrollment-invoice-payload",
  //attendance
  GET_ATTENDANCE: "/co/attendance",
  GET_ATTENDANCE_STATS: "/co/attendance-analytics",
  CHECK_IN: "/co/attendance/check-in",
  CHECK_OUT: "/co/attendance/check-out",
  BULK_CHECK_IN: "/co/attendance/bulk-check-in",
  BULK_CHECK_OUT: "/co/attendance/bulk-check-out",
  SEARCH_STUDENTS: "/co/students/search",
  //notification
  GET_NOTIFICATION: "notifications",
  //transaction categories
  GET_TRANSACTION_CATEGORIES: "transaction-categories",
  //transactions
  GET_TRANSACTIONS: "transactions",
  GET_PERMISSIONS: "permissions",
  //theme settings
  GET_THEME: "cms/website-settings",
  GET_PUBLIC_THEME: "cms/public/web-settings",
  //Certficate
  GET_CERTIFICATE: "en/certificates",
  //menus
  GET_MENUS: "/v1/menu",
  GET_MENU_ITEMS: "/v1/menuItems",
  GET_MENU_STATS: "/v1/menu-stats",
  GET_MENU_TREE: "/v1/menuTree",
  // Dashboard Analytics Routes
  DASHBOARD_ENROLLMENTS_BY_STATUS: "dashboard/enrollments-by-status",
  DASHBOARD_ENROLLMENT_TRENDS: "dashboard/enrollment-trends",
  DASHBOARD_PAYMENT_STATUS_BREAKDOWN: "dashboard/payment-status-breakdown",
  DASHBOARD_REVENUE_BY_PAYMENT_METHOD: "dashboard/revenue-by-payment-method",
  DASHBOARD_INQUIRY_CONVERSION_RATE: "dashboard/inquiry-conversion-rate",
  DASHBOARD_OVERDUE_PAYMENTS: "dashboard/overdue-payments",
  DASHBOARD_TOP_COURSES: "dashboard/top-courses",
  DASHBOARD_FOLLOWUP_SUMMARY: "dashboard/followup-summary",
  DASHBOARD_DISCOUNTED_ENROLLMENTS: "dashboard/discounted-enrollments",
  //Inventory Management
  GET_ITEMS: "/inven/items",
  GET_VENDORS: "/inven/vendors",
  GET_PURCHASES: "/inven/purchases",
  INVENTORY_REPORT: "/inventory-report",
  EXPORT_INVENTORY_REPORT: "/inventory-report/export",
  //study materials
  GET_STUDY_MATERIALS: "/co/course",
  //branches
  GET_BRANCH: "/st/branches",
  GET_AUTH_USER_CHILDREN_BRANCH: "/st/auth-user-children-branches",
  //staff reports
  REPORTS_STAFF_SUMMARY: "/reports/staff/summary",
  REPORTS_STAFF_LEADS: "/reports/staff/leads",
  REPORTS_STAFF_ENQUIRIES: "/reports/staff/enquiries",
  REPORTS_STAFF_ENROLLMENTS: "/reports/staff/enrollments",
  REPORTS_STAFF_FOLLOWUPS: "/reports/staff/followups",
  // Export Students to Excel
  EXPORT_STUDENTS: "/export-students",
};
