import { useState } from "react";
import { Plus, MessageSquareQuote, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import Pagination from "../../../components/pagination/pagination";
import { useTestimonials } from "../_hooks/useTestimonials";
import { TestimonialForm } from "./TestimonialForm";
import { Testimonial } from "../../../types/testimonial";

const PER_PAGE = 10;

export const TestimonialsManager = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState<Testimonial | null>(
    null
  );

  const {
    testimonials,
    meta,
    isLoading,
    isError,
    isAdding,
    isUpdating,
    isDeleting,
    testimonialToDelete,
    actions,
  } = useTestimonials({ page, per_page: PER_PAGE });

  const handleEdit = (t: Testimonial) => {
    setEditTestimonial(t);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditTestimonial(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          These appear in the “What they say” section of the storefront home
          page.
        </p>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add testimonial
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading testimonials…
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-destructive">
          Couldn’t load testimonials. Please refresh.
        </div>
      ) : testimonials.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquareQuote className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-medium">No testimonials yet</h3>
          <p className="mt-1 text-muted-foreground">
            Add one and it will show on the storefront home page.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Review</th>
                <th className="py-3 px-4 font-medium">Rating</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-3 px-4">{t.display_order}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{t.name}</div>
                    {t.location && (
                      <div className="text-xs text-muted-foreground">
                        {t.location}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-md">
                    <div className="line-clamp-2 text-muted-foreground">
                      {t.review}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                      {t.rating ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={
                        t.status
                          ? "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                          : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {t.status ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => actions.confirmDelete(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && (
            <Pagination
              meta={meta}
              setPage={setPage}
              isLoading={isLoading}
              itemLabel="testimonials"
            />
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editTestimonial ? "Edit testimonial" : "Add testimonial"}
            </DialogTitle>
          </DialogHeader>
          <TestimonialForm
            key={editTestimonial?.id ?? "add"}
            initialData={editTestimonial}
            onSubmit={
              editTestimonial
                ? (data) => actions.update(editTestimonial.id, data)
                : actions.add
            }
            isSubmitting={editTestimonial ? isUpdating : isAdding}
            onCloseModal={handleModalClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!testimonialToDelete}
        onOpenChange={actions.cancelDelete}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm delete</DialogTitle>
          </DialogHeader>
          <p className="mb-2">
            Are you sure you want to delete this testimonial?
          </p>
          {testimonialToDelete && (
            <div className="mt-2 rounded-lg bg-muted p-4">
              <p className="font-medium">{testimonialToDelete.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {testimonialToDelete.review}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={actions.cancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={actions.handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
