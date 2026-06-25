import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "../../../components/ui/use-toast";

import { getSettings, createSetting, updateSetting } from "../../../api/setting";
import { getPages, createPage, updatePage } from "../../../api/page";
import { Setting } from "../../../types/setting";
import { Page } from "../../../types/page";

/**
 * Loads all settings (as a key -> Setting map) plus the "about" CMS page (which
 * holds the uploadable About journey image), and exposes a single `save` that
 * upserts a group's fields and optionally uploads the image.
 */
export const useSettingsManager = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["settings-all"],
    queryFn: () => getSettings({ page: 1, per_page: 100, paginate: true }),
    staleTime: 1000 * 60 * 5,
  });

  const settings: Setting[] = settingsQuery.data?.data ?? [];
  const settingsMap = useMemo(() => {
    const map = new Map<string, Setting>();
    settings.forEach((s) => map.set(s.key, s));
    return map;
  }, [settings]);

  const aboutPageQuery = useQuery({
    queryKey: ["about-page"],
    queryFn: async (): Promise<Page | null> => {
      const res = await getPages({ page: 1, per_page: 100, paginate: true });
      return res.data.find((p) => p.slug === "about") ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
  const aboutPage = aboutPageQuery.data ?? null;

  const saveGroup = useMutation({
    mutationFn: async ({
      group,
      values,
    }: {
      group: string;
      values: Record<string, string>;
    }) => {
      const ops: Promise<unknown>[] = [];
      Object.entries(values).forEach(([key, raw]) => {
        const value = raw ?? "";
        const existing = settingsMap.get(key);
        if (existing) {
          if ((existing.value ?? "") !== value) {
            ops.push(updateSetting({ id: existing.id, data: { key, value, group } }));
          }
        } else if (value !== "") {
          ops.push(createSetting({ key, value, group }));
        }
      });
      await Promise.all(ops);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-all"] });
    },
  });

  const saveAboutImage = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("title", aboutPage?.title ?? "About");
      fd.append("featured_image", file);
      if (aboutPage) {
        fd.append("_method", "PUT");
        return updatePage({ id: aboutPage.id, formData: fd });
      }
      return createPage(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-page"] });
    },
  });

  const save = async (
    group: string,
    values: Record<string, string>,
    imageFile: File | null
  ) => {
    try {
      await saveGroup.mutateAsync({ group, values });
      if (imageFile) {
        await saveAboutImage.mutateAsync(imageFile);
      }
      toast({ title: "Settings saved" });
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message
          : err instanceof Error
            ? err.message
            : "Please try again.";
      toast({ variant: "destructive", title: "Save failed", description: message });
      throw err;
    }
  };

  return {
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    isSaving: saveGroup.isPending || saveAboutImage.isPending,
    // The About image is stored on the "about" page; block its save until that
    // query resolves so we don't createPage() and spawn a duplicate slug.
    aboutPageLoading: aboutPageQuery.isLoading,
    settingsMap,
    aboutImageUrl: aboutPage?.featured_image ?? null,
    save,
  };
};
