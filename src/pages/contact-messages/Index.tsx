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
import { Search, Mail, X } from "lucide-react";
import { useContactSubmission } from "./_hooks/useContactSubmission";
import Pagination from "../../components/pagination/pagination";
import { Input } from "../../components/ui/input";
import { ITEMS_PER_PAGE } from "../../constants/common";

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
};

const Index = () => {
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
    submissions,
    isLoading,
    isError,
    isDeleting,
    selected,
    toDelete,
    actions,
    meta,
  } = useContactSubmission(filters);

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
        <div>Error loading messages</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start sm:items-center sm:flex-row flex-col gap-4 mt-4">
          <div>
            <h1 className="text-2xl font-semibold md:font-4xl">
              Contact Messages
            </h1>
            <p className="text-muted-foreground mt-1 ">
              Messages submitted through the storefront contact form
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex-1 space-y-2 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search messages..."
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

            {submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: "hsl(25 10% 90%)" }}
                    >
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium">Name</th>
                      <th className="py-3 px-4 font-medium">Subject</th>
                      <th className="py-3 px-4 font-medium">Received</th>
                      <th className="py-3 px-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr
                        key={s.id}
                        className={`border-b border-muted last:border-0 ${
                          s.is_read ? "" : "font-medium bg-muted/30"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              s.is_read
                                ? "bg-muted text-muted-foreground"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {s.is_read ? "Read" : "New"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>{s.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="line-clamp-1">{s.subject || "—"}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(s.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => actions.view(s)}
                            >
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => actions.confirmDelete(s.id)}
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
                    itemLabel="Messages"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No messages yet</h3>
                <p className="text-muted-foreground mt-1">
                  Submissions from the storefront contact form will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View message */}
        <Dialog open={!!selected} onOpenChange={actions.closeView}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected?.subject || "Message"}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Name</span>
                  <span className="col-span-2">{selected.name}</span>
                  <span className="text-muted-foreground">Email</span>
                  <a
                    href={`mailto:${selected.email}`}
                    className="col-span-2 text-blue-600 hover:underline"
                  >
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <>
                      <span className="text-muted-foreground">Phone</span>
                      <span className="col-span-2">{selected.phone}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Received</span>
                  <span className="col-span-2">
                    {formatDate(selected.created_at)}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Message</p>
                  <p className="whitespace-pre-line rounded-md bg-muted p-3">
                    {selected.message}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={actions.closeView}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={!!toDelete} onOpenChange={actions.cancelDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div>
              <p className="mb-2">
                Are you sure you want to delete this message?
              </p>
              {toDelete && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    {toDelete.name} — {toDelete.subject || "No subject"}
                  </p>
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
