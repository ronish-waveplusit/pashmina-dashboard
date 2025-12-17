import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Edit, Trash2, X } from "lucide-react";

interface VariationAttribute {
  attribute_id: number;
  attribute_value_id: number;
}

interface Variation {
  id?: number; // Optional ID for existing variations
  sku: string;
  price: string;
  sale_price: string;
  quantity: number;
  low_stock_threshold: number;
  status: string;
  attributes: VariationAttribute[];
  image?: File | string; // Can be File or existing URL
}

interface LocalAttribute {
  id: string;
  name: string;
  values: string;
  attribute_id: number;
  attribute_value_ids: number[];
  usedForVariations: boolean;
}

interface Props {
  variations: Variation[];
  attributes: LocalAttribute[];
  onUpdate: (index: number, updates: Partial<Variation>) => void;
  onRemove: (index: number) => void;
  onVariationDeleted?: (variationId: number | undefined) => void; // Callback to notify parent
}

const VariationsList = ({ 
  variations, 
  attributes, 
  onUpdate, 
  onRemove,
  onVariationDeleted 
}: Props) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const variationAttributes = attributes.filter((attr) => attr.usedForVariations);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate(index, { image: file });
    }
  };

  const handleUpdate = (field: keyof Variation, value: any) => {
    if (editingIndex !== null) {
      onUpdate(editingIndex, { [field]: value });
    }
  };

  const handleDelete = (index: number) => {
    const variation = variations[index];
    
    // Notify parent about the deletion if it's an existing variation
    if (variation.id && onVariationDeleted) {
      onVariationDeleted(variation.id);
    }
    
    // Remove from local state
    onRemove(index);
    setEditingIndex(null);
  };

  const getAttributeValueName = (variation: Variation, attrId: number): string => {
    const attr = attributes.find((a) => a.attribute_id === attrId);
    if (!attr) return "";

    const varAttr = variation.attributes.find((a) => a.attribute_id === attrId);
    if (!varAttr) return "";

    const valueNames = attr.values.split(",").map((v) => v.trim());
    const valueIndex = attr.attribute_value_ids.indexOf(varAttr.attribute_value_id);

    return valueIndex >= 0 ? valueNames[valueIndex] : "";
  };

  const getImageUrl = (image: File | string | undefined): string | null => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image instanceof File) return URL.createObjectURL(image);
    return null;
  };

  const editingVariation = editingIndex !== null ? variations[editingIndex] : null;

  return (
    <div className="flex gap-4 h-[calc(100vh-250px)]">
      {/* Variations List */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          editingVariation ? "w-[250px]" : "w-full"
        }`}
      >
        <div className="rounded border border-border bg-card h-full flex flex-col">
          <div className="border-b border-border bg-accent px-4 py-3 flex-shrink-0">
            <h3 className="font-semibold text-foreground">Variants</h3>
          </div>
          <div className="divide-y divide-border overflow-y-auto flex-1">
            {variations.map((variation, index) => {
              const isEditing = editingIndex === index;

              return (
                <div
                  key={variation.id || index}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors ${
                    isEditing ? "bg-accent border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    {variationAttributes.map((attr) => {
                      const valueName = getAttributeValueName(
                        variation,
                        attr.attribute_id
                      );
                      return (
                        <div key={attr.id} className="flex items-center gap-1">
                          {!editingVariation && (
                            <>
                              <span className="text-xs text-muted-foreground">
                                {attr.name}:
                              </span>
                              <span className="text-sm font-medium">{valueName}</span>
                            </>
                          )}
                          {editingVariation && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                {attr.name.slice(0, 1)}:
                              </span>
                              <span className="font-medium ml-1">{valueName}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    {!isEditing && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(index)}
                          className="text-destructive hover:text-destructive h-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingIndex(index)}
                          className="h-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
                        className="h-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editingVariation && editingIndex !== null && (
        <div className="flex-1 rounded border border-border bg-card overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="border-b border-border bg-accent px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Edit Variation</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingIndex(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto h-[calc(100%-57px)]">
            <div className="space-y-6">
              {/* Attribute Values Display */}
              <div className="rounded-lg border border-border bg-accent/30 p-4">
                <h4 className="text-sm font-semibold mb-3">Attributes</h4>
                <div className="space-y-2">
                  {variationAttributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{attr.name}:</span>
                      <span className="font-medium">
                        {getAttributeValueName(editingVariation, attr.attribute_id)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  SKU <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editingVariation.sku}
                  onChange={(e) => handleUpdate("sku", e.target.value)}
                  className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="SKU-001"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Variation Image
                </label>
                <div className="flex items-center gap-4">
                  {editingVariation.image && (
                    <div className="h-24 w-24 overflow-hidden rounded border border-input">
                      <img
                        src={getImageUrl(editingVariation.image) || ''}
                        alt="Variation"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer rounded border border-input bg-background px-4 py-2 text-sm text-foreground hover:bg-accent">
                      {editingVariation.image ? "Change Image" : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, editingIndex)}
                        className="hidden"
                      />
                    </label>
                    {editingVariation.image && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate("image", undefined)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Price <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingVariation.price}
                    onChange={(e) => handleUpdate("price", e.target.value)}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingVariation.sale_price}
                    onChange={(e) => handleUpdate("sale_price", e.target.value)}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Stock Quantity <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={editingVariation.quantity}
                    onChange={(e) =>
                      handleUpdate("quantity", parseInt(e.target.value) || 0)
                    }
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={editingVariation.low_stock_threshold}
                    onChange={(e) =>
                      handleUpdate(
                        "low_stock_threshold",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Status
                </label>
                <Select
                  value={editingVariation.status}
                  onValueChange={(value) => handleUpdate("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingIndex(null)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDelete(editingIndex)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariationsList;