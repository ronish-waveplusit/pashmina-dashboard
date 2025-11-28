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
import { Plus, Search, UserPlus, X } from "lucide-react";
import { useTransactionCategory } from "./_hooks/useCategory";
import { CategoryForm } from "./_components/CategoryForm";
import { CategoryPayload } from "../../types/category";
import { useHasPermission } from "../../utils/helper/permissionUtils";
import Pagination from "../../components/pagination/pagination";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { ITEMS_PER_PAGE } from "../../constants/common";

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
            setPage(1); // Reset to first page when search changes
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

    // Permission checks using the helper function
    const canCreate = useHasPermission("transaction-category:create");
    //   const canView = useHasPermission("transaction-category:view");
    const canEdit = useHasPermission("transaction-category:update");
    const canDelete = useHasPermission("transaction-category:delete");

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

    // Helper function to find parent category name
    const getParentCategoryName = (parentId: string | number | null | undefined) => {
        if (!parentId) return "—";
        const parent = transactionCategories.find((cat) => cat.id === parentId);
        return parent ? parent.name : "—";
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
                <div>Error loading Product Category</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-start sm:items-center sm:flex-row flex-col gap-4 mt-4">
                    <div>
                        <h1 className="text-xl font-semibold md:font-3xl">
                            Product Category
                        </h1>
                        <p className="text-muted-foreground mt-1 ">
                            Track and manage Product Category
                        </p>
                    </div>
                    {canCreate && (
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center "
                        >
                            <Plus className="mr-2" />
                            Add Product Category
                        </Button>
                    )}
                </div>

                <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editTransactionCategory
                                    ? "Edit Product Category"
                                    : "Add New Product Category"}
                            </DialogTitle>
                        </DialogHeader>
                        <CategoryForm
                            initialData={editTransactionCategory}
                            onSubmit={
                                editTransactionCategory
                                    ? (data) => actions.update(editTransactionCategory.id, data)
                                    : actions.add
                            }
                            isSubmitting={editTransactionCategory ? isUpdating : isAdding}
                            isModalOpen={isModalOpen}
                            onCloseModal={handleModalClose}
                            categories={transactionCategories}
                        />
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader>
                        <CardTitle>Product Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative flex-1 space-y-2 mb-4">
                            <Label htmlFor="search" className="text-sm sm:text-base">
                                Search Category
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search Category..."
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

                        {transactionCategories.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-3 px-4 font-medium">Image</th>
                                            <th className="py-3 px-4 font-medium">Name</th>
                                            <th className="py-3 px-4 font-medium">Parent Category</th>
                                            <th className="py-3 px-4 font-medium text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactionCategories.map((transactionCategory) => (
                                            <tr
                                                key={transactionCategory.id}
                                                className="border-b border-muted last:border-0"
                                            >
                                                <td className="py-3 px-4">
                                                    {transactionCategory.featured_image ? (
                                                        <img
                                                            src={transactionCategory.featured_image}
                                                            alt={transactionCategory.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {transactionCategory.name}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getParentCategoryName(transactionCategory.parent_category_id)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        {canEdit && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(transactionCategory)}
                                                            >
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {canDelete && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    actions.confirmDelete(transactionCategory.id)
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                        )}
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
                                        itemLabel="categories"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <UserPlus className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">
                                    No Product Category yet
                                </h3>
                                <p className="text-muted-foreground mt-1">
                                    Add Product Category to see them listed here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={!!referralToDelete} onOpenChange={actions.cancelDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div>
                            <p>
                                Are you sure you want to delete the category "{referralToDelete?.name}"?
                            </p>
                            {referralToDelete?.featured_image && (
                                <div className="mt-4">
                                    <img
                                        src={referralToDelete.featured_image}
                                        alt={referralToDelete.name}
                                        className="w-24 h-24 object-cover rounded mx-auto"
                                    />
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