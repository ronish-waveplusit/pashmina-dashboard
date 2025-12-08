import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layouts/Layout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, X, Package, ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { ITEMS_PER_PAGE } from "../../constants/common";
import Pagination from "../../components/pagination/pagination";
import { useProductVariation } from "./_hooks/useProductVariation";
import {  ProductVariation } from "../../types/product-variation";

import AddLotModal from "./_components/AddLotModal";
import { useNavigate } from "react-router-dom";

const Index = () => {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortBy, setSortBy] = useState<"none" | "asc" | "desc">("none");
    
    const [isLotModalOpen, setIsLotModalOpen] = useState(false);
    const [isViewLotsModalOpen, setIsViewLotsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);
const navigate=useNavigate();
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
            // Convert the array of lot items to FormData
            const formData = new FormData();
            
            // If lotData is an array, we need to handle multiple items
            if (Array.isArray(lotData)) {
                lotData.forEach((item, index) => {
                    formData.append(`lots[${index}][lotable_type]`, item.lotable_type);
                    formData.append(`lots[${index}][lotable_id]`, item.lotable_id);
                    formData.append(`lots[${index}][imported_date]`, item.imported_date);
                    formData.append(`lots[${index}][quantity_received]`, item.quantity_received.toString());
                });
            } else {
                formData.append('lotable_type', lotData.lotable_type);
                formData.append('lotable_id', lotData.lotable_id);
                formData.append('imported_date', lotData.imported_date);
                formData.append('quantity_received', lotData.quantity_received.toString());
            }

            await addLot(formData);
            setIsLotModalOpen(false);
        } catch (error) {
            console.error("Error creating lot:", error);
        }
    };

    const handleViewProduct = () => {
        navigate('/lot-view')
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
                    <div className="text-lg">Loading product variations...</div>
                </div>
            </Layout>
        );
    }

    if (isError) {
        return (
            <Layout>
                <div className="text-center py-8 text-red-600">
                    Error loading product variations. Please try again.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
                        <p className="text-gray-600 mt-1">Manage all product SKUs and stock</p>
                    </div>
                    <Button
                        onClick={() => setIsLotModalOpen(true)}
                        className="flex items-center gap-2 shadow-lg"
                        disabled={isAddingLot}
                    >
                        <Plus className="h-4 w-4" />
                        {isAddingLot ? "Adding..." : "Add Lot"}
                    </Button>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Products</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalVariations}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Package className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Variations Table Card */}
                <Card className="shadow-md">
                    <CardContent className="p-6">
                        {/* Search & Filters */}
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by product name or SKU..."
                                    className="pl-10 pr-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="w-48">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        {variations.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                                                            onClick={() => handleViewProduct()}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="View Lots"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setIsLotModalOpen(true)}
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

                                {meta && (
                                    <Pagination
                                        meta={meta}
                                        setPage={setPage}
                                        isLoading={isFetching}
                                        itemLabel="variations"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No variations found</h3>
                                <p className="text-gray-600">
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
                onClose={() => setIsLotModalOpen(false)}
                onSubmit={handleLotSubmit}
                products={variations || []}
                isLoading={isLoading}
            />

            
        </Layout>
    );
};

export default Index;