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
import { Plus, Search, X, FileText, ArrowUpDown, ArrowUp, ArrowDown, Receipt } from "lucide-react";
import { useChalani } from "./_hooks/useChalani";
import { ITEMS_PER_PAGE } from "../../constants/common";
import Pagination from "../../components/pagination/pagination";
import { ChalanListItem } from "../../types/chalani";
import { useNavigate } from "react-router-dom";

const Index = () => {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
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
            ...(sortBy !== "none" && { sort_by: "chalan_no", sort_order: sortBy }),
        }),
        [page, debouncedSearchQuery, sortBy]
    );

    const {
        chalaniList,
        isLoading,
        isError,
        isDeleting,
        chalaniToDelete,
        actions,
        meta,
    } = useChalani(filters);

    // Calculate total amount from all chalani
    const totalAmount = useMemo(() => {
        return chalaniList.reduce((sum, chalani) => sum + parseFloat(chalani.total_amount || "0"), 0);
    }, [chalaniList]);

    // Calculate total chalani count
    const totalChalani = meta?.total || chalaniList.length;

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

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    // Format currency
    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        return `Rs. ${num.toFixed(2)}`;
    };

    // Get discount display
    const getDiscountDisplay = (chalani: ChalanListItem) => {
        if (!chalani.discount_value || chalani.discount_value === "0") return "No Discount";
        if (chalani.discount_type === "percentage") {
            return `${chalani.discount_value}%`;
        }
        return formatCurrency(chalani.discount_value);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading chalani...</div>
                </div>
            </Layout>
        );
    }

    if (isError) {
        return (
            <Layout>
                <div className="text-center py-8 text-red-600">
                    Error loading chalani. Please try again.
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
                        <h1 className="text-3xl font-bold text-gray-900">Chalani</h1>
                        <p className="text-gray-600 mt-1">Manage your chalani records</p>
                    </div>
                    <Button
                        onClick={() => navigate("/add-chalani")}
                        className="flex items-center gap-2 shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Add Chalani
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Chalani</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalChalani}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {formatCurrency(totalAmount)}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Receipt className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chalani List Card */}
                <Card className="shadow-md">
                    <CardHeader className="border-b bg-gray-50">
                        <CardTitle className="text-xl font-semibold">Chalani List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search chalani by number or name..."
                                    className="pl-10 pr-10"
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
                        </div>

                        {/* Chalani Table */}
                        {chalaniList.length > 0 ? (
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
                                                    Chalan No
                                                    {getSortIcon()}
                                                </button>
                                            </th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Issue Date
                                            </th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Total Amount
                                            </th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Discount
                                            </th>
                                            <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {chalaniList.map((chalani, index) => (
                                            <tr key={chalani.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4 text-sm text-gray-900">
                                                    {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {chalani.chalan_no}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-900">
                                                    {chalani.name}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {formatDate(chalani.issue_date)}
                                                </td>
                                                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                                    {formatCurrency(chalani.total_amount)}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                        chalani.discount_value && chalani.discount_value !== "0"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                        {getDiscountDisplay(chalani)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => actions.view(chalani.id)}
                                                            className="text-xs"
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => actions.confirmDelete(chalani.id)}
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
                                {meta && (
                                    <Pagination
                                        meta={meta}
                                        setPage={setPage}
                                        isLoading={isLoading}
                                        itemLabel="chalani"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No chalani found</h3>
                                <p className="text-gray-600">
                                    {searchQuery
                                        ? "Try adjusting your search"
                                        : "Add chalani to see them listed here"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!chalaniToDelete} onOpenChange={actions.cancelDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div>
                            <p className="text-gray-700">
                                Are you sure you want to delete chalani "
                                {chalaniToDelete?.chalan_no}"?
                            </p>
                            {chalaniToDelete && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Name:</span>
                                            <span className="font-medium">{chalaniToDelete.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Issue Date:</span>
                                            <span className="font-medium">
                                                {formatDate(chalaniToDelete.issue_date)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-medium">
                                                {formatCurrency(chalaniToDelete.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <p className="text-sm text-gray-500 mt-4">
                                This action cannot be undone. This will permanently delete the chalani record.
                            </p>
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