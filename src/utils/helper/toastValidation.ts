import { toast } from "../../components/ui/use-toast";
import { formatFieldName, cleanErrorMessage } from "./validation";

/**
 * Display validation errors as toast notifications
 * @param errors - Validation errors object from API response
 * @param maxToasts - Maximum number of individual error toasts to show (default: 3)
 */
export const displayValidationErrors = (
  errors: Record<string, string[]>,
  maxToasts: number = 3
): void => {
  console.log('Displaying validation errors:', errors);
  
  // Collect all error messages
  const errorMessages: string[] = [];
  
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach(message => {
      const fieldName = formatFieldName(field);
      const cleanMessage = cleanErrorMessage(field, message);
      errorMessages.push(`${fieldName}: ${cleanMessage}`);
    });
  });

  console.log('Formatted error messages:', errorMessages);

  // Display up to maxToasts errors individually
  errorMessages.slice(0, maxToasts).forEach((message, index) => {
    setTimeout(() => {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: message,
      });
    }, index * 100); // Stagger the toasts slightly
  });

  // Show remaining errors count if there are more
  if (errorMessages.length > maxToasts) {
    setTimeout(() => {
      toast({
        variant: "destructive",
        title: "Additional Errors",
        description: `${errorMessages.length - maxToasts} more validation error(s)`,
      });
    }, maxToasts * 100);
  }
};

/**
 * Alternative: Display all errors in a single toast (useful for many errors)
 */
export const displayValidationErrorsSingle = (
  errors: Record<string, string[]>
): void => {
  const errorMessages: string[] = [];
  
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach(message => {
      const fieldName = formatFieldName(field);
      const cleanMessage = cleanErrorMessage(field, message);
      errorMessages.push(`• ${fieldName}: ${cleanMessage}`);
    });
  });

  // Join error messages into a single string
  const displayMessages = errorMessages.slice(0, 5).join('\n');
  const remainingCount = errorMessages.length > 5 
    ? `\n\n+${errorMessages.length - 5} more errors` 
    : '';

  toast({
    variant: "destructive",
    title: "Validation Failed",
    description: displayMessages + remainingCount,
  });
};
