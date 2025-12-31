import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/layouts/Layout";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { useChalani } from "../_hooks/useChalani";
import { useProductVariation } from "../../inventory/_hooks/useProductVariation";
import { CreateChalanPayload, CreateChalanItemPayload } from "../../../types/chalani";
import { toast } from "../../../components/ui/use-toast";

interface ChalanItem extends CreateChalanItemPayload {
    id: string;
    product_name?: string;
    lot_number?: string;
}

const ChalaniForm = () => {
    const navigate = useNavigate();
    const { actions, isAdding } = useChalani();

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [openSelectId, setOpenSelectId] = useState<string | null>(null);

    const { products, isLoading: isLoadingProducts } = useProductVariation({
        per_page: 100,
        search: debouncedSearch,
    });

    // Debounce search with 500ms delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 600);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Form state
    const [isGuide, setIsGuide] = useState(true);
    const [name, setName] = useState("");
    const [issueDate, setIssueDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [dueDate, setDueDate] = useState("");
    const [applyDiscount, setApplyDiscount] = useState(false);
    const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">("percentage");
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [items, setItems] = useState<ChalanItem[]>([]);

    // Add initial empty row
    useEffect(() => {
        if (items.length === 0) {
            addNewRow();
        }
    }, []);

    // Reset search when select closes
    const handleOpenChange = (open: boolean, itemId: string) => {
        if (open) {
            setOpenSelectId(itemId);
        } else {
            setOpenSelectId(null);
            setSearchQuery("");
        }
    };

    // Add new item row
    const addNewRow = () => {
        const newItem: ChalanItem = {
            id: `temp-${Date.now()}-${Math.random()}`,
            product_variation_id: 0,
            quantity: 1,
            unit_price: 0,
            total_price: 0,
        };
        setItems([...items, newItem]);
    };

    // Remove item row
    const removeRow = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id));
        } else {
            toast({
                variant: "destructive",
                title: "Cannot Remove",
                description: "At least one item is required",
            });
        }
    };

    // Update item field
    const updateItem = (id: string, field: keyof ChalanItem, value: any) => {
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };

                    // If product is selected, auto-fill unit price
                    if (field === "product_variation_id") {
                        const selectedProduct = products.find((p) => p.id === parseInt(value));
                        if (selectedProduct) {
                            updatedItem.unit_price = parseFloat(selectedProduct.sale_price || selectedProduct.price || "0");
                            updatedItem.product_name = selectedProduct.product_name || "";
                            updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
                        }
                    }

                    // Calculate total price when quantity or unit_price changes
                    if (field === "quantity" || field === "unit_price") {
                        updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
                    }

                    return updatedItem;
                }
                return item;
            })
        );
    };

    // Calculate subtotal
    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + item.total_price, 0);
    };

    // Calculate discount amount
    const calculateDiscountAmount = () => {
        if (!applyDiscount) return 0;
        const subtotal = calculateSubtotal();
        if (discountType === "percentage") {
            return (subtotal * discountValue) / 100;
        }
        return discountValue;
    };

    // Calculate grand total
    const calculateGrandTotal = () => {
        return calculateSubtotal() - calculateDiscountAmount();
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Customer name is required",
            });
            return;
        }

        if (!issueDate) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Issue date is required",
            });
            return;
        }

        // Validate items
        const validItems = items.filter(
            (item) => item.product_variation_id > 0 && item.quantity > 0
        );

        if (validItems.length === 0) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "At least one valid item is required",
            });
            return;
        }

        // Prepare payload
        const payload: CreateChalanPayload = {
            is_guide: isGuide,
            name: name.trim(),
            issue_date: issueDate,
            total_amount: calculateGrandTotal(),
            discount_type: applyDiscount ? discountType : null,
            discount_value: applyDiscount ? discountValue : 0,
            chalan_items: validItems.map((item) => ({
                product_variation_id: item.product_variation_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
            })),
        };
        try {
            const result = await actions.add(payload);
            toast({
                title: "Success",
                description: "Chalani created successfully",
            });

            navigate(`/chalani/${result.id}`);
        } catch (error) {
            console.error("Failed to create chalani:", error);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate("/chalani");
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-6">
                <Card className="shadow-lg">
                    <CardContent className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">NEW MONALISA PASHMINA</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Amrit Marg, Kathmandu 44600, Nepal
                            </p>
                            <p className="text-sm text-gray-600">Tel: 9849289801</p>
                        </div>

                        {/* Title Bar */}
                        <div className="bg-coffee text-white text-center py-3 mb-6 rounded">
                            <h2 className="text-lg font-semibold">NEW CHALANI / DELIVERY SLIP</h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Form Fields Row 1 */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Is Guide <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is-guide"
                                            checked={isGuide}
                                            onCheckedChange={(checked) => setIsGuide(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="is-guide"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Mark as Guide
                                        </label>
                                    </div>
                                </div>

                                {/* Customer Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Customer <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Enter customer name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Form Fields Row 2 */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                {/* Issue Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Issue Date <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Due Date (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4">Items</h3>

                                {/* Items Table */}
                                <div className="overflow-x-auto rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-12">
                                                    S.N
                                                </th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                                                    Particulars
                                                </th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-40">
                                                    Quantity
                                                </th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-40">
                                                    Unit Price
                                                </th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-32">
                                                    Total
                                                </th>
                                                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 w-20">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {items.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm text-gray-900">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Select
                                                            value={item.product_variation_id > 0 ? item.product_variation_id.toString() : ""}
                                                            onValueChange={(value) =>
                                                                updateItem(item.id, "product_variation_id", value)
                                                            }
                                                            onOpenChange={(open) => handleOpenChange(open, item.id)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select product..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {/* Search Input */}

                                                                <div className="flex items-center px-3 py-2 border-b sticky top-0 bg-white z-10"
                                                                style={{ borderColor: "hsl(25 10% 90%)" }}
                                                                >
                                                                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search products..."
                                                                        value={searchQuery}
                                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                                        className="flex-1 outline-none text-sm"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onKeyDown={(e) => {
                                                                            e.stopPropagation();
                                                                        }}
                                                                        autoFocus={openSelectId === item.id}
                                                                    />
                                                                    {isLoadingProducts && (
                                                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                                    )}
                                                                </div>

                                                                {/* Products List */}
                                                                <div className="max-h-[200px] overflow-y-auto">
                                                                    {products.length > 0 ? (
                                                                        products.map((product) => (
                                                                            <SelectItem
                                                                                key={product.id}
                                                                                value={product.id.toString()}
                                                                            >
                                                                                <div className="flex flex-col">
                                                                                    <span>
                                                                                        {product.product_name
                                                                                            ? `${product.product_name}${product.sku ? ` - ${product.sku}` : ""}`
                                                                                            : "Unknown"}
                                                                                    </span>


                                                                                </div>
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <div className="py-6 text-center text-sm text-gray-500">
                                                                            {isLoadingProducts ? "Loading..." : searchQuery ? "No products found" : "Start typing to search"}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </SelectContent>
                                                        </Select>
                                                        {/* {item.product_name && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {item.product_name}
                                                            </div>
                                                        )}
                                                        {item.lot_number && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Lot: {item.lot_number}
                                                            </div>
                                                        )} */}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateItem(item.id, "quantity", parseInt(e.target.value) || 0)
                                                            }
                                                            className="w-full"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">Rs.</span>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unit_price}
                                                                onChange={(e) =>
                                                                    updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-gray-900">
                                                            NPR {item.total_price.toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeRow(item.id)}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Add Row Button */}
                                <Button
                                    type="button"
                                    onClick={addNewRow}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Row
                                </Button>
                            </div>

                            {/* Subtotal and Discount Section */}
                            <div className="flex justify-end mb-6">
                                <div className="w-[100%] space-y-4">
                                    {/* Subtotal */}
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Subtotal:</span>
                                        <span className="text-xl font-bold">
                                            NPR {calculateSubtotal().toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Apply Discount Checkbox */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="apply-discount"
                                            checked={applyDiscount}
                                            onCheckedChange={(checked) => setApplyDiscount(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="apply-discount"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Apply discount
                                        </label>
                                    </div>

                                    {/* Discount Fields */}
                                    {applyDiscount && (
                                        <div className="border-t pt-4"
                                            style={{ borderColor: "hsl(25 10% 90%)" }}
                                        >
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                {/* Discount Type */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Discount Type
                                                    </label>
                                                    <Select
                                                        value={discountType}
                                                        onValueChange={(value) =>
                                                            setDiscountType(value as "percentage" | "fixed_amount")
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                            <SelectItem value="fixed_amount">Fixed (NPR)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Discount Value */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Value
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={discountValue}
                                                            onChange={(e) =>
                                                                setDiscountValue(parseFloat(e.target.value) || 0)
                                                            }
                                                        />
                                                        {discountType === "percentage" && (
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                                %
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Discount Amount */}
                                            <div className="flex justify-between items-center text-red-600">
                                                <span className="font-medium">Discount:</span>
                                                <span className="font-semibold">
                                                    -NPR {calculateDiscountAmount().toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Grand Total */}
                                    <div className="border-t pt-4"
                                        style={{ borderColor: "hsl(25 10% 90%)" }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold">Grand Total:</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                NPR {calculateGrandTotal().toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isAdding}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isAdding} className="bg-coffee">
                                    {isAdding ? (
                                        <>
                                            <span className="mr-2">Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Chalani
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ChalaniForm;