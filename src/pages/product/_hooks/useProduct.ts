import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../components/ui/use-toast";
import { AxiosError } from "axios";
import { displayValidationErrors } from "../../../utils/helper/toastValidation";

import {
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByBranchId,
} from "../../../api/product";

import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import {
  ProductResponse,
  ProductFormData,
  ProductFormDataWithId,
} from "../../../types/product";

interface ProductFilters {
  branchId?: string | number;
  page?: number;
  search?: string;
  per_page?: number;
  status?: string;
  category?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/* ---------- Query Keys ---------- */
export const ProductQueryKeys = {
  all: ["products"] as const,
  lists: () => [...ProductQueryKeys.all, "list"] as const,
  list: (filters: object) => [...ProductQueryKeys.lists(), filters] as const,
  byBranchId: () => [...ProductQueryKeys.all, "byBranchId"] as const,
  byBranchIdList: (filters: ProductFilters) =>
    [...ProductQueryKeys.byBranchId(), filters] as const,
  detail: (id: string | number) => [...ProductQueryKeys.all, id] as const,
};

interface UseProductReturn {
  products: ProductResponse[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  productToDelete: ProductResponse | null;

  actions: {
    view: (id: string | number) => void;
    edit: (id: string | number) => void;
    add: (data: ProductFormData | FormData) => Promise<ProductResponse>;
    update: (
      id: string | number,
      data: ProductFormData | ProductFormDataWithId | FormData
    ) => Promise<ProductResponse>;
    confirmDelete: (id: string | number) => void;
    cancelDelete: () => void;
    handleDelete: () => void;
  };
}

/**
 * Custom hook for managing products (list + CRUD)
 */
export const useProduct = (filters: ProductFilters = {}): UseProductReturn => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    branchId,
    page = 1,
    search = "",
    per_page = 10,
    status,
    category,
    sort_by,
    sort_order,
  } = filters;

  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
    ...(status && { status }),
    ...(category && { category }),
    ...(sort_by && { sort_by }),
    ...(sort_order && { sort_order }),
  };

  const [productToDelete, setProductToDelete] = useState<ProductResponse | null>(
    null
  );

  /* ---------- Fetch product list ---------- */
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useQuery<PaginatedResponse<ProductResponse>, Error>({
    queryKey: branchId
      ? ProductQueryKeys.byBranchIdList({ ...queryParams, branchId })
      : ProductQueryKeys.list(queryParams),
    queryFn: () =>
      branchId
        ? getProductByBranchId(branchId, queryParams)
        : getProduct(queryParams),
    staleTime: 0, // Always fetch fresh data
    placeholderData: (previousData) => previousData,
  });

  const products = response?.data || [];
   const meta = response?.meta ? response.meta : undefined;

  /* ---------- Delete mutation ---------- */
  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (productId: string | number) => deleteProduct(productId),
    onSuccess: async () => {
      toast({ title: "Product Deleted" });
      
      // Wait for all invalidations to complete
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ProductQueryKeys.lists(),
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ProductQueryKeys.byBranchId(),
          refetchType: 'active'
        })
      ]);
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete the product.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => setProductToDelete(null),
  });

  /* ---------- Create mutation ---------- */
  const { mutateAsync: performAdd, isPending: isAdding } = useMutation({
    mutationFn: (data: ProductFormData | FormData) => createProduct(data),
    onSuccess: async (data) => {
      toast({
        title: "Product Added",
        description: `Product "${data.name}" has been created.`,
      });
      
      // Wait for all invalidations to complete
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ProductQueryKeys.lists(),
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ProductQueryKeys.byBranchId(),
          refetchType: 'active'
        })
      ]);
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError && err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
          displayValidationErrors(errors);
        }
      }
      throw err;
    }
  });

  /* ---------- Update mutation ---------- */
  const { mutateAsync: performUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: ProductFormData | ProductFormDataWithId | FormData;
    }) => updateProduct(id, data),
    onSuccess: async (data) => {
      toast({
        title: "Product Updated",
        description: `Product "${data.name}" has been saved.`,
      });
      
      // Wait for all invalidations to complete before navigation
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ProductQueryKeys.lists(),
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ProductQueryKeys.detail(data.id),
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ProductQueryKeys.byBranchId(),
          refetchType: 'active'
        })
      ]);
    },
    onError: (err: unknown) => {
      console.log('Update error:', err);
      
      // Handle validation errors (422)
      if (err instanceof AxiosError && err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        console.log('Validation errors:', errors);
        
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
          displayValidationErrors(errors);
        } else {
          toast({
            variant: "destructive",
            title: "Validation Failed",
            description: err.response?.data?.message || "Please check your input and try again",
          });
        }
      } else {
        // Handle other errors
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
      }
      throw err;
    },
  });

  /* ---------- Navigation helpers ---------- */
  const handleView = useCallback(
    (id: string | number) => {
      navigate(`/products/${id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (id: string | number) => {
      navigate(`/product-form/${id}`);
    },
    [navigate]
  );

  /* ---------- Delete dialog helpers ---------- */
  const confirmDelete = (productId: string | number) => {
    const product = products.find((p) => p.id === productId);
    if (product) setProductToDelete(product);
  };

  const cancelDelete = () => setProductToDelete(null);

  const handleDelete = () => {
    if (productToDelete) {
      performDelete(productToDelete.id);
    }
  };

  return {
    products,
    meta,
    isLoading,
    isFetching,
    isError,
    isAdding,
    isUpdating,
    isDeleting,
    productToDelete,
    actions: {
      view: handleView,
      edit: handleEdit,
      add: performAdd,
      update: (
        id: string | number,
        data: ProductFormData | ProductFormDataWithId | FormData
      ) => performUpdate({ id, data }),
      confirmDelete,
      cancelDelete,
      handleDelete,
    },
  };
};

/* ---------- Hook for single product detail ---------- */
interface UseProductDetailReturn {
  product: ProductResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useProductDetail = (
  productId: string | number
): UseProductDetailReturn => {
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery<ProductResponse, Error>({
    queryKey: ProductQueryKeys.detail(productId),
    queryFn: () => getProductById(productId),
    staleTime: 0, // Always fetch fresh data
    enabled: !!productId,
  });

  return {
    product,
    isLoading,
    isError,
    error,
  };
};