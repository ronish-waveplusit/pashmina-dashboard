
/**
 * Represents a single link object in the pagination links array.
 */
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * The core pagination metadata structure returned by your API.
 * This is generic and not tied to any specific data model.
 */
export interface PaginationMeta {
  paginate:1;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  total: number;
  per_page: number;
  links: PaginationLink[]; // You can include this if you use it in the Pagination component
}

/**
 * A generic type for any paginated API response.
 * It takes a type parameter `T` which represents the data model.
 *
 * @example
 * PaginatedResponse<CoursePayload>
 * PaginatedResponse<UserPayload>
 */
export interface PaginatedResponse<T> extends PaginationMeta {
  data: T[];
}