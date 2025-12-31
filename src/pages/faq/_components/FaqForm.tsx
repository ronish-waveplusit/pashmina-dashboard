// src/pages/faq/_components/FAQForm.tsx
import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Loader2 } from "lucide-react";
import * as Yup from "yup";
import { FAQ } from "../../../types/faq";
import { AxiosError } from "axios";
import { faqSchema } from "./faqSchema";

interface FAQFormProps {
  initialData?: FAQ | null;
  onSubmit: (formData: FormData) => Promise<FAQ>;
  isSubmitting: boolean;
  onCloseModal: () => void;
}

type FormErrors = Partial<
  Record<keyof Yup.InferType<typeof faqSchema>, string | string[]>
>;

export const FAQForm: React.FC<FAQFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCloseModal,
}) => {
  const isEditMode = !!initialData;

  // Initialize state directly from initialData (or empty for "Add")
  const [faqData, setFaqData] = useState({
    question: initialData?.question ?? "",
    answer: initialData?.answer ?? "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFaqData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev: FormErrors) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await faqSchema.validate(faqData, { abortEarly: false });

      const formData = new FormData();
      formData.append("question", faqData.question);
      formData.append("answer", faqData.answer);

      if (isEditMode) {
        formData.append("_method", "PUT");
      }

      await onSubmit(formData);
      onCloseModal();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const yupErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            yupErrors[error.path as keyof FormErrors] = error.message;
          }
        });
        setErrors(yupErrors);
      } else if (err instanceof AxiosError && err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const getErrorMessage = (error: string | string[] | undefined) => {
    if (Array.isArray(error)) return error[0];
    return error;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Question Field */}
        <div className="space-y-2">
          <Label htmlFor="question">
            Question <span className="text-red-500">*</span>
          </Label>
          <Input
            id="question"
            name="question"
            value={faqData.question}
            onChange={handleInputChange}
            placeholder="Enter the question"
          />
          {errors.question && (
            <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors.question)}</p>
          )}
        </div>

        {/* Answer Field */}
        <div className="space-y-2">
          <Label htmlFor="answer">
            Answer <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="answer"
            name="answer"
            value={faqData.answer}
            onChange={handleInputChange}
            placeholder="Enter the answer"
            rows={6}
            className="resize-none"
          />
          {errors.answer && (
            <p className="text-sm text-red-600 mt-1">{getErrorMessage(errors.answer)}</p>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCloseModal} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
              ? "Update FAQ"
              : "Add FAQ"}
        </Button>
      </div>
    </form>
  );
};