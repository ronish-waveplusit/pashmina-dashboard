import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createLot, getProductVariation, getLot } from "../../../api/product-variation";
import { PaginatedResponse } from "../../../types/pagination";
import { Lot, ProductVariation } from "../../../types/product-variation";
import { AxiosError } from "axios";
import { toast } from "../../../components/ui/use-toast";

interface ProductVariationFilters {
  branchId?: string | number;
  page?: number;
  search?: string;
  per_page?: number;
  status?: string;
  category?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

interface LotFilters {
  page?: number;
  search?: string;
  per_page?: number;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/* ---------- Query Keys ---------- */
export const ProductVariationQueryKeys = {
  all: ["product-variations"] as const,
  lists: () => [...ProductVariationQueryKeys.all, "list"] as const,
  list: (filters: object) => [...ProductVariationQueryKeys.lists(), filters] as const,
  byBranchId: () => [...ProductVariationQueryKeys.all, "byBranchId"] as const,
  byBranchIdList: (filters: ProductVariationFilters) =>
    [...ProductVariationQueryKeys.byBranchId(), filters] as const,
  
  // Lot query keys
  lots: () => [...ProductVariationQueryKeys.all, "lots"] as const,
  lotList: (filters: object) => [...ProductVariationQueryKeys.lots(), filters] as const,
};

// Updated return type to include lot query and mutation
interface UseProductVariationReturn {
  products: ProductVariation[];
  meta?: Omit<PaginatedResponse<ProductVariation>, "data">;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;

  // Lot query data
  lots: Lot[];
  lotMeta?: Omit<PaginatedResponse<Lot>, "data">;
  isLoadingLots: boolean;
  isFetchingLots: boolean;
  isErrorLots: boolean;

  // Lot (stock import) mutation
  isAddingLot: boolean;
  addLot: (formData: FormData) => Promise<Lot>;
}

/**
 * Hook for product variations list + lot queries + adding stock lots
 */
export const useProductVariation = (
  filters: ProductVariationFilters = {},
  lotFilters: LotFilters = {},
  enableLotQuery: boolean = false
): UseProductVariationReturn => {
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

  const queryClient = useQueryClient();

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

  // Product variations query
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useQuery<PaginatedResponse<ProductVariation>, Error>({
    queryKey: branchId
      ? ProductVariationQueryKeys.byBranchIdList({ ...queryParams, branchId })
      : ProductVariationQueryKeys.list(queryParams),
    queryFn: () => getProductVariation(queryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const products = response?.data || [];
  const meta = response ? (({ data, ...m }) => m)(response) : undefined;

  // Lot query params
  const lotQueryParams = {
    page: lotFilters.page || 1,
    paginate: true,
    per_page: lotFilters.per_page || 10,
    ...(lotFilters.search && { search: lotFilters.search }),
    ...(lotFilters.status && { status: lotFilters.status }),
    ...(lotFilters.sort_by && { sort_by: lotFilters.sort_by }),
    ...(lotFilters.sort_order && { sort_order: lotFilters.sort_order }),
  };

  // Lot query
  const {
    data: lotResponse,
    isLoading: isLoadingLots,
    isFetching: isFetchingLots,
    isError: isErrorLots,
  } = useQuery<PaginatedResponse<Lot>, Error>({
    queryKey: ProductVariationQueryKeys.lotList(lotQueryParams),
    queryFn: () => getLot(lotQueryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    enabled: enableLotQuery,
  });

  const lots = lotResponse?.data || [];
  const lotMeta = lotResponse ? (({ data, ...m }) => m)(lotResponse) : undefined;

  // Create lot mutation
  const { mutateAsync: addLot, isPending: isAddingLot } = useMutation({
    mutationFn: (formData: FormData) => createLot(formData),
    onSuccess: (data: any) => {
      toast({
        title: "Stock Added Successfully",
        description: `Received ${data.quantity_received || ""} units.`,
      });

      // Invalidate both product variations and lots queries
      queryClient.invalidateQueries({
        queryKey: ProductVariationQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ProductVariationQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ProductVariationQueryKeys.lots(),
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to add stock"
          : err instanceof Error
          ? err.message
          : "An unexpected error occurred.";

      toast({
        variant: "destructive",
        title: "Failed to Add Stock",
        description: message,
      });
    },
  });

  return {
    products,
    meta,
    isLoading,
    isFetching,
    isError,
    lots,
    lotMeta,
    isLoadingLots,
    isFetchingLots,
    isErrorLots,
    isAddingLot,
    addLot,
  };
};