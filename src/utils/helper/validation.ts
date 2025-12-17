/**
 * Format field names to be more readable
 * Examples:
 * - "category_id" -> "Category Id"
 * - "variations.0.price" -> "Variations > #1 > Price"
 * - "sale_price" -> "Sale Price"
 */
export const formatFieldName = (field: string): string => {
  return field
    .split('.')
    .map(part => {
      // Handle array indices
      if (!isNaN(Number(part))) {
        return `#${parseInt(part) + 1}`;
      }
      // Convert snake_case to Title Case
      return part
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    })
    .join(' > ');
};

/**
 * Clean error message by removing redundant field name prefixes
 */
export const cleanErrorMessage = (field: string, message: string): string => {
  return message
    .replace(new RegExp(`^The ${field}\\s+field\\s+`, 'i'), '')
    .replace(new RegExp(`^The ${field}\\s+`, 'i'), '');
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (
  errors: Record<string, string[]>,
  fieldPath: string
): string[] | undefined => {
  return errors[fieldPath];
};

/**
 * Check if a field has errors
 */
export const hasFieldError = (
  errors: Record<string, string[]>,
  fieldPath: string
): boolean => {
  return !!(errors[fieldPath] && errors[fieldPath].length > 0);
};

/**
 * Get CSS classes for input field based on error state
 */
export const getInputErrorClasses = (
  errors: Record<string, string[]>,
  fieldPath: string,
  baseClasses: string = ''
): string => {
  const hasError = hasFieldError(errors, fieldPath);
  
  const errorClasses = hasError
    ? 'border-red-500 focus:ring-red-500'
    : 'border-input focus:ring-ring';
  
  return `${baseClasses} ${errorClasses}`.trim();
};