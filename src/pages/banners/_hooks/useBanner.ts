import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "../../../components/ui/use-toast";

import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../../../api/banner";
import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import { Banner } from "../../../types/banner";

interface BannerFilters {
  page?: number;
  search?: string;
  per_page?: number;
}

export const BannerQueryKeys = {
  all: ["Banner"] as const,
  lists: () => [...BannerQueryKeys.all, "list"] as const,
  list: (filters: object) => [...BannerQueryKeys.lists(), filters] as const,
};

interface UseBannerReturn {
  banners: Banner[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  bannerToDelete: Banner | null;
  actions: {
    add: (data: FormData) => Promise<Banner>;
    update: (id: string | number, data: FormData) => Promise<Banner>;
    confirmDelete: (id: string | number) => void;
    cancelDelete: () => void;
    handleDelete: () => void;
  };
}

export const useBanner = (filters: BannerFilters = {}): UseBannerReturn => {
  const queryClient = useQueryClient();
  const { page = 1, search = "", per_page = 10 } = filters;
  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
  };

  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useQuery<PaginatedResponse<Banner>, Error>({
    queryKey: BannerQueryKeys.list(queryParams),
    queryFn: () => getBanners(queryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    refetchOnMount: "always",
  });

  const banners = response?.data || [];
  const meta = response?.meta ? response.meta : undefined;

  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string | number) => deleteBanner(id),
    onSuccess: () => {
      toast({ title: "Banner Deleted" });
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.lists() });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "There was a problem deleting the banner.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => {
      setBannerToDelete(null);
    },
  });

  const { mutateAsync: performAdd, isPending: isAdding } = useMutation({
    mutationFn: (formData: FormData) => createBanner(formData),
    onSuccess: () => {
      toast({
        title: "Banner Added Successfully",
        description: `The banner has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.lists() });
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
      updateBanner({ id, formData }),
    onSuccess: () => {
      toast({
        title: "Banner Updated Successfully",
        description: `The banner has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: BannerQueryKeys.lists() });
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
    const banner = banners.find((b) => b.id === id);
    if (banner) {
      setBannerToDelete(banner);
    }
  };

  const cancelDelete = () => {
    setBannerToDelete(null);
  };

  const handleDelete = () => {
    if (bannerToDelete) {
      performDelete(bannerToDelete.id);
    }
  };

  return {
    banners,
    meta,
    isLoading,
    isFetching,
    isError,
    isAdding,
    isUpdating,
    isDeleting,
    bannerToDelete,
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
