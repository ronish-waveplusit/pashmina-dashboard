import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  errors?: string | string[];
  className?: string;
}

export const FieldError = ({ errors, className = "" }: FieldErrorProps) => {
  if (!errors) return null;

  const errorArray = Array.isArray(errors) ? errors : [errors];
  
  if (errorArray.length === 0) return null;

  return (
    <div className={`mt-1 space-y-1 ${className}`}>
      {errorArray.map((error, index) => (
        <div
          key={index}
          className="flex items-start gap-1.5 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
};