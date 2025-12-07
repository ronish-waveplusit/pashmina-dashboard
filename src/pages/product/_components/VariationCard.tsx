import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface VariationAttribute {
  attribute_id: number;
  attribute_value_id: number;
}

interface Variation {
  sku: string;
  price: string;
  sale_price: string;
  quantity: number;
  low_stock_threshold: number;
  status: string;
  attributes: VariationAttribute[];
  image?: File | string;
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
  variation: Variation;
  index: number;
  attributes: LocalAttribute[];
  onUpdate: (index: number, updates: Partial<Variation>) => void;
  onRemove: (index: number) => void;
  isLast: boolean;
}

const VariationCard = ({
  variation,
  index,
  attributes,
  onUpdate,
  onRemove,
  isLast,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const variationAttributes = attributes.filter((attr) => attr.usedForVariations);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate(index, { image: file });
    }
  };

  const getAttributeValueName = (attrId: number): string => {
    const attr = attributes.find((a) => a.attribute_id === attrId);
    if (!attr) return "";

    const varAttr = variation.attributes.find((a) => a.attribute_id === attrId);
    if (!varAttr) return "";

    const valueNames = attr.values.split(",").map((v) => v.trim());
    const valueIndex = attr.attribute_value_ids.indexOf(varAttr.attribute_value_id);

    return valueIndex >= 0 ? valueNames[valueIndex] : "";
  };

  const imageUrl =
    variation.image instanceof File
      ? URL.createObjectURL(variation.image)
      : variation.image;

  return (
    <div className={`${!isLast ? "border-b border-border" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {variationAttributes.map((attr) => (
          <Select
            key={attr.id}
            value={getAttributeValueName(attr.attribute_id)}
            disabled
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={attr.name} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={getAttributeValueName(attr.attribute_id)}>
                {getAttributeValueName(attr.attribute_id)}
              </SelectItem>
            </SelectContent>
          </Select>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive"
          >
            Remove
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Collapse" : "Edit"}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-accent/50 px-4 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* SKU */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                SKU <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={variation.sku}
                onChange={(e) => onUpdate(index, { sku: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="SKU-001"
              />
            </div>

            {/* Image */}
            <div className="col-span-full">
              <label className="text-xs font-medium text-muted-foreground">
                Variation Image
              </label>
              <div className="mt-2 flex items-center gap-4">
                {imageUrl && (
                  <div className="h-20 w-20 overflow-hidden rounded border border-input">
                    <img
                      src={imageUrl}
                      alt="Variation"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <label className="cursor-pointer rounded border border-input bg-background px-3 py-2 text-xs text-foreground hover:bg-accent">
                  {imageUrl ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {imageUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate(index, { image: undefined })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Price <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={variation.price}
                onChange={(e) => onUpdate(index, { price: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
              />
            </div>

            {/* Sale Price */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Sale Price
              </label>
              <input
                type="number"
                step="0.01"
                value={variation.sale_price}
                onChange={(e) => onUpdate(index, { sale_price: e.target.value })}
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Stock Quantity <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={variation.quantity}
                onChange={(e) =>
                  onUpdate(index, { quantity: parseInt(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
              />
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={variation.low_stock_threshold}
                onChange={(e) =>
                  onUpdate(index, {
                    low_stock_threshold: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="5"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={variation.status}
                onValueChange={(value) => onUpdate(index, { status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariationCard;