import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface LocalAttribute {
  id: string;
  name: string;
  values: string;
  visibleOnProduct: boolean;
  usedForVariations: boolean;
  attribute_id: number;
  attribute_value_ids: number[];
}

interface VariationAttribute {
  attribute_id: number;
  attribute_value_id: number;
}

interface NewVariation {
  sku: string;
  price: string;
  sale_price: string;
  quantity: number;
  low_stock_threshold: number;
  status: string;
  attributes: VariationAttribute[];
}

interface Props {
  attributes: LocalAttribute[];
  onAdd: (variation: NewVariation) => void;
}

const ManualVariationDialog = ({ attributes, onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, number>>({});

  const variationAttributes = attributes.filter((attr) => attr.usedForVariations);

  const handleAdd = () => {
    // Build attributes array for the variation
    const variationAttrs: VariationAttribute[] = variationAttributes.map((attr) => ({
      attribute_id: attr.attribute_id,
      attribute_value_id: formData[attr.id],
    }));

    // Generate SKU from selected values
    const skuParts = variationAttributes.map((attr) => {
      const valueIndex = attr.attribute_value_ids.indexOf(formData[attr.id]);
      const valueName =
        valueIndex >= 0
          ? attr.values.split(",")[valueIndex]?.trim()
          : "UNKNOWN";
      return valueName.substring(0, 3).toUpperCase();
    });
    const sku = `SKU-${skuParts.join("-")}-${Date.now()}`;

    const newVariation: NewVariation = {
      sku,
      price: "",
      sale_price: "",
      quantity: 0,
      low_stock_threshold: 5,
      status: "active",
      attributes: variationAttrs,
    };

    onAdd(newVariation);
    setFormData({});
    setOpen(false);
  };

  const isValid = variationAttributes.every((attr) => formData[attr.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Manually
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Variation Manually</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {variationAttributes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Please add attributes first to create variations.
            </p>
          ) : (
            <>
              {variationAttributes.map((attr) => {
                const values = attr.values
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v);

                return (
                  <div key={attr.id} className="space-y-2">
                    <Label htmlFor={attr.id}>{attr.name}</Label>
                    <Select
                      value={formData[attr.id]?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, [attr.id]: parseInt(value) })
                      }
                    >
                      <SelectTrigger id={attr.id}>
                        <SelectValue placeholder={`Select ${attr.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {values.map((value, index) => {
                          const valueId = attr.attribute_value_ids[index];
                          return (
                            <SelectItem key={valueId} value={valueId.toString()}>
                              {value}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                After adding, you can edit the variation to set price, stock, and other
                details.
              </p>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            Add Variation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualVariationDialog;