import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../components/ui/use-toast";

import {
  getContactSubmissions,
  getContactSubmission,
  deleteContactSubmission,
} from "../../../api/contact-submission";
import { PaginatedResponse, PaginationMeta } from "../../../types/pagination";
import { ContactSubmission } from "../../../types/contact-submission";

interface ContactFilters {
  page?: number;
  search?: string;
  per_page?: number;
}

export const ContactSubmissionQueryKeys = {
  all: ["ContactSubmission"] as const,
  lists: () => [...ContactSubmissionQueryKeys.all, "list"] as const,
  list: (filters: object) =>
    [...ContactSubmissionQueryKeys.lists(), filters] as const,
};

interface UseContactSubmissionReturn {
  submissions: ContactSubmission[];
  meta?: PaginationMeta;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isDeleting: boolean;
  selected: ContactSubmission | null;
  toDelete: ContactSubmission | null;
  actions: {
    view: (submission: ContactSubmission) => void;
    closeView: () => void;
    confirmDelete: (id: string | number) => void;
    cancelDelete: () => void;
    handleDelete: () => void;
  };
}

export const useContactSubmission = (
  filters: ContactFilters = {}
): UseContactSubmissionReturn => {
  const queryClient = useQueryClient();
  const { page = 1, search = "", per_page = 10 } = filters;
  const queryParams = {
    page,
    paginate: true,
    per_page,
    ...(search && { search }),
  };

  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [toDelete, setToDelete] = useState<ContactSubmission | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useQuery<PaginatedResponse<ContactSubmission>, Error>({
    queryKey: ContactSubmissionQueryKeys.list(queryParams),
    queryFn: () => getContactSubmissions(queryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    refetchOnMount: "always",
  });

  const submissions = response?.data || [];
  const meta = response?.meta ? response.meta : undefined;

  const { mutate: markAsRead } = useMutation({
    mutationFn: (id: string | number) => getContactSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ContactSubmissionQueryKeys.lists(),
      });
    },
  });

  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: (id: string | number) => deleteContactSubmission(id),
    onSuccess: () => {
      toast({ title: "Message Deleted" });
      queryClient.invalidateQueries({
        queryKey: ContactSubmissionQueryKeys.lists(),
      });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "There was a problem deleting the message.";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    },
    onSettled: () => {
      setToDelete(null);
    },
  });

  const view = (submission: ContactSubmission) => {
    setSelected(submission);
    if (!submission.is_read) {
      markAsRead(submission.id);
    }
  };

  const closeView = () => setSelected(null);

  const confirmDelete = (id: string | number) => {
    const found = submissions.find((s) => s.id === id);
    if (found) {
      setToDelete(found);
    }
  };

  const cancelDelete = () => setToDelete(null);

  const handleDelete = () => {
    if (toDelete) {
      performDelete(toDelete.id);
    }
  };

  return {
    submissions,
    meta,
    isLoading,
    isFetching,
    isError,
    isDeleting,
    selected,
    toDelete,
    actions: {
      view,
      closeView,
      confirmDelete,
      cancelDelete,
      handleDelete,
    },
  };
};
