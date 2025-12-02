import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {ProductVariation} from "../../../types/product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

interface Props {
  variation: ProductVariation;
  attributeNames: string[];
  onUpdate: (id: string, updates: Partial<ProductVariation>) => void;
  onRemove: (id: string) => void;
  isLast: boolean;
}

const VariationCard = ({ variation, attributeNames, onUpdate, onRemove, isLast }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onUpdate(variation.id, { image: imageUrl });
    }
  };

  const getAttributeValue = (attrName: string) => {
    return variation.attributes[attrName] || "";
  };

  return (
    <div className={`${!isLast ? 'border-b border-border' : ''}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {attributeNames.map((attrName, index) => (
          <Select key={index} value={getAttributeValue(attrName)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={attrName} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={getAttributeValue(attrName)}>
                {getAttributeValue(attrName)}
              </SelectItem>
            </SelectContent>
          </Select>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(variation.id)}
            className="text-destructive hover:text-destructive"
          >
            Remove
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Edit"}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-accent/50 px-4 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full">
              <label className="text-xs font-medium text-muted">Image</label>
              <div className="mt-2 flex items-center gap-4">
                {variation.image && (
                  <div className="h-20 w-20 overflow-hidden rounded border border-input">
                    <img
                      src={variation.image}
                      alt="Variation"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <label className="cursor-pointer rounded border border-input bg-background px-3 py-2 text-xs text-foreground hover:bg-accent">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {variation.image && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate(variation.id, { image: "" })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted">Cost Price</label>
              <input
                type="text"
                value={variation.costPrice}
                onChange={(e) => onUpdate(variation.id, { costPrice: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted">Sale Price</label>
              <input
                type="text"
                value={variation.salePrice}
                onChange={(e) => onUpdate(variation.id, { salePrice: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted">Stock</label>
              <input
                type="text"
                value={variation.stock}
                onChange={(e) => onUpdate(variation.id, { stock: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted">LST</label>
              <input
                type="text"
                value={variation.lst}
                onChange={(e) => onUpdate(variation.id, { lst: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted">SKU</label>
              <input
                type="text"
                value={variation.sku}
                onChange={(e) => onUpdate(variation.id, { sku: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="col-span-full">
              <label className="text-xs font-medium text-muted">Description</label>
              <textarea
                value={variation.description}
                onChange={(e) => onUpdate(variation.id, { description: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted">Weight</label>
              <input
                type="text"
                value={variation.weight}
                onChange={(e) => onUpdate(variation.id, { weight: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted">Status</label>
              <input
                type="text"
                value={variation.status}
                onChange={(e) => onUpdate(variation.id, { status: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariationCard;