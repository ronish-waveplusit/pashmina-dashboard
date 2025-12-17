// components/ui/field-error.tsx

interface FieldErrorProps {
  errors?: string[];
  className?: string;
}

/**
 * Reusable component to display field validation errors
 * 
 * @example
 * ```tsx
 * <FieldError errors={validationErrors.name} />
 * <FieldError errors={validationErrors.price} className="mt-2" />
 * ```
 */
export const FieldError = ({ errors, className = '' }: FieldErrorProps) => {
  if (!errors || errors.length === 0) return null;
  
  return (
    <div className={`mt-1 ${className}`.trim()}>
      {errors.map((error, index) => (
        <p key={index} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ))}
    </div>
  );
};