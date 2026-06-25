import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../components/ui/use-toast";

import {
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../../../api/enquiry";

import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import { Enquiry, EnquiryStatus } from "../../../types/enquiry";

interface EnquiryFilters {
  page?: number;
  search?: string;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  status?: EnquiryStatus;
}

/* ---------- Query Keys ---------- */
export const EnquiryQueryKeys = {
  all: ["enquiries"] as const,
  lists: () => [...EnquiryQueryKeys.all, "list"] as const,
  list: (filters: object) => [...EnquiryQueryKeys.lists(), filters] as const,
  detail: (id: string | number) => [...EnquiryQueryKeys.all, "detail", id] as const,
};

interface UseEnquiryReturn {
  enquiries: Enquiry[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  enquiryToDelete: Enquiry | null;
  actions: {
    confirmDelete: (enquiry: Enquiry) => void;
    cancelDelete: () => void;
    handleDelete: () => void;
    updateStatus: (id: string | number, status: EnquiryStatus) => void;
  };
}

export const useEnquiry = (filters: EnquiryFilters = {}): UseEnquiryReturn => {
  const queryClient = useQueryClient();

  const {
    page = 1,
    search = "",
    per_page = 10,
    sort_by,
    sort_order,
    status,
  } = filters;

  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
    ...(sort_by && { sort_by }),
    ...(sort_order && { sort_order }),
    ...(status && { status }),
  };

  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);

  /* ---------- Fetch enquiry list ---------- */
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useQuery<PaginatedResponse<Enquiry>, Error>({
    queryKey: EnquiryQueryKeys.list(queryParams),
    queryFn: () => getEnquiries(queryParams),
    staleTime: 0,
    placeholderData: (previousData) => previousData,
    refetchOnMount: "always",
  });

  const enquiries = response?.data || [];
  const meta = response?.meta ? response.meta : undefined;

  /* ---------- Delete mutation ---------- */
  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string | number) => deleteEnquiry(id),
    onSuccess: () => {
      toast({ title: "Enquiry Deleted" });
      queryClient.invalidateQueries({ queryKey: EnquiryQueryKeys.lists() });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete the enquiry.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => setEnquiryToDelete(null),
  });

  /* ---------- Status update mutation ---------- */
  const { mutate: performUpdateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string | number;
      status: EnquiryStatus;
    }) => updateEnquiryStatus(id, status),
    onSuccess: () => {
      toast({ title: "Status Updated" });
      queryClient.invalidateQueries({ queryKey: EnquiryQueryKeys.all });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update the status.";
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
    },
  });

  const confirmDelete = (enquiry: Enquiry) => setEnquiryToDelete(enquiry);
  const cancelDelete = () => setEnquiryToDelete(null);
  const handleDelete = () => {
    if (enquiryToDelete) performDelete(enquiryToDelete.id);
  };
  const updateStatus = (id: string | number, status: EnquiryStatus) =>
    performUpdateStatus({ id, status });

  return {
    enquiries,
    meta,
    isLoading,
    isFetching,
    isError,
    isDeleting,
    isUpdating,
    enquiryToDelete,
    actions: {
      confirmDelete,
      cancelDelete,
      handleDelete,
      updateStatus,
    },
  };
};

/* ---------- Hook for single enquiry detail ---------- */
interface UseEnquiryDetailReturn {
  enquiry: Enquiry | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useEnquiryDetail = (
  enquiryId: string | number | null
): UseEnquiryDetailReturn => {
  const {
    data: enquiry,
    isLoading,
    isError,
    error,
  } = useQuery<Enquiry, Error>({
    queryKey: EnquiryQueryKeys.detail(enquiryId ?? ""),
    queryFn: () => getEnquiryById(enquiryId as string | number),
    enabled: !!enquiryId,
    staleTime: 0,
  });

  return { enquiry, isLoading, isError, error };
};
