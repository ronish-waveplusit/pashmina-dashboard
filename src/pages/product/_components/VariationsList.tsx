import { useState } from "react";
import { ProductVariation, ProductAttribute } from "../../../types/product";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Edit, Trash2, X } from "lucide-react";

interface Props {
  variations: ProductVariation[];
  attributes: ProductAttribute[];
  onUpdate: (id: string, updates: Partial<ProductVariation>) => void;
  onRemove: (id: string) => void;
}

const VariationsList = ({ variations, attributes, onUpdate, onRemove }: Props) => {
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);

  const attributeNames = attributes
    .filter(attr => attr.usedForVariations)
    .map(attr => attr.name);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, variationId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onUpdate(variationId, { image: imageUrl });
      // Update the editing variation state
      if (editingVariation?.id === variationId) {
        setEditingVariation({ ...editingVariation, image: imageUrl });
      }
    }
  };

  const handleUpdate = (field: keyof ProductVariation, value: any) => {
    if (editingVariation) {
      const updated = { ...editingVariation, [field]: value };
      setEditingVariation(updated);
      onUpdate(editingVariation.id, { [field]: value });
    }
  };

  const getAttributeValue = (variation: ProductVariation, attrName: string) => {
    return variation.attributes[attrName] || "";
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-250px)]">
      {/* Variations List - Retracts when editing */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          editingVariation ? 'w-[250px]' : 'w-full'
        }`}
      >
        <div className="rounded border border-border bg-card h-full flex flex-col">
          <div className="border-b border-border bg-accent px-4 py-3 flex-shrink-0">
            <h3 className="font-semibold text-foreground">Variants</h3>
          </div>
          <div className="divide-y divide-border overflow-y-auto flex-1">
            {variations.map((variation) => {
              const isEditing = editingVariation?.id === variation.id;
              
              return (
                <div 
                  key={variation.id} 
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors ${
                    isEditing ? 'bg-accent border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    {attributeNames.map((attrName, index) => (
                      <div key={index} className="flex items-center gap-1">
                        {!editingVariation && (
                          <>
                            <span className="text-xs text-muted-foreground">{attrName}:</span>
                            <span className="text-sm font-medium">{getAttributeValue(variation, attrName)}</span>
                          </>
                        )}
                        {editingVariation && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">{attrName.slice(0, 1)}:</span>
                            <span className="font-medium ml-1">{getAttributeValue(variation, attrName)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center  flex-shrink-0">
                    {!isEditing && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(variation.id)}
                          className="text-destructive hover:text-destructive h-8"
                        >
                         <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVariation(variation)}
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
                        onClick={() => setEditingVariation(null)}
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

      {/* Edit Form - Appears in the space created */}
      {editingVariation && (
        <div className="flex-1 rounded border border-border bg-card overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="border-b border-border bg-accent px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Edit Variation</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingVariation(null)}
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
      {attributeNames.map((attrName) => (
        <div key={attrName} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{attrName}:</span>
          <span className="font-medium">{getAttributeValue(editingVariation, attrName)}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Image Upload */}
  <div>
    <label className="text-sm font-medium text-foreground block mb-2">Featured Image</label>
    <div className="flex items-center gap-4">
      {editingVariation.image && (
        <div className="h-24 w-24 overflow-hidden rounded border border-input">
          <img
            src={editingVariation.image}
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
            onChange={(e) => handleImageUpload(e, editingVariation.id)}
            className="hidden"
          />
        </label>
        {editingVariation.image && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdate("image", "")}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Image
          </Button>
        )}
      </div>
    </div>
  </div>

  {/* Two Column Grid for Other Fields */}
  <div className="grid grid-cols-2 gap-4">
    {/* Price */}
    <div>
      <label className="text-sm font-medium text-foreground block mb-2">Price</label>
      <input
        type="text"
        value={editingVariation.costPrice}
        onChange={(e) => handleUpdate("costPrice", e.target.value)}
        className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="0.00"
      />
    </div>

    {/* Sale Price */}
    <div>
      <label className="text-sm font-medium text-foreground block mb-2">Sale Price</label>
      <input
        type="text"
        value={editingVariation.salePrice}
        onChange={(e) => handleUpdate("salePrice", e.target.value)}
        className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="0.00"
      />
    </div>

    {/* Stock Quantity */}
    <div>
      <label className="text-sm font-medium text-foreground block mb-2">Stock Quantity</label>
      <input
        type="text"
        value={editingVariation.stock}
        onChange={(e) => handleUpdate("stock", e.target.value)}
        className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="0"
      />
    </div>

    {/* Low Stock Threshold */}
    <div>
      <label className="text-sm font-medium text-foreground block mb-2">Low Stock Threshold</label>
      <input
        type="text"
        value={editingVariation.lst}
        onChange={(e) => handleUpdate("lst", e.target.value)}
        className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="5"
      />
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-2 pt-4 border-t">
    <Button
      variant="outline"
      className="flex-1"
      onClick={() => setEditingVariation(null)}
    >
      Close
    </Button>
    <Button
      variant="destructive"
      className="flex-1"
      onClick={() => {
        onRemove(editingVariation.id);
        setEditingVariation(null);
      }}
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