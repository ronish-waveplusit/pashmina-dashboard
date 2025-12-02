import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Plus } from "lucide-react";
import { useProductAttributes } from "../_hooks/useProduct";
import {ProductAttribute} from "../../../types/product";

interface Props {
  existingAttributeIds: string[];
  onAdd: (attributes: ProductAttribute[]) => void;
}

const AddAttributesDialog = ({ existingAttributeIds, onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set());
  const { attributes, loading } = useProductAttributes();

  const handleToggle = (attributeId: string) => {
    const newSelected = new Set(selectedAttributes);
    if (newSelected.has(attributeId)) {
      newSelected.delete(attributeId);
    } else {
      newSelected.add(attributeId);
    }
    setSelectedAttributes(newSelected);
  };

  const handleAdd = () => {
    const attributesToAdd: ProductAttribute[] = attributes
      .filter(attr => selectedAttributes.has(attr.id))
      .map(attr => ({
        id: attr.id,
        name: attr.name,
        values: attr.values.join(", "),
        visibleOnProduct: true,
        usedForVariations: true,
      }));

    onAdd(attributesToAdd);
    setSelectedAttributes(new Set());
    setOpen(false);
  };

  const availableAttributes = attributes.filter(
    attr => !existingAttributeIds.includes(attr.id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Attributes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Product Attributes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading attributes...</p>
          ) : availableAttributes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No more attributes available</p>
          ) : (
            <div className="space-y-3">
              {availableAttributes.map((attr) => (
                <div key={attr.id} className="flex items-start space-x-3 rounded border border-border p-3">
                  <Checkbox
                    id={attr.id}
                    checked={selectedAttributes.has(attr.id)}
                    onCheckedChange={() => handleToggle(attr.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={attr.id}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {attr.name}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Values: {attr.values.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedAttributes.size === 0}
          >
            Add Selected ({selectedAttributes.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAttributesDialog;