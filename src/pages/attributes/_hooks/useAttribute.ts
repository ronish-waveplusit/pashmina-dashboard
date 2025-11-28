import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../components/ui/use-toast";
import {
  getAttributes,
  deleteAttribute,
  createAttribute,
  updateAttribute,
  deleteAttributeValue,
  createAttributeValue,
  updateAttributeValue,
} from "../../../api/attribute";
import { PaginatedResponse } from "../../../types/pagination";
import { AxiosError } from "axios";
import { AttributePayload, AttributeValuePayload,AttributeWithValues } from "../../../types/attribute";

interface AttributeFilters {
  page?: number;
  search?: string;
  per_page?: number;
}

export const AttributeQueryKeys = {
  all: ["attributes"] as const,
  lists: () => [...AttributeQueryKeys.all, "list"] as const,
  list: (filters: object) => [...AttributeQueryKeys.lists(), filters] as const,
};

interface UseAttributeReturn {
  attributes: AttributePayload[];
  meta?: Omit<PaginatedResponse<AttributePayload>, "data">;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  attributeToDelete: AttributePayload | null;
  valueToDelete: AttributeValuePayload | null;
  actions: {
    addAttribute: (data: FormData) => Promise<AttributePayload>;
    updateAttribute: (id: string | number, data: FormData) => Promise<AttributePayload>;
    addAttributeValue: (data: FormData) => Promise<AttributeValuePayload>;
    updateAttributeValue: (id: string | number, data: FormData) => Promise<AttributeValuePayload>;
    confirmDeleteAttribute: (id: string | number) => void;
    confirmDeleteValue: (value: AttributeValuePayload) => void;
    cancelDelete: () => void;
    handleDeleteAttribute: () => void;
    handleDeleteValue: () => void;
  };
}

export const useAttribute = (
  filters: AttributeFilters = {}
): UseAttributeReturn => {
  const queryClient = useQueryClient();
  const { page = 1, search = "", per_page = 10 } = filters;
  
  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
  };

  const [attributeToDelete, setAttributeToDelete] = useState<AttributePayload | null>(null);
  const [valueToDelete, setValueToDelete] = useState<AttributeValuePayload | null>(null);

  // Fetch attributes with their values
 const {
  data: response,
  isLoading,
  isError,
  isFetching,
} = useQuery<PaginatedResponse<AttributeWithValues>, Error>({
  queryKey: AttributeQueryKeys.list(queryParams),
  queryFn: async () => {
    const response = await getAttributes(queryParams);
    return response;
  },
  staleTime: 1000 * 60 * 5,
  placeholderData: (previousData) => previousData,
  refetchOnMount: "always",
});

const attributes: AttributeWithValues[] = response?.data || [];
const meta = response ? (({ data, ...m }) => m)(response) : undefined;
  // Delete attribute mutation
  const { mutate: performDeleteAttribute, isPending: isDeletingAttribute } = useMutation({
    mutationFn: (attributeId: string | number) => deleteAttribute(attributeId),
    onSuccess: () => {
      toast({ title: "Attribute deleted successfully" });
      queryClient.invalidateQueries({
        queryKey: AttributeQueryKeys.lists(),
      });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "There was a problem deleting the attribute.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => {
      setAttributeToDelete(null);
    },
  });

  // Delete attribute value mutation
  const { mutate: performDeleteValue, isPending: isDeletingValue } = useMutation({
    mutationFn: (valueId: string | number) => deleteAttributeValue(valueId),
    onSuccess: () => {
      toast({ title: "Attribute value deleted successfully" });
      queryClient.invalidateQueries({
        queryKey: AttributeQueryKeys.lists(),
      });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "There was a problem deleting the attribute value.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => {
      setValueToDelete(null);
    },
  });

  // Add attribute mutation
  const { mutateAsync: performAddAttribute, isPending: isAddingAttribute } = useMutation({
    mutationFn: (formData: FormData) => createAttribute(formData),
    onSuccess: (data) => {
      toast({
        title: "Attribute Added Successfully",
        description: `The attribute "${data.name}" has been created.`,
      });
      queryClient.invalidateQueries({
        queryKey: AttributeQueryKeys.lists(),
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

  // Update attribute mutation
  const { mutateAsync: performUpdateAttribute, isPending: isUpdatingAttribute } = useMutation({
    mutationFn: ({ id, formData }: { id: string | number; formData: FormData }) =>
      updateAttribute({ id, formData }),
    onSuccess: (data) => {
      toast({
        title: "Attribute Updated Successfully",
        description: `The attribute "${data.name}" has been saved.`,
      });
      queryClient.invalidateQueries({
        queryKey: AttributeQueryKeys.lists(),
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

  // Add attribute value mutation
  const { mutateAsync: performAddValue, isPending: isAddingValue } = useMutation({
    mutationFn: (formData: FormData) => createAttributeValue(formData),
    onSuccess: () => {
      toast({
        title: "Attribute Value Added Successfully",
      });
      queryClient.invalidateQueries({
        queryKey: AttributeQueryKeys.lists(),
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

  // Update attribute value mutation
  const { mutateAsync: performUpdateValue, isPending: isUpdatingValue } = useMutation({
    mutationFn: ({ id, formData }: { id: string | number; formData: FormData }) =>
      updateAttributeValue({ id, formData }),
    onSuccess: () => {
      toast({
        title: "Attribute Value Updated Successfully",
      });
      queryClient.invalidateQueries({
        queryKey: AttributeQueryKeys.lists(),
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

  const confirmDeleteAttribute = (attributeId: string | number) => {
    const attribute = attributes.find((a) => a.id === attributeId);
    if (attribute) {
      setAttributeToDelete(attribute);
    }
  };

  const confirmDeleteValue = (value: AttributeValuePayload) => {
    setValueToDelete(value);
  };

  const cancelDelete = () => {
    setAttributeToDelete(null);
    setValueToDelete(null);
  };

  const handleDeleteAttribute = () => {
    if (attributeToDelete) {
      performDeleteAttribute(attributeToDelete.id);
    }
  };

  const handleDeleteValue = () => {
    if (valueToDelete) {
      performDeleteValue(valueToDelete?.id);
    }
  };

  return {
    attributes,
    meta,
    isLoading,
    isFetching,
    isError,
    isAdding: isAddingAttribute || isAddingValue,
    isUpdating: isUpdatingAttribute || isUpdatingValue,
    isDeleting: isDeletingAttribute || isDeletingValue,
    attributeToDelete,
    valueToDelete,
    actions: {
      addAttribute: performAddAttribute,
      updateAttribute: (id: string | number, formData: FormData) =>
        performUpdateAttribute({ id, formData }),
      addAttributeValue: performAddValue,
      updateAttributeValue: (id: string | number, formData: FormData) =>
        performUpdateValue({ id, formData }),
      confirmDeleteAttribute,
      confirmDeleteValue,
      cancelDelete,
      handleDeleteAttribute,
      handleDeleteValue,
    },
  };
};