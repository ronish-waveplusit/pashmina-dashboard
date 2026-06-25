import React, { useState } from "react";
import * as Yup from "yup";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { Testimonial, TestimonialPayload } from "../../../types/testimonial";
import { testimonialSchema } from "./testimonialSchema";

interface TestimonialFormProps {
  initialData?: Testimonial | null;
  onSubmit: (data: TestimonialPayload) => Promise<Testimonial>;
  isSubmitting: boolean;
  onCloseModal: () => void;
}

type FormErrors = Partial<Record<string, string | string[]>>;

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCloseModal,
}) => {
  const isEditMode = !!initialData;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    location: initialData?.location ?? "",
    designation: initialData?.designation ?? "",
    review: initialData?.review ?? "",
    rating: String(initialData?.rating ?? 5),
    display_order: String(initialData?.display_order ?? 0),
  });
  const [status, setStatus] = useState<boolean>(initialData?.status ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const candidate = {
      name: form.name,
      location: form.location,
      designation: form.designation,
      review: form.review,
      rating: form.rating === "" ? 0 : Number(form.rating),
      display_order: form.display_order === "" ? 0 : Number(form.display_order),
    };

    try {
      await testimonialSchema.validate(candidate, { abortEarly: false });

      const payload: TestimonialPayload = {
        name: candidate.name.trim(),
        review: candidate.review.trim(),
        location: candidate.location.trim() || null,
        designation: candidate.designation.trim() || null,
        rating: candidate.rating,
        display_order: candidate.display_order,
        status,
      };

      await onSubmit(payload);
      onCloseModal();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const yupErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) yupErrors[error.path] = error.message;
        });
        setErrors(yupErrors);
      } else if (err instanceof AxiosError && err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      }
    }
  };

  const errorOf = (key: string) => {
    const e = errors[key];
    return Array.isArray(e) ? e[0] : e;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Henry Ashford"
          />
          {errorOf("name") && (
            <p className="text-sm text-red-600">{errorOf("name")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="London, England"
          />
          {errorOf("location") && (
            <p className="text-sm text-red-600">{errorOf("location")}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            placeholder="Verified buyer of Royal Pashmina"
          />
          {errorOf("designation") && (
            <p className="text-sm text-red-600">{errorOf("designation")}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="review">
            Review <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="review"
            name="review"
            value={form.review}
            onChange={handleChange}
            placeholder="What did they say about the pashmina?"
            rows={5}
            className="resize-none"
          />
          {errorOf("review") && (
            <p className="text-sm text-red-600">{errorOf("review")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0–5 stars)</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min={0}
            max={5}
            value={form.rating}
            onChange={handleChange}
          />
          {errorOf("rating") && (
            <p className="text-sm text-red-600">{errorOf("rating")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_order">Display order</Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            min={0}
            value={form.display_order}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">
            Lower numbers appear first on the storefront.
          </p>
          {errorOf("display_order") && (
            <p className="text-sm text-red-600">{errorOf("display_order")}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label htmlFor="status" className="text-sm font-medium">
            Visible on storefront
          </Label>
          <p className="text-xs text-muted-foreground">
            Turn off to hide this testimonial without deleting it.
          </p>
        </div>
        <Switch id="status" checked={status} onCheckedChange={setStatus} />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCloseModal}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
              ? "Update testimonial"
              : "Add testimonial"}
        </Button>
      </div>
    </form>
  );
};
