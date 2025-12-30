import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../components/ui/use-toast";
import { AxiosError } from "axios";
import { displayValidationErrors } from "../../../utils/helper/toastValidation";

import {
  getChalani,
  getChalaniById,
  createChalani,
  deleteChalani,
} from "../../../api/chalani";

import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import {
  ChalanListItem,
  ChalanDetail,
  CreateChalanPayload,
} from "../../../types/chalani";

interface ChalaniFilters {
  page?: number;
  search?: string;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  issue_date?: string;
}

/* ---------- Query Keys ---------- */
export const ChalaniQueryKeys = {
  all: ["chalani"] as const,
  lists: () => [...ChalaniQueryKeys.all, "list"] as const,
  list: (filters: object) => [...ChalaniQueryKeys.lists(), filters] as const,
  detail: (id: string | number) => [...ChalaniQueryKeys.all, id] as const,
};

interface UseChalaniReturn {
  chalaniList: ChalanListItem[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isAdding: boolean;
  isDeleting: boolean;
  chalaniToDelete: ChalanListItem | null;

  actions: {
    view: (id: string | number) => void;
    add: (data: CreateChalanPayload) => Promise<ChalanDetail>;
    confirmDelete: (id: string | number) => void;
    cancelDelete: () => void;
    handleDelete: () => void;
  };
}

/**
 * Custom hook for managing chalani (list + CRUD)
 */
export const useChalani = (filters: ChalaniFilters = {}): UseChalaniReturn => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    page = 1,
    search = "",
    per_page = 10,
    sort_by,
    sort_order,
    issue_date,
  } = filters;

  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
    ...(sort_by && { sort_by }),
    ...(sort_order && { sort_order }),
    ...(issue_date && { issue_date }),
  };

  const [chalaniToDelete, setChalaniToDelete] = useState<ChalanListItem | null>(
    null
  );

  /* ---------- Fetch chalani list ---------- */
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useQuery<PaginatedResponse<ChalanListItem>, Error>({
    queryKey: ChalaniQueryKeys.list(queryParams),
    queryFn: () => getChalani(queryParams),
    staleTime: 0,
    placeholderData: (previousData) => previousData,
    refetchOnMount: "always",
  });

  const chalaniList = response?.data || [];
  const meta = response?.meta ? response.meta : undefined;

  /* ---------- Delete mutation ---------- */
  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (chalaniId: string | number) => deleteChalani(chalaniId),
    onSuccess: () => {
      toast({ title: "Chalani Deleted" });
      queryClient.invalidateQueries({ queryKey: ChalaniQueryKeys.lists() });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete the chalani.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => setChalaniToDelete(null),
  });

  /* ---------- Create mutation ---------- */
  const { mutateAsync: performAdd, isPending: isAdding } = useMutation({
    mutationFn: (data: CreateChalanPayload) => createChalani(data),
    onSuccess: () => {
      toast({
        title: "Chalani Added",
        description: `Chalani has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ChalaniQueryKeys.lists() });
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError && err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        if (errors && typeof errors === "object" && Object.keys(errors).length > 0) {
          displayValidationErrors(errors);
        }
      }
      throw err;
    },
  });

  /* ---------- Navigation helpers ---------- */
  const handleView = useCallback(
    (id: string | number) => {
      navigate(`/chalani/${id}`);
    },
    [navigate]
  );

  /* ---------- Delete dialog helpers ---------- */
  const confirmDelete = (chalaniId: string | number) => {
    const chalani = chalaniList.find((c) => c.id === chalaniId);
    if (chalani) setChalaniToDelete(chalani);
  };

  const cancelDelete = () => setChalaniToDelete(null);

  const handleDelete = () => {
    if (chalaniToDelete) {
      performDelete(chalaniToDelete.id);
    }
  };

  return {
    chalaniList,
    meta,
    isLoading,
    isFetching,
    isError,
    isAdding,
    isDeleting,
    chalaniToDelete,
    actions: {
      view: handleView,
      add: performAdd,
      confirmDelete,
      cancelDelete,
      handleDelete,
    },
  };
};

/* ---------- Hook for single chalani detail ---------- */
interface UseChalaniDetailReturn {
  chalani: ChalanDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useChalaniDetail = (
  chalaniId: string | number
): UseChalaniDetailReturn => {
  const {
    data: chalani,
    isLoading,
    isError,
    error,
  } = useQuery<ChalanDetail, Error>({
    queryKey: ChalaniQueryKeys.detail(chalaniId),
    queryFn: () => getChalaniById(chalaniId),
    staleTime: 0,
    enabled: !!chalaniId,
  });

  return {
    chalani,
    isLoading,
    isError,
    error,
  };
};