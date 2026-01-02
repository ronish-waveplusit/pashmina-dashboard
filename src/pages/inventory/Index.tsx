import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layouts/Layout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, X, Package, ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { ITEMS_PER_PAGE } from "../../constants/common";
import Pagination from "../../components/pagination/pagination";
import { useProductVariation } from "./_hooks/useProductVariation";
import { ProductVariation } from "../../types/product-variation";
import AddLotModal from "./_components/AddLotModal";
import { useNavigate } from "react-router-dom";

const Index = () => {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortBy, setSortBy] = useState<"none" | "asc" | "desc">("none");

    const [isLotModalOpen, setIsLotModalOpen] = useState(false);
    const [isViewLotsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);
    const navigate = useNavigate();

    // Debounce search
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
            ...(selectedStatus !== "all" && { status: selectedStatus }),
            ...(sortBy !== "none" && { sort_by: "product_name", sort_order: sortBy }),
        }),
        [page, debouncedSearchQuery, selectedStatus, sortBy]
    );

    const lotFilters = useMemo(
        () => ({
            page: 1,
            per_page: 100,
            ...(selectedProductId && { search: selectedProductId.toString() }),
        }),
        [selectedProductId]
    );

    const {
        products: variations,
        isLoading,
        isFetching,
        isError,
        meta,
        addLot,
        isAddingLot,
    } = useProductVariation(filters, lotFilters, isViewLotsModalOpen);

    const totalVariations = meta?.total || variations.length;

    const clearSearch = () => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
    };

    const handleLotSubmit = async (lotData: any) => {
        try {
            const formData = new FormData();

            if (lotData.items) {
                formData.append('lotable_type', lotData.lotable_type);
                formData.append('imported_date', lotData.imported_date);
                lotData.items.forEach((item: any, index: number) => {
                    formData.append(`items[${index}][lotable_id]`, item.lotable_id.toString());
                    formData.append(`items[${index}][quantity_received]`, item.quantity_received.toString());
                });
            } else {
                formData.append('lotable_type', lotData.lotable_type);
                formData.append('lotable_id', lotData.lotable_id.toString());
                formData.append('imported_date', lotData.imported_date);
                formData.append('quantity_received', lotData.quantity_received.toString());
            }

            await addLot(formData);
            setIsLotModalOpen(false);
            setSelectedProductId(null);
        } catch (error) {
            console.error("Error creating lot:", error);
        }
    };

    const handleViewProduct = (id: string | number) => {
        navigate(`/lot-view/${id}`);
    };

    const handleAddToLot = (productId: string | number) => {
        setSelectedProductId(productId);
        setIsLotModalOpen(true);
    };

    const handleAddLotFromHeader = () => {
        setSelectedProductId(null);
        setIsLotModalOpen(true);
    };

    const handleCloseLotModal = () => {
        setIsLotModalOpen(false);
        setSelectedProductId(null);
    };

    const toggleSort = () => {
        setSortBy((prev) => (prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"));
    };

    const getSortIcon = () => {
        if (sortBy === "asc") return <ArrowUp className="h-4 w-4" />;
        if (sortBy === "desc") return <ArrowDown className="h-4 w-4" />;
        return <ArrowUpDown className="h-4 w-4" />;
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-base sm:text-lg">Loading product variations...</div>
                </div>
            </Layout>
        );
    }

    if (isError) {
        return (
            <Layout>
                <div className="text-center py-8 text-red-600 px-4">
                    Error loading product variations. Please try again.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Inventory</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">Manage all product SKUs and stock</p>
                    </div>
                    <Button
                        onClick={handleAddLotFromHeader}
                        className="flex items-center gap-2 shadow-lg w-full sm:w-auto text-sm sm:text-base"
                        disabled={isAddingLot}
                    >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {isAddingLot ? "Adding..." : "Add Lot"}
                    </Button>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-4 sm:pt-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Products</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{totalVariations}</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Variations Table Card */}
                <Card className="shadow-md">
                    <CardContent className="p-3 sm:p-6">
                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by product name or SKU..."
                                    className="pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm sm:text-base h-9 sm:h-10"
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

                            <div className="w-full sm:w-48">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full h-9 sm:h-10 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Table - Desktop */}
                        {variations.length > 0 ? (
                            <>
                                <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    S.N
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <button
                                                        onClick={toggleSort}
                                                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                                    >
                                                        Product Name
                                                        {getSortIcon()}
                                                    </button>
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    SKU
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Sale Price
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Stock
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Stock Status
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {variations?.map((variation: ProductVariation, index) => (
                                                <tr key={variation.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-4 text-sm text-gray-900">
                                                        {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                                        {variation.product_name}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                                                        {variation.sku}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-900">
                                                        Rs. {parseFloat(variation.price || "0").toFixed(2)}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm font-medium text-green-600">
                                                        Rs. {parseFloat(variation.sale_price || variation.price || "0").toFixed(2)}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm">
                                                        <span
                                                            className={`font-medium ${variation.quantity <= variation.low_stock_threshold
                                                                ? "text-red-600"
                                                                : "text-gray-900"
                                                                }`}
                                                        >
                                                            {variation.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variation.stock_status === "in_stock"
                                                                ? "bg-green-100 text-green-800"
                                                                : variation.stock_status === "low_stock"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {variation?.stock_status?.replace("_", " ")?.charAt(0).toUpperCase() +
                                                                variation?.stock_status?.replace("_", " ")?.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variation?.status === "active"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {variation?.status?.charAt(0).toUpperCase() + variation.status?.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleViewProduct(variation.id)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                title="View Lots"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddToLot(variation.id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                title="Add to Lot"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="lg:hidden space-y-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs text-gray-600 font-medium">
                                            Showing {variations.length} items
                                        </span>
                                        <button
                                            onClick={toggleSort}
                                            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 rounded border border-gray-300"
                                        >
                                            Sort
                                            {getSortIcon()}
                                        </button>
                                    </div>

                                    {variations?.map((variation: ProductVariation, index) => (
                                        <Card key={variation.id} className="shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-3 sm:p-4">
                                                <div className="space-y-2.5">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                                                {variation.product_name}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-gray-600 font-mono mt-0.5">
                                                                {variation.sku}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            #{(page - 1) * ITEMS_PER_PAGE + index + 1}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Price:</span>
                                                            <p className="font-medium text-gray-900">
                                                                Rs. {parseFloat(variation.price || "0").toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Sale Price:</span>
                                                            <p className="font-medium text-green-600">
                                                                Rs. {parseFloat(variation.sale_price || variation.price || "0").toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Stock:</span>
                                                            <p className={`font-semibold ${variation.quantity <= variation.low_stock_threshold
                                                                ? "text-red-600"
                                                                : "text-gray-900"
                                                                }`}>
                                                                {variation.quantity} units
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Stock Status:</span>
                                                            <div className="mt-0.5">
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variation.stock_status === "in_stock"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : variation.stock_status === "low_stock"
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : "bg-red-100 text-red-800"
                                                                        }`}
                                                                >
                                                                    {variation?.stock_status?.replace("_", " ")?.charAt(0).toUpperCase() +
                                                                        variation?.stock_status?.replace("_", " ")?.slice(1)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variation?.status === "active"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {variation?.status?.charAt(0).toUpperCase() + variation.status?.slice(1)}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleViewProduct(variation.id)}
                                                                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                title="View Lots"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddToLot(variation.id)}
                                                                className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                title="Add to Lot"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {meta && (
                                    <div className="mt-4">
                                        <Pagination
                                            meta={meta}
                                            setPage={setPage}
                                            isLoading={isFetching}
                                            itemLabel="variations"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 sm:py-16">
                                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No variations found</h3>
                                <p className="text-sm sm:text-base text-gray-600 px-4">
                                    {searchQuery || selectedStatus !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "No product variations available yet"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AddLotModal
                isOpen={isLotModalOpen}
                onClose={handleCloseLotModal}
                onSubmit={handleLotSubmit}
                products={variations || []}
                isLoading={isLoading}
                preSelectedProductId={selectedProductId}
            />
        </Layout>
    );
};

export default Index;