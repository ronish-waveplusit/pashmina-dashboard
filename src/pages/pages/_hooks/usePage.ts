import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "../../../components/ui/use-toast";

import { getPages, createPage, updatePage, deletePage } from "../../../api/page";
import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import { Page } from "../../../types/page";

interface PageFilters {
  page?: number;
  search?: string;
  per_page?: number;
}

export const PageQueryKeys = {
  all: ["Page"] as const,
  lists: () => [...PageQueryKeys.all, "list"] as const,
  list: (filters: object) => [...PageQueryKeys.lists(), filters] as const,
};

interface UsePageReturn {
  pages: Page[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  pageToDelete: Page | null;
  actions: {
    add: (data: FormData) => Promise<Page>;
    update: (id: string | number, data: FormData) => Promise<Page>;
    confirmDelete: (id: string | number) => void;
    cancelDelete: () => void;
    handleDelete: () => void;
  };
}

export const usePage = (filters: PageFilters = {}): UsePageReturn => {
  const queryClient = useQueryClient();
  const { page = 1, search = "", per_page = 10 } = filters;
  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
  };

  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useQuery<PaginatedResponse<Page>, Error>({
    queryKey: PageQueryKeys.list(queryParams),
    queryFn: () => getPages(queryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    refetchOnMount: "always",
  });

  const pages = response?.data || [];
  const meta = response?.meta ? response.meta : undefined;

  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string | number) => deletePage(id),
    onSuccess: () => {
      toast({ title: "Page Deleted" });
      queryClient.invalidateQueries({ queryKey: PageQueryKeys.lists() });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "There was a problem deleting the page.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => {
      setPageToDelete(null);
    },
  });

  const { mutateAsync: performAdd, isPending: isAdding } = useMutation({
    mutationFn: (formData: FormData) => createPage(formData),
    onSuccess: () => {
      toast({
        title: "Page Added Successfully",
        description: `The page has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: PageQueryKeys.lists() });
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
      updatePage({ id, formData }),
    onSuccess: () => {
      toast({
        title: "Page Updated Successfully",
        description: `The page has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: PageQueryKeys.lists() });
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

  const confirmDelete = (id: string | number) => {
    const found = pages.find((p) => p.id === id);
    if (found) {
      setPageToDelete(found);
    }
  };

  const cancelDelete = () => {
    setPageToDelete(null);
  };

  const handleDelete = () => {
    if (pageToDelete) {
      performDelete(pageToDelete.id);
    }
  };

  return {
    pages,
    meta,
    isLoading,
    isFetching,
    isError,
    isAdding,
    isUpdating,
    isDeleting,
    pageToDelete,
    actions: {
      add: performAdd,
      update: (id: string | number, formData: FormData) =>
        performUpdate({ id, formData }),
      confirmDelete,
      cancelDelete,
      handleDelete,
    },
  };
};
