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
import { Plus, Search, HelpCircle, X } from "lucide-react";
import { useFAQ } from "./_hooks/useFaq";
import { FAQForm } from "./_components/FaqForm";
import { FAQ } from "../../types/faq";
import Pagination from "../../components/pagination/pagination";
import { Input } from "../../components/ui/input";
import { ITEMS_PER_PAGE } from "../../constants/common";

const Index = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editFAQ, setEditFAQ] = useState<FAQ | null>(null);
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

    const {
        faqs,
        isLoading,
        isError,
        isAdding,
        isUpdating,
        faqToDelete,
        actions,
        isDeleting,
        meta,
    } = useFAQ(filters);

    const handleEdit = (faq: FAQ) => {
        setEditFAQ(faq);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditFAQ(null);
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
                <div>Error loading FAQs</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-start sm:items-center sm:flex-row flex-col gap-4 mt-4">
                    <div>
                        <h1 className="text-2xl font-semibold md:font-4xl">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-muted-foreground mt-1 ">
                            Manage and organize your FAQs
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center "
                    >
                        <Plus className="mr-2" />
                        Add FAQ
                    </Button>
                </div>

                <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editFAQ ? "Edit FAQ" : "Add New FAQ"}
                            </DialogTitle>
                        </DialogHeader>
                        <FAQForm
                            key={editFAQ?.id ?? "add"}
                            initialData={editFAQ}
                            onSubmit={
                                editFAQ
                                    ? (data) => actions.update(editFAQ.id, data)
                                    : actions.add
                            }
                            isSubmitting={editFAQ ? isUpdating : isAdding}
                            onCloseModal={handleModalClose}
                        />
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">FAQ List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative flex-1 space-y-2 mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search FAQs..."
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

                        {faqs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: "hsl(25 10% 90%)" }}>
                                            <th className="py-3 px-4 font-medium">S.N</th>
                                            <th className="py-3 px-4 font-medium">Question</th>
                                            <th className="py-3 px-4 font-medium">Answer</th>
                                            <th className="py-3 px-4 font-medium text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faqs.map((faq, index) => (
                                            <tr
                                                key={faq.id}
                                                className="border-b border-muted last:border-0"
                                            >
                                                <td className="py-3 px-4">{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                                <td className="py-3 px-4 max-w-md">
                                                    <div className="line-clamp-2">{faq.question}</div>
                                                </td>
                                                <td className="py-3 px-4 max-w-lg">
                                                    <div className="line-clamp-2 text-muted-foreground">
                                                        {faq.answer}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(faq)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => actions.confirmDelete(faq.id)}
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
                                        itemLabel="FAQs"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No FAQs yet</h3>
                                <p className="text-muted-foreground mt-1">
                                    Add FAQs to see them listed here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={!!faqToDelete} onOpenChange={actions.cancelDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div>
                            <p className="mb-2">
                                Are you sure you want to delete this FAQ?
                            </p>
                            {faqToDelete && (
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <p className="font-medium mb-2">Question:</p>
                                    <p className="text-sm mb-3">{faqToDelete.question}</p>
                                    <p className="font-medium mb-2">Answer:</p>
                                    <p className="text-sm text-muted-foreground">
                                        {faqToDelete.answer}
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