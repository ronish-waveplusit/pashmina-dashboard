export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
  page: number | null;
}

/**
 * The core pagination metadata structure returned by your API.
 * This is generic and not tied to any specific data model.
 */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  total: number;
  per_page: number;
  path: string;
  links: PaginationLink[];
}

/**
 * Pagination links object (first, last, next, prev URLs)
 */
export interface PaginationLinks {
  first: string;
  last: string;
  next: string | null;
  prev: string | null;
}

/**
 * A generic type for any paginated API response.
 * It takes a type parameter `T` which represents the data model.
 *
 * @example
 * PaginatedResponse<CoursePayload>
 * PaginatedResponse<UserPayload>
 */
export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}