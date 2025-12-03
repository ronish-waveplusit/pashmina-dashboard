import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ProductFormData, ProductAttribute, ProductVariation } from "../../../types/product";
import AttributeCard from "./AttributeCard";
import VariationsList from "./VariationsList";
import AddAttributesDialog from "./AddAttributesDialog";
import ManualVariationDialog from "./ManualVariationDialog";
import { toast } from "sonner";

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

const VariantsSection = ({ formData, setFormData }: Props) => {
  const [activeTab, setActiveTab] = useState("attributes");

  const addAttributes = (newAttributes: ProductAttribute[]) => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, ...newAttributes],
    });
  };

  const removeAttribute = (id: string) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter(attr => attr.id !== id),
    });
  };

  const updateAttribute = (id: string, updates: Partial<typeof formData.attributes[0]>) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.map(attr =>
        attr.id === id ? { ...attr, ...updates } : attr
      ),
    });
  };

  const generateVariations = () => {
    const variationAttributes = formData.attributes.filter(attr => attr.usedForVariations);

    if (variationAttributes.length === 0) {
      toast.error("Please add at least one attribute marked for variations");
      return;
    }

    const hasEmptyValues = variationAttributes.some(attr => !attr.values.trim());
    if (hasEmptyValues) {
      toast.error("Please select values for all attributes");
      return;
    }

    const attributeValues = variationAttributes.map(attr => ({
      name: attr.name,
      values: attr.values.split(',').map(v => v.trim()).filter(v => v),
    }));

    const generateCombinations = (arrays: string[][], prefix: string[] = []): string[][] => {
      if (arrays.length === 0) return [prefix];
      const [first, ...rest] = arrays;
      return first.flatMap(value => generateCombinations(rest, [...prefix, value]));
    };

    const combinations = generateCombinations(attributeValues.map(av => av.values));

    const newVariations = combinations.map((combo, index) => {
      const attributes: Record<string, string> = {};
      attributeValues.forEach((av, i) => {
        attributes[av.name] = combo[i];
      });

      return {
        id: `generated-${Date.now()}-${index}`,
        attributes,
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
    });

    setFormData({
      ...formData,
      variations: newVariations,
    });

    setActiveTab("variations");
    toast.success(`Generated ${newVariations.length} variations`);
  };

  const addManualVariation = (variation: ProductVariation) => {
    setFormData({
      ...formData,
      variations: [...formData.variations, variation],
    });
    toast.success("Variation added manually");
  };

  const updateVariation = (id: string, updates: Partial<typeof formData.variations[0]>) => {
    setFormData({
      ...formData,
      variations: formData.variations.map(variation =>
        variation.id === id ? { ...variation, ...updates } : variation
      ),
    });
  };

  const removeVariation = (id: string) => {
    setFormData({
      ...formData,
      variations: formData.variations.filter(v => v.id !== id),
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="attributes">
          Attributes ({formData.attributes.length})
        </TabsTrigger>
        <TabsTrigger value="variations">
          Variations ({formData.variations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="attributes" className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <AddAttributesDialog
            existingAttributeIds={formData.attributes.map(a => a.id)}
            onAdd={addAttributes}
            selectedProductAttributes={formData.attributes}
            onUpdateAttributeValues={(attributeId, selectedValueIds) => {
              // Find the attribute to update
              const attribute = formData.attributes.find(a => a.id === attributeId);
              if (!attribute) return;

              // You'll need access to the full attributes list to map IDs back to names
              // This is a simplified version - you may need to adjust based on your data structure
              updateAttribute(attributeId, {
                values: selectedValueIds.join(", ") // Or however you want to format the values
              });
            }}
          />
          {formData.attributes.length > 0 && (
            <Button onClick={generateVariations}>
              Generate Variations
            </Button>
          )}
        </div>

        {formData.attributes.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No attributes added yet. Click "Add Attributes" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.attributes.map(attribute => (
              <AttributeCard
                key={attribute.id}
                attribute={attribute}
                
                onUpdate={updateAttribute}
                onRemove={removeAttribute}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="variations" className="space-y-4 mt-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={generateVariations}>
            Regenerate All
          </Button>
          <ManualVariationDialog
            attributes={formData.attributes}
            onAdd={addManualVariation}
          />
        </div>

        {formData.variations.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No variations yet. Add attributes and generate variations.
            </p>
          </div>
        ) : (
          <VariationsList
            variations={formData.variations}
            attributes={formData.attributes}
            onUpdate={updateVariation}
            onRemove={removeVariation}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default VariantsSection;