import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Plus, Search, X, Package, ArrowUpDown, ArrowUp, ArrowDown, ShoppingBag, Edit, Trash2, Eye } from "lucide-react";
import { useProduct } from "./_hooks/useProduct";
import { useTransactionCategory } from "../category/_hooks/useCategory";
import { ITEMS_PER_PAGE } from "../../constants/common";
import Pagination from "../../components/pagination/pagination";
import ImagePreview from "../../components/ui/ImagePreview";
import { ProductResponse } from "../../types/product";
import { useNavigate } from "react-router-dom";

// Mobile Product Card Component
// Add type annotation
const MobileProductCard = ({ 
    product, 
  
    actions, 
    getProductStatus, 
    getTotalStock, 
    getPriceRange 
}: {
    product: ProductResponse;
    index: number;
    page: number;
    actions: any;
    getProductStatus: (product: ProductResponse) => string;
    getTotalStock: (product: ProductResponse) => number;
    getPriceRange: (product: ProductResponse) => string;
}) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex gap-3 mb-3">
            {/* Image */}
            <div className="flex-shrink-0">
                {product.featured_image ? (
                    <ImagePreview
                        src={product.featured_image}
                        alt={product.name}
                        size="md"
                    />
                ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No Image
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">{product.name}</h3>
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                            getProductStatus(product) === "Active"
                                ? "bg-green-100 text-green-800"
                                : getProductStatus(product) === "Partial"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {getProductStatus(product)}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">Code: {product.code || "N/A"}</p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.variation_type === "color"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                    }`}>
                        {product.variation_type === "color" ? "Simple" : "Variable"}
                    </span>
                    <span className="text-gray-600">
                        Stock: <span className={`font-medium ${getTotalStock(product) <= 10 ? "text-red-600" : "text-gray-900"}`}>
                            {getTotalStock(product)}
                        </span>
                    </span>
                </div>
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs sm:text-sm">
            <div>
                <span className="text-gray-500">Category:</span>
                <p className="font-medium text-gray-900 truncate">
                    {Array.isArray(product.category) && product.category.length > 0
                        ? product.category.slice(0, 2).map(cat => cat.name).join(", ")
                        : "N/A"}
                </p>
            </div>
            <div>
                <span className="text-gray-500">Price:</span>
                <p className="font-medium text-gray-900">{getPriceRange(product)}</p>
            </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => actions.view(product.id)}
                className="flex-1 text-xs h-8"
            >
                <Eye className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">View</span>
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => actions.edit(product.id)}
                className="flex-1 text-xs h-8"
            >
                <Edit className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => actions.confirmDelete(product.id)}
                className="flex-1 text-xs h-8"
            >
                <Trash2 className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Delete</span>
            </Button>
        </div>
    </div>
);

const Index = () => {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState<"none" | "asc" | "desc">("none");
    const navigate = useNavigate();

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
            ...(selectedCategory !== "all" && { category: selectedCategory }),
            ...(sortBy !== "none" && { sort_by: "name", sort_order: sortBy }),
        }),
        [page, debouncedSearchQuery, selectedStatus, selectedCategory, sortBy]
    );

    const {
        products: allProducts,
        isLoading,
        isError,
        isDeleting,
        productToDelete,
        actions,
        meta,
    } = useProduct(filters);

    const {
        transactionCategories,
        isLoading: isCategoriesLoading,
    } = useTransactionCategory({
        per_page: 100,
    });

    const categories = useMemo(() => {
        return transactionCategories.map(cat => cat.name);
    }, [transactionCategories]);

    const filteredAndSortedProducts = allProducts;
    const totalProducts = meta?.total || allProducts.length;

    const getProductStatus = (product: ProductResponse): string => {
        if (!product.variations || product.variations.length === 0) return "N/A";
        const activeVariations = product.variations.filter((v) => v.status === "active");
        if (activeVariations.length === product.variations.length) return "Active";
        if (activeVariations.length > 0) return "Partial";
        return "Inactive";
    };

    const getTotalStock = (product: ProductResponse): number => {
        if (!product.variations || product.variations.length === 0) return 0;
        return product.variations.reduce((sum, v) => sum + (v.quantity || 0), 0);
    };

    const getPriceRange = (product: ProductResponse): string => {
        if (!product.variations || product.variations.length === 0) return "N/A";
        const prices = product.variations.map((v) => parseFloat(v.sale_price || v.price || "0"));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice === maxPrice) return `Rs. ${minPrice.toFixed(2)}`;
        return `Rs. ${minPrice.toFixed(2)} - Rs. ${maxPrice.toFixed(2)}`;
    };

    const activeProducts = allProducts.filter(p => getProductStatus(p) === "Active").length;
    const inactiveProducts = allProducts.filter(p => getProductStatus(p) === "Inactive").length;

    const clearSearch = () => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
    };

    const toggleSort = () => {
        setSortBy((prev) => {
            if (prev === "none") return "asc";
            if (prev === "asc") return "desc";
            return "none";
        });
    };

    const getSortIcon = () => {
        if (sortBy === "asc") return <ArrowUp className="h-4 w-4" />;
        if (sortBy === "desc") return <ArrowDown className="h-4 w-4" />;
        return <ArrowUpDown className="h-4 w-4" />;
    };

    if (isLoading || isCategoriesLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-sm sm:text-lg">Loading products...</div>
                </div>
            </Layout>
        );
    }

    if (isError) {
        return (
            <Layout>
                <div className="text-center py-8 text-red-600 text-sm sm:text-base px-4">
                    Error loading products. Please try again.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mt-3 sm:mt-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product inventory</p>
                    </div>
                    <Button
                        onClick={() => navigate("/product-form")}
                        className="flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Total</p>
                                    <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{totalProducts}</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                                    <Package className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Active</p>
                                    <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{activeProducts}</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                                    <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
                        <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Inactive</p>
                                    <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{inactiveProducts}</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                                    <Package className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Product List Card */}
                <Card className="shadow-md">
                    <CardHeader className="border-b bg-gray-50 p-4 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl font-semibold">Product List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                        {/* Search and Filters */}
                        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {/* Search Bar */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-10 pr-10 text-sm h-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filters Row */}
                            <div className="flex gap-2 sm:gap-3">
                                {/* Status Filter */}
                                <div className="flex-1">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => {
                                            setSelectedStatus(e.target.value);
                                            setPage(1);
                                        }}
                                        className="w-full h-10 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                {/* Category Filter */}
                                <div className="flex-1">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            setPage(1);
                                        }}
                                        className="w-full h-10 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isCategoriesLoading}
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleSort}
                                    className="flex-shrink-0 h-10 px-3"
                                >
                                    {getSortIcon()}
                                </Button>
                            </div>
                        </div>

                        {/* Products Display */}
                        {filteredAndSortedProducts.length > 0 ? (
                            <>
                                {/* Mobile View - Cards */}
                                <div className="block lg:hidden">
                                    {filteredAndSortedProducts.map((product, index) => (
                                        <MobileProductCard
                                            key={product.id}
                                            product={product}
                                            index={index}
                                            page={page}
                                            actions={actions}
                                            getProductStatus={getProductStatus}
                                            getTotalStock={getTotalStock}
                                            getPriceRange={getPriceRange}
                                        />
                                    ))}
                                </div>

                                {/* Desktop View - Table */}
                                <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.N</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <button
                                                        onClick={toggleSort}
                                                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                                    >
                                                        Name
                                                        {getSortIcon()}
                                                    </button>
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price Range</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredAndSortedProducts.map((product, index) => (
                                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-4 text-sm text-gray-900">
                                                        {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        {product.featured_image ? (
                                                            <ImagePreview
                                                                src={product.featured_image}
                                                                alt={product.name}
                                                                size="md"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        {product.slug && (
                                                            <div className="text-xs text-gray-500">{product.slug}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-600">
                                                        {product.code || "N/A"}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-600">
                                                        {Array.isArray(product.category) && product.category.length > 0
                                                            ? product.category
                                                                .slice(0, 2)               
                                                                .map(cat => cat.name)
                                                                .join(", ")
                                                            : "N/A"}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${product.variation_type === "color"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-blue-100 text-blue-800"
                                                            }`}>
                                                            {product.variation_type === "color" ? "Simple" : "Variable"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{getPriceRange(product)}</td>
                                                    <td className="py-4 px-4 text-sm text-gray-900">
                                                        <span className={`font-medium ${getTotalStock(product) <= 10 ? "text-red-600" : "text-gray-900"
                                                            }`}>
                                                            {getTotalStock(product)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getProductStatus(product) === "Active"
                                                                ? "bg-green-100 text-green-800"
                                                                : getProductStatus(product) === "Partial"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {getProductStatus(product)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => actions.view(product.id)}
                                                                className="text-xs"
                                                            >
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => actions.edit(product.id)}
                                                                className="text-xs"
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => actions.confirmDelete(product.id)}
                                                                className="text-xs"
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {meta && (
                                    <div className="mt-4">
                                        <Pagination
                                            meta={meta}
                                            setPage={setPage}
                                            isLoading={isLoading}
                                            itemLabel="products"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 sm:py-16">
                                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                                <p className="text-sm sm:text-base text-gray-600 px-4">
                                    {searchQuery || selectedStatus !== "all" || selectedCategory !== "all"
                                        ? "Try adjusting your filters"
                                        : "Add products to see them listed here"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!productToDelete} onOpenChange={actions.cancelDelete}>
                    <DialogContent className="max-w-[90vw] sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div>
                            <p className="text-sm sm:text-base text-gray-700">
                                Are you sure you want to delete the product "
                                {productToDelete?.name}"?
                            </p>
                            {productToDelete?.featured_image && (
                                <div className="mt-4">
                                    <img
                                        src={productToDelete.featured_image}
                                        alt={productToDelete.name}
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded mx-auto border-2 border-gray-200"
                                    />
                                </div>
                            )}
                            <p className="text-xs sm:text-sm text-gray-500 mt-4">
                                This action cannot be undone. This will delete the product and all its variations.
                            </p>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={actions.cancelDelete} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={actions.handleDelete}
                                disabled={isDeleting}
                                className="w-full sm:w-auto"
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