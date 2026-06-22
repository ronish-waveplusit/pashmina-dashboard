import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/layouts/Layout";
import { Card, CardContent } from "../../../components/ui/card";
import { Plus, Trash2, Package, Search, Loader2, ArrowLeft } from "lucide-react";
import { useProductVariation } from "../_hooks/useProductVariation";

interface LotItem {
    id: number;
    lotable_id: string;
    quantity_received: string;
    import_price: string;
}

const AddLotPage = () => {
    const navigate = useNavigate();

    const [lotItems, setLotItems] = useState<LotItem[]>([
        { id: Date.now(), lotable_id: "", quantity_received: "", import_price: "" },
    ]);
    const [importedDate, setImportedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    // Refs to anchor the dropdown to its trigger button
    const triggerRefs = useRef<Record<number, HTMLButtonElement | null>>({});
    const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({
        top: 0,
        left: 0,
        width: 320,
    });

    const filters = useMemo(() => ({ page: 1, per_page: 100 }), []);
    const lotFilters = useMemo(() => ({ page: 1, per_page: 10 }), []);

    const {
        products,
        isLoading,
        isError,
        addLot,
        isAddingLot,
    } = useProductVariation(filters, lotFilters, false);

    // Recalculate dropdown position whenever it opens or the window scrolls/resizes
    useEffect(() => {
        if (openDropdown === null) return;

        const updatePosition = () => {
            const btn = triggerRefs.current[openDropdown];
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            setDropdownStyle({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: Math.max(rect.width, 320),
            });
        };

        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [openDropdown]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleOutside = () => setOpenDropdown(null);
        if (openDropdown !== null) {
            document.addEventListener("click", handleOutside);
            return () => document.removeEventListener("click", handleOutside);
        }
    }, [openDropdown]);

    const getFiltered = (itemId: number) => {
        const q = (searchQueries[itemId] || "").toLowerCase();
        if (!q) return products || [];
        return (products || []).filter(
            (p) =>
                p.product_name?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q)
        );
    };

    const selectProduct = (
        itemId: number,
        product: { id: number; product_name: string; sku: string }
    ): void => {
        setLotItems((prev) =>
            prev.map((i) =>
                i.id === itemId ? { ...i, lotable_id: product.id.toString() } : i
            )
        );
        setOpenDropdown(null);
        setSearchQueries((prev) => ({ ...prev, [itemId]: "" }));
    };

    const updateQty = (id: number, val: string): void => {
        setLotItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity_received: val } : i))
        );
    };
    const updateImportPrice = (id: number, val: string): void => {
        setLotItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, import_price: val } : i))
        );
    };
    const addRow = (): void => {
        setLotItems((prev) => [
            ...prev,
            { id: Date.now(), lotable_id: "", quantity_received: "", import_price: "" },
        ]);
    };
    const removeRow = (id: number): void => {
        if (lotItems.length > 1)
            setLotItems((prev) => prev.filter((i) => i.id !== id));
    };

    const getProduct = (lotable_id: string) =>
        products?.find((p) => p.id.toString() === lotable_id);

    const handleSubmit = async (): Promise<void> => {
        const isValid =
            lotItems.every((i) => i.lotable_id && i.quantity_received && i.import_price) &&
            importedDate;
        if (!isValid) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const formData = new FormData();

            if (lotItems.length === 1) {
                formData.append("lotable_type", "product_variation");
                formData.append("lotable_id", lotItems[0].lotable_id);
                formData.append("imported_date", importedDate);
                formData.append("quantity_received", lotItems[0].quantity_received);
                formData.append("import_price", lotItems[0].import_price);
            } else {
                formData.append("lotable_type", "product_variation");
                formData.append("imported_date", importedDate);
                lotItems.forEach((item, index) => {
                    formData.append(`items[${index}][lotable_id]`, item.lotable_id);
                    formData.append(`items[${index}][quantity_received]`, item.quantity_received);
                    formData.append(`items[${index}][import_price]`, item.import_price);
                });
            }

            await addLot(formData);
            navigate(-1);
        } catch (error) {
            console.error("Error creating lot:", error);
        }
    };

    if (isError) {
        return (
            <Layout>
                <div className="text-center py-8 text-red-600 px-4">
                    Error loading products. Please try again.
                </div>
            </Layout>
        );
    }

    const totalQty = lotItems.reduce(
        (s, i) => s + (parseInt(i.quantity_received) || 0),
        0
    );

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                            title="Go back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                Add New Lot
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
                                Import products and update inventory
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="shadow-md">
                    <CardContent className="p-0">
                        {/* Imported Date bar */}
                        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                            <label className="text-xs font-medium text-gray-600 block mb-1.5">
                                Imported Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={importedDate}
                                onChange={(e) => setImportedDate(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                style={{ width: "200px" }}
                            />
                        </div>

                        {/* Table area */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading products...</span>
                            </div>
                        ) : (
                            <div className="px-6 pt-4 pb-2">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="pb-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">
                                                S.N
                                            </th>
                                            <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pl-3 w-1/3">
                                                Particulars
                                            </th>
                                            <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pl-3 w-1/4">
                                                Import Price
                                            </th>
                                            <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pl-3 w-1/4">
                                                Quantity Received
                                            </th>
                                            <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-14">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lotItems.map((item, idx) => {
                                            const product = getProduct(item.lotable_id);
                                            

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    {/* S.N */}
                                                    <td className="py-3 text-center text-sm text-gray-400">
                                                        {idx + 1}
                                                    </td>

                                                    {/* Particulars — searchable dropdown */}
                                                    <td className="py-3 pl-3">
                                                        <button
                                                            ref={(el) => { triggerRefs.current[item.id] = el; }}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdown(
                                                                    openDropdown === item.id ? null : item.id
                                                                );
                                                            }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-left"
                                                        >
                                                            <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                            <span
                                                                className={
                                                                    product ? "text-gray-900 truncate" : "text-gray-400"
                                                                }
                                                            >
                                                                {product ? product.product_name : "Search product..."}
                                                            </span>
                                                        </button>
                                                    </td>

                                                    <td className="py-3 pl-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.import_price}
                                                            onChange={(e) => updateImportPrice(item.id, e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-[90%] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                                                        />
                                                    </td>

                                                    <td className="py-3 pl-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity_received}
                                                            onChange={(e) => updateQty(item.id, e.target.value)}
                                                            placeholder="0"
                                                            className="w-[35%] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                                                        />
                                                    </td>

                                                    {/* Delete */}
                                                    <td className="py-3 text-right pr-1">
                                                        {lotItems.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRow(item.id)}
                                                                className="p-1.5 hover:bg-red-50 rounded-md transition-colors group"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-gray-300 group-hover:text-red-500 transition-colors" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Add Row */}
                                <div className="flex justify-end mt-3 mb-1 pb-3 border-b border-gray-100">
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Row
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer / subtotal */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span>
                                        Total Items:{" "}
                                        <span className="font-semibold text-gray-800">{lotItems.length}</span>
                                    </span>
                                    <span>
                                        Total Qty:{" "}
                                        <span className="font-semibold text-gray-800">{totalQty}</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="flex-1 sm:flex-none px-5 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isAddingLot || isLoading}
                                        className="flex-1 sm:flex-none px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAddingLot ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Package className="h-4 w-4" />
                                                Create Lot
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dropdown portal — rendered outside the table so it's never clipped */}
            {openDropdown !== null && (() => {
                const item = lotItems.find((i) => i.id === openDropdown);
                if (!item) return null;
                const filtered = getFiltered(item.id);

                return (
                    <div
                        className="fixed bg-white border border-gray-200 rounded-md shadow-xl z-[9999]"
                        style={{
                            top: dropdownStyle.top,
                            left: dropdownStyle.left,
                            width: dropdownStyle.width,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search input */}
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-md">
                            <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search products..."
                                value={searchQueries[item.id] || ""}
                                onChange={(e) =>
                                    setSearchQueries((prev) => ({
                                        ...prev,
                                        [item.id]: e.target.value,
                                    }))
                                }
                                onKeyDown={(e) => e.stopPropagation()}
                                className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        {/* Results list */}
                        <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
                            {filtered.length > 0 ? (
                                filtered.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => selectProduct(item.id, p)}
                                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="text-sm font-medium text-gray-800">{p.product_name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{p.sku}</div>
                                    </button>
                                ))
                            ) : (
                                <div className="py-6 text-center text-sm text-gray-400">
                                    {searchQueries[item.id] ? "No products found" : "Start typing to search"}
                                </div>
                            )}
                        </div>

                        {/* Footer count */}
                        <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 rounded-b-md">
                            <span className="text-xs text-gray-400">
                                {products?.length ?? 0} products available
                            </span>
                        </div>
                    </div>
                );
            })()}
        </Layout>
    );
};

export default AddLotPage;