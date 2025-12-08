import { useState, useEffect } from "react";
import { X, Plus, Trash2, Package } from "lucide-react";

interface AddLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  products: any[];
  isLoading: boolean;
}

const AddLotModal = ({ isOpen, onClose, onSubmit, products, isLoading }: AddLotModalProps) => {
  const [lotItems, setLotItems] = useState([
    {
      id: Date.now(),
      lotable_type: "product_variation",
      lotable_id: "",
      imported_date: new Date().toISOString().split('T')[0],
      quantity_received: ""
    }
  ]);

  // Debug logging
  useEffect(() => {
    console.log('AddLotModal - products:', products);
    console.log('AddLotModal - products length:', products?.length);
    console.log('AddLotModal - isLoading:', isLoading);
  }, [products, isLoading]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setLotItems([
        {
          id: Date.now(),
          lotable_type: "product_variation",
          lotable_id: "",
          imported_date: new Date().toISOString().split('T')[0],
          quantity_received: ""
        }
      ]);
    }
  }, [isOpen]);

  const addLotItem = () => {
    setLotItems([
      ...lotItems,
      {
        id: Date.now(),
        lotable_type: "product_variation",
        lotable_id: "",
        imported_date: new Date().toISOString().split('T')[0],
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
      item.lotable_id && item.imported_date && item.quantity_received
    );

    if (!isValid) {
      alert("Please fill in all fields");
      return;
    }

    // Format data for submission (remove temporary id)
    const formattedData = lotItems.map(({ id, ...rest }) => ({
      ...rest,
      quantity_received: parseInt(rest.quantity_received)
    }));

    onSubmit(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Lot</h2>
              <p className="text-sm text-gray-600 mt-1">Import products and update inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading products...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {lotItems.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Product #{index + 1}
                      </h3>
                      {lotItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLotItem(item.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Product Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.lotable_id}
                          onChange={(e) => updateLotItem(item.id, 'lotable_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={isLoading || !products || products.length === 0}
                        >
                          <option value="">
                            {isLoading 
                              ? "Loading products..." 
                              : !products || products.length === 0 
                                ? "No products available" 
                                : "Select Product"}
                          </option>
                          {products?.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.product_name} - {product.sku}
                            </option>
                          ))}
                        </select>
                        {!isLoading && products && (
                          <p className="text-xs text-gray-500 mt-1">
                            {products.length} products available
                          </p>
                        )}
                      </div>

                      {/* Imported Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imported Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={item.imported_date}
                          onChange={(e) => updateLotItem(item.id, 'imported_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Quantity Received */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity Received <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity_received}
                          onChange={(e) => updateLotItem(item.id, 'quantity_received', e.target.value)}
                          placeholder="Enter quantity"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add More Button */}
            {!isLoading && (
              <button
                type="button"
                onClick={addLotItem}
                className="mt-4 w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Product
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total Products: <span className="font-semibold">{lotItems.length}</span>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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