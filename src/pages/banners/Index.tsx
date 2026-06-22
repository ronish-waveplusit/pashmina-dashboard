import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layouts/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Plus, Search, Image as ImageIcon, X } from "lucide-react";
import { useBanner } from "./_hooks/useBanner";
import { BannerForm } from "./_components/BannerForm";
import { Banner } from "../../types/banner";
import Pagination from "../../components/pagination/pagination";
import { Input } from "../../components/ui/input";
import { ITEMS_PER_PAGE } from "../../constants/common";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filters = useMemo(
    () => ({
      page,
      search: debouncedSearchQuery,
      per_page: ITEMS_PER_PAGE,
    }),
    [page, debouncedSearchQuery]
  );

  const {
    banners,
    isLoading,
    isError,
    isAdding,
    isUpdating,
    bannerToDelete,
    actions,
    isDeleting,
    meta,
  } = useBanner(filters);

  const handleEdit = (banner: Banner) => {
    setEditBanner(banner);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditBanner(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  if (isLoading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div>Error loading banners</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start sm:items-center sm:flex-row flex-col gap-4 mt-4">
          <div>
            <h1 className="text-2xl font-semibold md:font-4xl">Banners</h1>
            <p className="text-muted-foreground mt-1 ">
              Manage the storefront home page hero
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center "
          >
            <Plus className="mr-2" />
            Add Banner
          </Button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editBanner ? "Edit Banner" : "Add New Banner"}
              </DialogTitle>
            </DialogHeader>
            <BannerForm
              key={editBanner?.id ?? "add"}
              initialData={editBanner}
              onSubmit={
                editBanner
                  ? (data) => actions.update(editBanner.id, data)
                  : actions.add
              }
              isSubmitting={editBanner ? isUpdating : isAdding}
              onCloseModal={handleModalClose}
            />
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Banner List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex-1 space-y-2 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search banners..."
                  className="pl-9 text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {banners.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: "hsl(25 10% 90%)" }}
                    >
                      <th className="py-3 px-4 font-medium">Order</th>
                      <th className="py-3 px-4 font-medium">Image</th>
                      <th className="py-3 px-4 font-medium">Title</th>
                      <th className="py-3 px-4 font-medium">Subtitle</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr
                        key={banner.id}
                        className="border-b border-muted last:border-0"
                      >
                        <td className="py-3 px-4">{banner.order_column}</td>
                        <td className="py-3 px-4">
                          {banner.banner_image ? (
                            <img
                              src={banner.banner_image}
                              alt={banner.title}
                              className="h-12 w-20 object-cover rounded border"
                            />
                          ) : (
                            <div className="h-12 w-20 flex items-center justify-center rounded border bg-muted">
                              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">{banner.title}</td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="line-clamp-2 text-muted-foreground">
                            {banner.banner_text_1 || "—"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              banner.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {banner.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(banner)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => actions.confirmDelete(banner.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {meta && (
                  <Pagination
                    meta={meta}
                    setPage={setPage}
                    isLoading={isLoading}
                    itemLabel="Banners"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No banners yet</h3>
                <p className="text-muted-foreground mt-1">
                  Add a banner to control the home page hero
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!bannerToDelete} onOpenChange={actions.cancelDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div>
              <p className="mb-2">
                Are you sure you want to delete this banner?
              </p>
              {bannerToDelete && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Title:</p>
                  <p className="text-sm">{bannerToDelete.title}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={actions.cancelDelete}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={actions.handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Index;
