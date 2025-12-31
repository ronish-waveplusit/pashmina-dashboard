import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../components/ui/use-toast";

import {
  getFAQs,
  deleteFAQ,
  createFAQ,
  updateFAQ,
  getFAQsByBranchId,
} from "../../../api/faq";
import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import { AxiosError } from "axios";

import { FAQ } from "../../../types/faq";

interface FAQFilters {
  branchId?: string | number;
  page?: number;
  search?: string;
  per_page?: number;
}

export const FAQQueryKeys = {
  all: ["FAQ"] as const,
  lists: () => [...FAQQueryKeys.all, "list"] as const,
  list: (filters: object) =>
    [...FAQQueryKeys.lists(), filters] as const,
  byBranchId: () =>
    [...FAQQueryKeys.all, "byBranchId"] as const,
  byBranchIdList: (filters: FAQFilters) =>
    [...FAQQueryKeys.byBranchId(), filters] as const,
};

interface UseFAQReturn {
  faqs: FAQ[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  faqToDelete: FAQ | null;
  actions: {
    view: (id: string | number) => void;
    edit: (id: string | number) => void;
    add: (data: FormData) => Promise<FAQ>;
    update: (
      id: string | number,
      data: FormData
    ) => Promise<FAQ>;
    confirmDelete: (id: string | number) => void;
    cancelDelete: () => void;
    handleDelete: () => void;
  };
}

export const useFAQ = (
  filters: FAQFilters = {}
): UseFAQReturn => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { branchId, page = 1, search = "", per_page = 10 } = filters;
  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
  };

  const [faqToDelete, setFaqToDelete] =
    useState<FAQ | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useQuery<PaginatedResponse<FAQ>, Error>({
    queryKey: branchId
      ? FAQQueryKeys.byBranchIdList({
          ...queryParams,
          branchId,
        })
      : FAQQueryKeys.list(queryParams),
    queryFn: () =>
      branchId
        ? getFAQsByBranchId(branchId, queryParams)
        : getFAQs(queryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData, 
    refetchOnMount: "always",
  });

  const faqs = response?.data || [];
  const meta = response?.meta ? response.meta : undefined;

  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (faqId: string | number) =>
      deleteFAQ(faqId),
    onSuccess: () => {
      toast({ title: "FAQ Deleted" });
      queryClient.invalidateQueries({
        queryKey: FAQQueryKeys.lists(),
      });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "There was a problem deleting the FAQ.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => {
      setFaqToDelete(null);
    },
  });

  const { mutateAsync: performAdd, isPending: isAdding } = useMutation({
    mutationFn: (formData: FormData) => createFAQ(formData),
    onSuccess: () => {
      toast({
        title: "FAQ Added Successfully",
        description: `The FAQ has been created.`,
      });
      queryClient.invalidateQueries({
        queryKey: FAQQueryKeys.lists(),
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message
          : err instanceof Error
          ? err.message
          : "An unexpected error occurred.";

      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: message,
      });
      throw err;
    },
  });

  const { mutateAsync: performUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, formData }: { id: string | number; formData: FormData }) =>
      updateFAQ({ id, formData }),
    onSuccess: (data) => {
      toast({
        title: "FAQ Updated Successfully",
        description: `The FAQ has been saved.`,
      });
      queryClient.invalidateQueries({
        queryKey: FAQQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ["FAQ", data.id],
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message
          : err instanceof Error
          ? err.message
          : "An unexpected error occurred.";

      toast({
        variant: "destructive",
        title: "Update Failed",
        description: message,
      });
      throw err;
    },
  });

  const handleView = useCallback(
    (faqId: string | number) => {
      navigate(`/faq/${faqId}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (faqId: string | number) => {
      navigate(`/faq-edit/${faqId}`);
    },
    [navigate]
  );

  const confirmDelete = (faqId: string | number) => {
    const faq = faqs.find(
      (f) => f.id === faqId
    );
    if (faq) {
      setFaqToDelete(faq);
    }
  };

  const cancelDelete = () => {
    setFaqToDelete(null);
  };

  const handleDelete = () => {
    if (faqToDelete) {
      performDelete(faqToDelete.id);
    }
  };

  return {
    faqs,
    meta,
    isLoading,
    isFetching,
    isError,
    isAdding,
    isUpdating,
    isDeleting,
    faqToDelete,
    actions: {
      view: handleView,
      edit: handleEdit,
      add: performAdd,
      update: (id: string | number, formData: FormData) =>
        performUpdate({ id, formData }),
      confirmDelete,
      cancelDelete,
      handleDelete,
    },
  };
};