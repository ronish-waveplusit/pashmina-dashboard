import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layouts/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Search, X, Inbox, Mail, Eye, Trash2, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { useEnquiry, useEnquiryDetail } from "./_hooks/useEnquiry";
import { ITEMS_PER_PAGE } from "../../constants/common";
import Pagination from "../../components/pagination/pagination";
import { Enquiry, EnquiryStatus } from "../../types/enquiry";
import { ChalaniPrefillState } from "../../types/chalani";

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  contacted: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  closed: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  converted: "bg-green-100 text-green-800 hover:bg-green-100",
};

const Index = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
      sort_by: "created_at",
      sort_order: sortOrder,
      ...(statusFilter !== "all" && { status: statusFilter }),
    }),
    [page, debouncedSearchQuery, sortOrder, statusFilter]
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  const handleStatusFilterChange = (value: EnquiryStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
  };

  const {
    enquiries,
    meta,
    isLoading,
    isError,
    isDeleting,
    isUpdating,
    enquiryToDelete,
    actions,
  } = useEnquiry(filters);

  const {
    enquiry: selected,
    isLoading: isLoadingDetail,
  } = useEnquiryDetail(selectedId);

  const totalEnquiries = meta?.total ?? enquiries.length;
  const newCount = useMemo(
    () => enquiries.filter((e) => e.status === "new").length,
    [enquiries]
  );

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  // Convert an enquiry into a pre-filled Chalani form
  const handleConvertToChalani = (enquiry: Enquiry) => {
    // Already converted -> open the created chalani instead of the create page
    if (enquiry.chalani_id) {
      navigate(`/chalani/${enquiry.chalani_id}`);
      return;
    }

    const prefill: ChalaniPrefillState = {
      enquiry_id: enquiry.id,
      name: enquiry.name,
      items: enquiry.items
        .map((item) => ({
          variationId: item.product_variation_id ?? item.product_variant_id ?? 0,
          item,
        }))
        .filter(({ variationId }) => variationId > 0)
        .map(({ variationId, item }) => ({
          product_variation_id: variationId,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: parseFloat(item.price ?? "0") || 0,
        })),
    };
    navigate("/add-chalani", { state: { fromEnquiry: prefill } });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: string | null) =>
    price ? `Rs. ${parseFloat(price).toFixed(2)}` : "—";

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">
              Loading enquiries...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-600 text-sm">
          Error loading enquiries. Please try again.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="mt-3 sm:mt-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Customer enquiries sent from the storefront
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Total Enquiries
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {totalEnquiries}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                  <Inbox className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    New (this page)
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {newCount}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-amber-100 rounded-full">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List Card */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gray-50 px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">
              Enquiry List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Search & Filters */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone or email..."
                  className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-10 text-xs sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  handleStatusFilterChange(value as EnquiryStatus | "all")
                }
              >
                <SelectTrigger className="w-full sm:w-44 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {enquiries.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          S.N
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Pieces
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <button
                            onClick={toggleSortOrder}
                            className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-gray-900"
                          >
                            Received
                            {sortOrder === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </th>
                        <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enquiries.map((enquiry, index) => (
                        <tr
                          key={enquiry.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {(page - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {enquiry.name}
                            </div>
                            {enquiry.email && (
                              <div className="text-xs text-gray-500">
                                {enquiry.email}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {enquiry.phone}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {enquiry.items.length}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={`text-xs capitalize ${STATUS_STYLES[enquiry.status]}`}>
                              {enquiry.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatDate(enquiry.created_at)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedId(enquiry.id)}
                                className="text-xs"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConvertToChalani(enquiry)}
                                disabled={
                                  !enquiry.chalani_id &&
                                  !enquiry.items.some(
                                    (i) => i.product_variation_id ?? i.product_variant_id
                                  )
                                }
                                className="text-xs text-coffee border-coffee hover:bg-coffee/10"
                              >
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                {enquiry.chalani_id ? "View Chalani" : "Chalani"}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => actions.confirmDelete(enquiry)}
                                className="text-xs"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {meta && (
                  <div className="mt-4">
                    <Pagination
                      meta={meta}
                      setPage={setPage}
                      isLoading={isLoading}
                      itemLabel="enquiry"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <Inbox className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No enquiries found
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Enquiries sent from the storefront will appear here"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {selected ? `Enquiry from ${selected.name}` : "Enquiry Detail"}
              </DialogTitle>
            </DialogHeader>

            {isLoadingDetail && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border" />
              </div>
            )}

            {!isLoadingDetail && selected && (
              <div className="space-y-5">
                {/* Customer info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selected.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 break-all">
                      {selected.email || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Received</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selected.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge className={`text-xs capitalize ${STATUS_STYLES[selected.status]}`}>
                      {selected.status}
                    </Badge>
                  </div>
                </div>

                {/* Message */}
                {selected.message && (
                  <div className="rounded-lg border bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Message</p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {selected.message}
                    </p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Pieces enquired ({selected.items.length})
                  </p>
                  <div className="space-y-2">
                    {selected.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded border p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {[item.color, item.size].filter(Boolean).join(" / ") ||
                              "—"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status control */}
                {selected.chalani_id ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Status</p>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Badge className={`text-xs capitalize ${STATUS_STYLES.converted}`}>
                        Converted
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-coffee border-coffee hover:bg-coffee/10"
                        onClick={() => navigate(`/chalani/${selected.chalani_id}`)}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        View Chalani
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Update status</p>
                    <Select
                      value={selected.status}
                      onValueChange={(value) =>
                        actions.updateStatus(selected.id, value as EnquiryStatus)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!enquiryToDelete}
          onOpenChange={(open) => !open && actions.cancelDelete()}
        >
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                Confirm Delete
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete the enquiry from "
              {enquiryToDelete?.name}"? This action cannot be undone.
            </p>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={actions.cancelDelete}
                className="w-full sm:w-auto text-sm"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={actions.handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto text-sm"
                size="sm"
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
