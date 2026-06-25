import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "../../../components/ui/use-toast";

import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../../../api/testimonial";
import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import { Testimonial, TestimonialPayload } from "../../../types/testimonial";

interface TestimonialFilters {
  page?: number;
  per_page?: number;
}

export const TestimonialQueryKeys = {
  all: ["Testimonial"] as const,
  lists: () => [...TestimonialQueryKeys.all, "list"] as const,
  list: (filters: object) => [...TestimonialQueryKeys.lists(), filters] as const,
};

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof AxiosError
    ? err.response?.data?.message ?? fallback
    : err instanceof Error
      ? err.message
      : fallback;

export const useTestimonials = (filters: TestimonialFilters = {}) => {
  const queryClient = useQueryClient();
  const { page = 1, per_page = 10 } = filters;
  const queryParams = { page, per_page, paginate: true };

  const [testimonialToDelete, setTestimonialToDelete] =
    useState<Testimonial | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useQuery<PaginatedResponse<Testimonial>, Error>({
    queryKey: TestimonialQueryKeys.list(queryParams),
    queryFn: () => getTestimonials(queryParams),
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData,
    refetchOnMount: "always",
  });

  const testimonials = response?.data ?? [];
  const meta: PaginationMeta | undefined = response?.meta;

  const { mutateAsync: performAdd, isPending: isAdding } = useMutation({
    mutationFn: (data: TestimonialPayload) => createTestimonial(data),
    onSuccess: () => {
      toast({ title: "Testimonial added" });
      queryClient.invalidateQueries({ queryKey: TestimonialQueryKeys.lists() });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: errorMessage(err, "An unexpected error occurred."),
      });
      throw err;
    },
  });

  const { mutateAsync: performUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TestimonialPayload }) =>
      updateTestimonial({ id, data }),
    onSuccess: () => {
      toast({ title: "Testimonial updated" });
      queryClient.invalidateQueries({ queryKey: TestimonialQueryKeys.lists() });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage(err, "An unexpected error occurred."),
      });
      throw err;
    },
  });

  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteTestimonial(id),
    onSuccess: () => {
      toast({ title: "Testimonial deleted" });
      queryClient.invalidateQueries({ queryKey: TestimonialQueryKeys.lists() });
    },
    onError: (err: unknown) => {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: errorMessage(err, "There was a problem deleting it."),
      });
    },
    onSettled: () => setTestimonialToDelete(null),
  });

  return {
    testimonials,
    meta,
    isLoading,
    isFetching,
    isError,
    isAdding,
    isUpdating,
    isDeleting,
    testimonialToDelete,
    actions: {
      add: performAdd,
      update: (id: number, data: TestimonialPayload) =>
        performUpdate({ id, data }),
      confirmDelete: (id: number) => {
        const found = testimonials.find((t) => t.id === id);
        if (found) setTestimonialToDelete(found);
      },
      cancelDelete: () => setTestimonialToDelete(null),
      handleDelete: () => {
        if (testimonialToDelete) performDelete(testimonialToDelete.id);
      },
    },
  };
};
