import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

import { Label } from "../../../components/ui/label";
import { Plus } from "lucide-react";
import {ProductAttribute,ProductVariation} from "../../../types/product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

interface Props {
  attributes: ProductAttribute[];
  onAdd: (variation: ProductAttribute) => void;
}

const ManualVariationDialog = ({ attributes, onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const variationAttributes = attributes.filter(attr => attr.usedForVariations);

  const handleAdd = () => {
    const attributeValues: Record<string, string> = {};
    variationAttributes.forEach(attr => {
      if (formData[attr.id]) {
        attributeValues[attr.name] = formData[attr.id];
      }
    });

    const newVariation: ProductVariation = {
      id: `manual-${Date.now()}`,
      attributes: attributeValues,
      image: "",
      costPrice: "",
      salePrice: "",
      stock: "",
      lst: "",
      sku: "",
      description: "",
      weight: "",
      status: "active",
    };

    onAdd(newVariation);
    setFormData({});
    setOpen(false);
  };

  const isValid = variationAttributes.every(attr => formData[attr.id]);

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
                const values = attr.values.split(",").map(v => v.trim()).filter(v => v);
                return (
                  <div key={attr.id} className="space-y-2">
                    <Label htmlFor={attr.id}>{attr.name}</Label>
                    <Select
                      value={formData[attr.id] || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, [attr.id]: value })
                      }
                    >
                      <SelectTrigger id={attr.id}>
                        <SelectValue placeholder={`Select ${attr.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
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