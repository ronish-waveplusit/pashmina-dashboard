import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../components/ui/use-toast";

import {
  getTransactionCategory,
  deleteTransactionCategory,
  createTransactionCategory,
  updateTransactionCategory,
  getTransactionCategoryByBranchId,
} from "../../../api/category";
import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import { AxiosError } from "axios";

import { CategoryPayload } from "../../../types/category";

interface TransactionFilters {
  branchId?: string | number;
  page?: number;
  search?: string;
  per_page?: number;
}

export const TransactionCategoryQueryKeys = {
  all: ["TransactionCategory"] as const,
  lists: () => [...TransactionCategoryQueryKeys.all, "list"] as const,
  list: (filters: object) =>
    [...TransactionCategoryQueryKeys.lists(), filters] as const,
  byBranchId: () =>
    [...TransactionCategoryQueryKeys.all, "byBranchId"] as const,
  byBranchIdList: (filters: TransactionFilters) =>
    [...TransactionCategoryQueryKeys.byBranchId(), filters] as const,
};

interface UseTransactionCategoryReturn {
  transactionCategories: CategoryPayload[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  referralToDelete: CategoryPayload | null;
  actions: {
    view: (id: string | number) => void;
    edit: (id: string | number) => void;
    add: (data: FormData) => Promise<CategoryPayload>;
    update: (
      id: string | number,
      data: FormData
    ) => Promise<CategoryPayload>;
    confirmDelete: (id: string | number) => void;
    cancelDelete: () => void;
    handleDelete: () => void;
  };
}

export const useTransactionCategory = (
  filters: TransactionFilters = {}
): UseTransactionCategoryReturn => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { branchId, page = 1, search = "", per_page = 10 } = filters;
  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
  };

  const [referralToDelete, setreferralToDelete] =
    useState<CategoryPayload | null>(null);

  // ✅ Fixed: Removed keepPreviousData, added placeholderData
  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useQuery<PaginatedResponse<CategoryPayload>, Error>({
    queryKey: branchId
      ? TransactionCategoryQueryKeys.byBranchIdList({
          ...queryParams,
          branchId,
        })
      : TransactionCategoryQueryKeys.list(queryParams),
    queryFn: () =>
      branchId
        ? getTransactionCategoryByBranchId(branchId, queryParams)
        : getTransactionCategory(queryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData, 
    refetchOnMount: "always",
  });

  const transactionCategories = response?.data || [];
  const meta = response?.meta ? response.meta : undefined;

  // ✅ Fixed: React Query v5 syntax
  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (TransactionCategoryId: string | number) =>
      deleteTransactionCategory(TransactionCategoryId),
    onSuccess: () => {
      toast({ title: "TransactionCategory Deleted" });
      queryClient.invalidateQueries({
        queryKey: TransactionCategoryQueryKeys.lists(),
      });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "There was a problem deleting the TransactionCategory.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => {
      setreferralToDelete(null);
    },
  });

  // ✅ Fixed: React Query v5 syntax
  const { mutateAsync: performAdd, isPending: isAdding } = useMutation({
    mutationFn: (formData: FormData) => createTransactionCategory(formData),
    onSuccess: (data) => {
      toast({
        title: "TransactionCategory Added Successfully",
        description: `The TransactionCategory "${data.name}" has been created.`,
      });
      queryClient.invalidateQueries({
        queryKey: TransactionCategoryQueryKeys.lists(),
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

  // ✅ Fixed: React Query v5 syntax
  const { mutateAsync: performUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, formData }: { id: string | number; formData: FormData }) =>
      updateTransactionCategory({ id, formData }),
    onSuccess: (data) => {
      toast({
        title: "TransactionCategory Updated Successfully",
        description: `The TransactionCategory "${data.name}" has been saved.`,
      });
      queryClient.invalidateQueries({
        queryKey: TransactionCategoryQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ["TransactionCategory", data.id],
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
    (transactionCategoryId: string | number) => {
      navigate(`/transactionCategory/${transactionCategoryId}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (transactionCategoryId: string | number) => {
      navigate(`/transactionCategory-edit/${transactionCategoryId}`);
    },
    [navigate]
  );

  const confirmDelete = (transactionCategoryId: string | number) => {
    const transactionCategory = transactionCategories.find(
      (c) => c.id === transactionCategoryId
    );
    if (transactionCategory) {
      setreferralToDelete(transactionCategory);
    }
  };

  const cancelDelete = () => {
    setreferralToDelete(null);
  };

  const handleDelete = () => {
    if (referralToDelete) {
      performDelete(referralToDelete.id);
    }
  };

  return {
    transactionCategories,
    meta,
    isLoading,
    isFetching,
    isError,
    isAdding,
    isUpdating,
    isDeleting,
    referralToDelete,
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