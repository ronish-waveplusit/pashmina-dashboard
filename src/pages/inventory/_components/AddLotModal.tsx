import { useState, useEffect } from "react";
import { X, Plus, Trash2, Package, Search, Loader2 } from "lucide-react";
import { Select,SelectTrigger,SelectContent,SelectValue,SelectItem } from "../../../components/ui/select";

interface AddLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  products: any[];
  isLoading: boolean;
  preSelectedProductId?: string | number | null;
}

const AddLotModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  products, 
  isLoading,
  preSelectedProductId = null 
}: AddLotModalProps) => {
  const [lotItems, setLotItems] = useState([
    {
      id: Date.now(),
      lotable_id: "",
      quantity_received: ""
    }
  ]);
  const [importedDate, setImportedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openSelectId, setOpenSelectId] = useState<number | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter products based on debounced search
  const filteredProducts = products?.filter(product => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      product.product_name?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Debug logging
  useEffect(() => {
    console.log('AddLotModal - products:', products);
    console.log('AddLotModal - products length:', products?.length);
    console.log('AddLotModal - isLoading:', isLoading);
    console.log('AddLotModal - preSelectedProductId:', preSelectedProductId);
  }, [products, isLoading, preSelectedProductId]);

  useEffect(() => {
    if (isOpen) {
      // Set pre-selected product if provided
      if (preSelectedProductId) {
        setLotItems([
          {
            id: Date.now(),
            lotable_id: preSelectedProductId.toString(),
            quantity_received: ""
          }
        ]);
      } else {
        // Reset form when modal opens without pre-selection
        setLotItems([
          {
            id: Date.now(),
            lotable_id: "",
            quantity_received: ""
          }
        ]);
      }
      setImportedDate(new Date().toISOString().split('T')[0]);
      setSearchQuery("");
      setDebouncedSearch("");
    }
  }, [isOpen, preSelectedProductId]);

  const handleOpenChange = (open: boolean, itemId: number) => {
    if (open) {
      setOpenSelectId(itemId);
      setSearchQuery("");
    } else {
      setOpenSelectId(null);
      setSearchQuery("");
    }
  };

  const addLotItem = () => {
    setLotItems([
      ...lotItems,
      {
        id: Date.now(),
        lotable_id: preSelectedProductId ? preSelectedProductId.toString() : "",
        quantity_received: ""
      }
    ]);
  };

  const removeLotItem = (id: number) => {
    if (lotItems.length > 1) {
      setLotItems(lotItems.filter(item => item.id !== id));
    }
  };

  const updateLotItem = (id: number, field: string, value: string) => {
    setLotItems(lotItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = () => {
    // Validate all fields are filled
    const isValid = lotItems.every(item => 
      item.lotable_id && item.quantity_received
    ) && importedDate;

    if (!isValid) {
      alert("Please fill in all fields");
      return;
    }

    // Format data based on number of items
    let formattedData;
    
    if (lotItems.length === 1) {
      // Single item payload
      formattedData = {
        lotable_type: "product_variation",
        lotable_id: parseInt(lotItems[0].lotable_id),
        imported_date: importedDate,
        quantity_received: parseInt(lotItems[0].quantity_received)
      };
    } else {
      // Multiple items payload
      formattedData = {
        lotable_type: "product_variation",
        imported_date: importedDate,
        items: lotItems.map(item => ({
          lotable_id: parseInt(item.lotable_id),
          quantity_received: parseInt(item.quantity_received)
        }))
      };
    }

    onSubmit(formattedData);
  };

  if (!isOpen) return null;

  const isProductLocked = !!preSelectedProductId;
  const selectedProduct = preSelectedProductId 
    ? products?.find(p => p.id.toString() === preSelectedProductId.toString())
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Lot</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                {isProductLocked && selectedProduct
                  ? `Adding lot for: ${selectedProduct.product_name} (${selectedProduct.sku})`
                  : "Import products and update inventory"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Common Imported Date Field */}
            <div className="mb-4 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Imported Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={importedDate}
                onChange={(e) => setImportedDate(e.target.value)}
                className="w-full max-w-xs px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="text-gray-500">Loading products...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {lotItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-3 items-start">
                      {/* Product Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Product <span className="text-red-500">*</span>
                        </label>
                        {isProductLocked ? (
                          <div className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                            {selectedProduct 
                              ? `${selectedProduct.product_name} - ${selectedProduct.sku}`
                              : "Product not found"}
                          </div>
                        ) : (
                          <Select
                            value={item.lotable_id || ""}
                            onValueChange={(value: string) =>
                              updateLotItem(item.id, "lotable_id", value)
                            }
                            onOpenChange={(open: boolean) => handleOpenChange(open, item.id)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select product..." />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Search Input */}
                              <div 
                                className="flex items-center px-3 py-2 border-b sticky top-0 bg-white z-10"
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
                                {isLoading && (
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                )}
                              </div>

                              {/* Products List */}
                              <div className="max-h-[200px] overflow-y-auto">
                                {filteredProducts.length > 0 ? (
                                  filteredProducts.map((product) => (
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
                                    {isLoading ? "Loading..." : searchQuery ? "No products found" : "Start typing to search"}
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        )}
                        {!isLoading && products && !isProductLocked && (
                          <p className="text-xs text-gray-500 mt-1">
                            {products.length} products available
                          </p>
                        )}
                        {isProductLocked && (
                          <p className="text-xs text-blue-600 mt-1">
                            Product locked for this lot
                          </p>
                        )}
                      </div>

                      {/* Quantity Received */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Quantity Received <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity_received}
                          onChange={(e) => updateLotItem(item.id, 'quantity_received', e.target.value)}
                          placeholder="Enter quantity"
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="flex items-end h-full pt-6">
                        {lotItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLotItem(item.id)}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add More Button */}
            {!isLoading && !isProductLocked && (
              <button
                type="button"
                onClick={addLotItem}
                className="mt-3 w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Product
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total Items: <span className="font-semibold">{lotItems.length}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <Package className="h-4 w-4" />
                  Create Lot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLotModal;