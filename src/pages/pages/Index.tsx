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
import { Plus, Search, FileText, X } from "lucide-react";
import { usePage } from "./_hooks/usePage";
import { PageForm } from "./_components/PageForm";
import { Page } from "../../types/page";
import Pagination from "../../components/pagination/pagination";
import { Input } from "../../components/ui/input";
import { ITEMS_PER_PAGE } from "../../constants/common";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPage, setEditPage] = useState<Page | null>(null);
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
    pages,
    isLoading,
    isError,
    isAdding,
    isUpdating,
    pageToDelete,
    actions,
    isDeleting,
    meta,
  } = usePage(filters);

  const handleEdit = (item: Page) => {
    setEditPage(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditPage(null);
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
        <div>Error loading pages</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start sm:items-center sm:flex-row flex-col gap-4 mt-4">
          <div>
            <h1 className="text-2xl font-semibold md:font-4xl">Pages</h1>
            <p className="text-muted-foreground mt-1 ">
              Manage CMS pages such as the About page
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center "
          >
            <Plus className="mr-2" />
            Add Page
          </Button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editPage ? "Edit Page" : "Add New Page"}
              </DialogTitle>
            </DialogHeader>
            <PageForm
              key={editPage?.id ?? "add"}
              initialData={editPage}
              onSubmit={
                editPage
                  ? (data) => actions.update(editPage.id, data)
                  : actions.add
              }
              isSubmitting={editPage ? isUpdating : isAdding}
              onCloseModal={handleModalClose}
            />
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Page List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex-1 space-y-2 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search pages..."
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

            {pages.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: "hsl(25 10% 90%)" }}
                    >
                      <th className="py-3 px-4 font-medium">S.N</th>
                      <th className="py-3 px-4 font-medium">Title</th>
                      <th className="py-3 px-4 font-medium">Slug</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-muted last:border-0"
                      >
                        <td className="py-3 px-4">
                          {(page - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="py-3 px-4 font-medium">{item.title}</td>
                        <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
                          {item.slug}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => actions.confirmDelete(item.id)}
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
                    itemLabel="Pages"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No pages yet</h3>
                <p className="text-muted-foreground mt-1">
                  Create a page titled “About” to populate the storefront About
                  page
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!pageToDelete} onOpenChange={actions.cancelDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div>
              <p className="mb-2">Are you sure you want to delete this page?</p>
              {pageToDelete && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Title:</p>
                  <p className="text-sm">{pageToDelete.title}</p>
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
