import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Plus } from "lucide-react";
import { useAttribute } from "../../attributes/_hooks/useAttribute";
import { AttributeWithValues } from "../../../types/attribute";

interface LocalAttribute {
  id: string;
  name: string;
  values: string;
  visibleOnProduct: boolean;
  usedForVariations: boolean;
  attribute_id: number;
  attribute_value_ids: number[];
}

interface Props {
  existingAttributeIds: string[];
  selectedProductAttributes: LocalAttribute[];
  onAdd: (attributes: any[]) => void;
  onUpdateAttributeValues: (attributeId: string, selectedValueIds: number[]) => void;
}

interface SelectedAttributeValues {
  [attributeId: string]: Set<string>;
}

const AddAttributesDialog = ({
  existingAttributeIds,
  selectedProductAttributes,
  onAdd,
  onUpdateAttributeValues,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set());
  const [selectedValues, setSelectedValues] = useState<SelectedAttributeValues>({});

  const { attributes: rawAttributes, isLoading, isError } = useAttribute();

  const attributes: AttributeWithValues[] = useMemo(() => {
    if (!rawAttributes) return [];

    return rawAttributes.map((attr: any) => ({
      id: attr.id,
      name: attr.name,
      slug: attr.slug,
      attributeValues:
        attr.attribute_values?.map((val: any) => ({
          id: val.id,
          attribute_id: val.attribute_id,
          name: val.name,
          created_at: val.created_at,
          updated_at: val.updated_at,
        })) || [],
      created_at: attr.created_at,
      updated_at: attr.updated_at,
    }));
  }, [rawAttributes]);

  const handleToggleAttribute = (attributeId: string) => {
    const newSelected = new Set(selectedAttributes);
    const newSelectedValues = { ...selectedValues };

    if (newSelected.has(attributeId)) {
      newSelected.delete(attributeId);
      delete newSelectedValues[attributeId];
    } else {
      newSelected.add(attributeId);
      // Initialize with all values selected by default
      const attribute = attributes.find((a) => String(a.id) === attributeId);
      if (attribute && attribute.attributeValues) {
        newSelectedValues[attributeId] = new Set(
          attribute.attributeValues.map((v) => String(v.id))
        );
      }
    }

    setSelectedAttributes(newSelected);
    setSelectedValues(newSelectedValues);
  };

  const handleToggleValue = (attributeId: string, valueId: string) => {
    const newSelectedValues = { ...selectedValues };

    if (!newSelectedValues[attributeId]) {
      newSelectedValues[attributeId] = new Set();
    }

    if (newSelectedValues[attributeId].has(valueId)) {
      newSelectedValues[attributeId].delete(valueId);
    } else {
      newSelectedValues[attributeId].add(valueId);
    }

    setSelectedValues(newSelectedValues);
  };

  const handleToggleExistingValue = (attributeId: string, valueId: string) => {
    const productAttr = selectedProductAttributes.find((a) => a.id === attributeId);
    if (!productAttr) return;

    const currentValueIds = productAttr.attribute_value_ids;
    const valueIdNum = parseInt(valueId);

    // Toggle the value
    const updatedValueIds = currentValueIds.includes(valueIdNum)
      ? currentValueIds.filter((id) => id !== valueIdNum)
      : [...currentValueIds, valueIdNum];

    onUpdateAttributeValues(attributeId, updatedValueIds);
  };

  const handleAdd = () => {
    const attributesToAdd = attributes
      .filter((attr) => selectedAttributes.has(String(attr.id)))
      .map((attr) => {
        const attrId = String(attr.id);
        const selectedValueIds = selectedValues[attrId] || new Set();
        const selectedValueNames = (attr.attributeValues || [])
          .filter((v) => selectedValueIds.has(String(v.id)))
          .map((v) => v.name);
        
        const selectedValueIdsArray = Array.from(selectedValueIds).map(id => parseInt(id));

        return {
          id: attrId,
          name: attr.name,
          values: selectedValueNames.join(", "),
          visibleOnProduct: true,
          usedForVariations: true,
          attribute_id: parseInt(attrId),
          attribute_value_ids: selectedValueIdsArray,
        };
      });

    onAdd(attributesToAdd);
    setSelectedAttributes(new Set());
    setSelectedValues({});
    setOpen(false);
  };

  const availableAttributes = attributes.filter(
    (attr) => !existingAttributeIds.includes(String(attr.id))
  );

  const getTotalSelectedCount = () => {
    return Array.from(selectedAttributes).reduce((count, attrId) => {
      return count + (selectedValues[attrId]?.size || 0);
    }, 0);
  };

  const getSelectedValueCount = (attributeId: string) => {
    const productAttr = selectedProductAttributes.find((a) => a.id === attributeId);
    if (!productAttr) return 0;
    return productAttr.attribute_value_ids.length;
  };

  const isValueSelected = (attributeId: string, valueId: string) => {
    const productAttr = selectedProductAttributes.find((a) => a.id === attributeId);
    if (!productAttr) return false;

    const valueIdNum = parseInt(valueId);
    return productAttr.attribute_value_ids.includes(valueIdNum);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Attributes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Product Attributes & Values</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Existing Attributes with Value Selection */}
          {selectedProductAttributes?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Selected Attributes
              </h3>
              {selectedProductAttributes.map((productAttr) => {
                const attribute = attributes.find(
                  (a) => String(a.id) === productAttr.id
                );
                if (!attribute || !attribute.attributeValues) return null;

                const selectedCount = getSelectedValueCount(productAttr.id);
                const totalCount = attribute.attributeValues.length;

                return (
                  <div key={productAttr.id} className="rounded border border-border">
                    <div className="p-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{productAttr.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedCount} of {totalCount} values selected
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        {attribute.attributeValues.map((value) => {
                          const valueId = String(value.id);
                          const isChecked = isValueSelected(productAttr.id, valueId);

                          return (
                            <div
                              key={value.id}
                              className="flex items-center space-x-2 rounded border border-border/50 p-2 hover:bg-muted/50"
                            >
                              <Checkbox
                                id={`existing-${productAttr.id}-${valueId}`}
                                checked={isChecked}
                                onCheckedChange={() =>
                                  handleToggleExistingValue(productAttr.id, valueId)
                                }
                              />
                              <label
                                htmlFor={`existing-${productAttr.id}-${valueId}`}
                                className="text-xs cursor-pointer flex-1"
                              >
                                {value.name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Available Attributes to Add */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading attributes...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">Error loading attributes</p>
          ) : availableAttributes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No more attributes available
            </p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Available Attributes
              </h3>
              {availableAttributes.map((attr) => {
                const attrId = String(attr.id);
                const isSelected = selectedAttributes.has(attrId);
                const selectedValueCount = selectedValues[attrId]?.size || 0;
                const totalValueCount = attr.attributeValues?.length || 0;

                return (
                  <div key={attr.id} className="rounded border border-border">
                    <div className="flex items-start space-x-3 p-3 bg-muted/30">
                      <Checkbox
                        id={attrId}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleAttribute(attrId)}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={attrId}
                          className="text-sm font-medium leading-none cursor-pointer block"
                        >
                          {attr.name}
                        </label>
                        {isSelected && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedValueCount} of {totalValueCount} values selected
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected &&
                      attr.attributeValues &&
                      attr.attributeValues.length > 0 && (
                        <div className="p-3 pt-0">
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {attr.attributeValues.map((value) => {
                              const valueId = String(value.id);
                              const isValueSelected =
                                selectedValues[attrId]?.has(valueId) || false;

                              return (
                                <div
                                  key={value.id}
                                  className="flex items-center space-x-2 rounded border border-border/50 p-2 hover:bg-muted/50"
                                >
                                  <Checkbox
                                    id={`${attrId}-${valueId}`}
                                    checked={isValueSelected}
                                    onCheckedChange={() =>
                                      handleToggleValue(attrId, valueId)
                                    }
                                  />
                                  <label
                                    htmlFor={`${attrId}-${valueId}`}
                                    className="text-xs cursor-pointer flex-1"
                                  >
                                    {value.name}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedAttributes.size} new attributes, {getTotalSelectedCount()} values
            selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                selectedAttributes.size === 0 || getTotalSelectedCount() === 0
              }
            >
              Add Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAttributesDialog;