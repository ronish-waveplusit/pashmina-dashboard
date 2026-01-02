import { useState, useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useMemo } from "react";
import { Button } from "../../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Plus, Search, UserPlus, X, Edit, Trash2 } from "lucide-react";
import { useTransactionCategory } from "./_hooks/useCategory";
import { CategoryForm } from "./_components/CategoryForm";
import { CategoryPayload } from "../../types/category";
import Pagination from "../../components/pagination/pagination";
import { Input } from "../../components/ui/input";
import { ITEMS_PER_PAGE } from "../../constants/common";
import ImagePreview from "../../components/ui/ImagePreview";

const Index = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTransactionCategory, setEditTransactionCategory] =
        useState<CategoryPayload | null>(null);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    // Debounce search query
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

    // Filtered list for the table
    const {
        transactionCategories,
        isLoading,
        isError,
        isAdding,
        isUpdating,
        referralToDelete,
        actions,
        isDeleting,
        meta,
    } = useTransactionCategory(filters);

   
    const {
        transactionCategories: allCategories,
        isLoading: isLoadingAllCategories,
    } = useTransactionCategory({ 
        page: 1, 
        per_page: 100, 
        search: "" 
    });

    const handleEdit = (TransactionCategory: CategoryPayload) => {
        setEditTransactionCategory(TransactionCategory);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditTransactionCategory(null);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-base sm:text-lg">Loading categories...</div>
                </div>
            </Layout>
        );
    }

    if (isError) {
        return (
            <Layout>
                <div className="text-center py-8 text-red-600 px-4">
                    Error loading Product Category. Please try again.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
                {/* Header */}
                <div className="flex justify-between items-start sm:items-center sm:flex-row flex-col gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
                            Product Category
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
                            Track and manage Product Category
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                    >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Add Product Category
                    </Button>
                </div>

                {/* Add/Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                    <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                                {editTransactionCategory
                                    ? "Edit Product Category"
                                    : "Add New Product Category"}
                            </DialogTitle>
                        </DialogHeader>
                        <CategoryForm
                            key={editTransactionCategory?.id ?? "add"}
                            initialData={editTransactionCategory}
                            onSubmit={
                                editTransactionCategory
                                    ? (data) => actions.update(editTransactionCategory.id, data)
                                    : actions.add
                            }
                            isSubmitting={editTransactionCategory ? isUpdating : isAdding}
                            onCloseModal={handleModalClose}
                            categories={allCategories}
                            isLoadingCategories={isLoadingAllCategories}
                        />
                    </DialogContent>
                </Dialog>

                {/* Category List Card */}
                <Card className="shadow-md">
                    <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="text-lg sm:text-xl">Category List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                        {/* Search */}
                        <div className="relative flex-1 space-y-2 mb-4 sm:mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search Category..."
                                    className="pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm sm:text-base h-9 sm:h-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {transactionCategories.length > 0 ? (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">S.N</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Parent Category</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {transactionCategories.map((transactionCategory, index) => (
                                                <tr
                                                    key={transactionCategory.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-4 px-4 text-sm text-gray-900">
                                                        {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        {transactionCategory.featured_image ? (
                                                            <ImagePreview
                                                                src={transactionCategory.featured_image}
                                                                alt={transactionCategory.name}
                                                                size="md" 
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                                        {transactionCategory.name}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-600">
                                                        {transactionCategory?.parent?.name || "-"}
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(transactionCategory)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    actions.confirmDelete(transactionCategory.id)
                                                                }
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

                                {/* Mobile Card View */}
                                <div className="lg:hidden space-y-3">
                                    {transactionCategories.map((transactionCategory, index) => (
                                        <Card key={transactionCategory.id} className="shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-3 sm:p-4">
                                                <div className="space-y-3">
                                                    {/* Header with Image and Info */}
                                                    <div className="flex gap-3">
                                                        {/* Image */}
                                                        <div className="flex-shrink-0">
                                                            {transactionCategory.featured_image ? (
                                                                <ImagePreview
                                                                    src={transactionCategory.featured_image}
                                                                    alt={transactionCategory.name}
                                                                    size="md" 
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                                                        {transactionCategory.name}
                                                                    </h3>
                                                                    {transactionCategory?.parent?.name && (
                                                                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                                                                            Parent: {transactionCategory.parent.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                                    #{(page - 1) * ITEMS_PER_PAGE + index + 1}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 text-xs sm:text-sm"
                                                            onClick={() => handleEdit(transactionCategory)}
                                                        >
                                                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="flex-1 text-xs sm:text-sm"
                                                            onClick={() =>
                                                                actions.confirmDelete(transactionCategory.id)
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {meta && (
                                    <div className="mt-4">
                                        <Pagination
                                            meta={meta}
                                            setPage={setPage}
                                            isLoading={isLoading}
                                            itemLabel="categories"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 sm:py-16">
                                <UserPlus className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-base sm:text-lg font-medium">
                                    No Product Category yet
                                </h3>
                                <p className="text-sm sm:text-base text-muted-foreground mt-1 px-4">
                                    {searchQuery 
                                        ? "No categories match your search"
                                        : "Add Product Category to see them listed here"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Modal */}
                <Dialog open={!!referralToDelete} onOpenChange={actions.cancelDelete}>
                    <DialogContent className="max-w-[95vw] sm:max-w-md mx-3 sm:mx-auto">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <p className="text-sm sm:text-base">
                                Are you sure you want to delete the category <span className="font-semibold">"{referralToDelete?.name}"</span>?
                            </p>
                            {referralToDelete?.featured_image && (
                                <div className="flex justify-center">
                                    <img
                                        src={referralToDelete.featured_image}
                                        alt={referralToDelete.name}
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded"
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                            <Button 
                                variant="outline" 
                                onClick={actions.cancelDelete}
                                className="w-full sm:w-auto text-sm sm:text-base"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={actions.handleDelete}
                                disabled={isDeleting}
                                className="w-full sm:w-auto text-sm sm:text-base"
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