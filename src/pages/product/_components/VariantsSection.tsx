import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { SizeColorProductFormData } from "../../../types/product";
import AttributeCard from "./AttributeCard";
import VariationsList from "./VariationsList";
import AddAttributesDialog from "./AddAttributesDialog";
import { toast } from "sonner";

interface Props {
  formData: SizeColorProductFormData;
  setFormData: (data: SizeColorProductFormData) => void;
  initialLocalAttributes?: LocalAttribute[];
}

interface LocalAttribute {
  id: string;
  name: string;
  values: string;
  visibleOnProduct: boolean;
  usedForVariations: boolean;
  attribute_id: number;
  attribute_value_ids: number[];
}

const VariantsSection = ({ formData, setFormData, initialLocalAttributes = [] }: Props) => {
  const [activeTab, setActiveTab] = useState("attributes");
  const [localAttributes, setLocalAttributes] = useState<LocalAttribute[]>([]);

  // Initialize local attributes from props (for edit mode)
  useEffect(() => {
    if (initialLocalAttributes.length > 0 && localAttributes.length === 0) {
      setLocalAttributes(initialLocalAttributes);
    }
  }, [initialLocalAttributes]);

  const addAttributes = (newAttributes: any[]) => {
    console.log("Adding/Updating attributes:", newAttributes);
    
    // Separate new attributes from existing ones
    const existingIds = new Set(localAttributes.map(a => String(a.attribute_id)));
    const toUpdate: any[] = [];
    const toAdd: any[] = [];
    
    newAttributes.forEach(attr => {
      const attrId = String(attr.attribute_id);
      if (existingIds.has(attrId)) {
        toUpdate.push(attr);
      } else {
        toAdd.push(attr);
      }
    });

    console.log("To update:", toUpdate);
    console.log("To add:", toAdd);

    // Update existing attributes
    if (toUpdate.length > 0) {
      const updatedLocalAttrs = localAttributes.map(existing => {
        const update = toUpdate.find(u => u.attribute_id === existing.attribute_id);
        if (update) {
          console.log("Updating attribute:", existing.name, "with values:", update.values);
          return {
            ...existing,
            values: update.values || existing.values,
            attribute_value_ids: update.attribute_value_ids || existing.attribute_value_ids,
          };
        }
        return existing;
      });
      setLocalAttributes(updatedLocalAttrs);

      // Update formData
      const updatedFormDataAttrs = formData.attributes.map(existing => {
        const update = toUpdate.find(u => u.attribute_id === existing.attribute_id);
        if (update) {
          return {
            ...existing,
            attribute_value_ids: update.attribute_value_ids || existing.attribute_value_ids,
          };
        }
        return existing;
      });
      setFormData({
        ...formData,
        attributes: updatedFormDataAttrs,
      });
    }
    
    // Add new attributes
    if (toAdd.length > 0) {
      const newLocalAttrs: LocalAttribute[] = toAdd.map((attr) => {
        return {
          id: String(attr.attribute_id),
          name: attr.name,
          values: attr.values || "",
          visibleOnProduct: attr.visibleOnProduct ?? true,
          usedForVariations: attr.usedForVariations ?? true,
          attribute_id: attr.attribute_id,
          attribute_value_ids: attr.attribute_value_ids || [],
        };
      });

      setLocalAttributes([...localAttributes, ...newLocalAttrs]);

      // Update formData attributes
      const formDataAttrs = toAdd.map((attr) => ({
        attribute_id: attr.attribute_id,
        attribute_value_ids: attr.attribute_value_ids || [],
      }));

      setFormData({
        ...formData,
        attributes: [...formData.attributes, ...formDataAttrs],
      });
    }
  };

  const removeAttribute = (id: string) => {
    setLocalAttributes(localAttributes.filter((attr) => attr.id !== id));
    setFormData({
      ...formData,
      attributes: formData.attributes.filter(
        (attr) => attr.attribute_id !== parseInt(id)
      ),
    });
  };

  const updateAttribute = (
    id: string,
    updates: Partial<LocalAttribute>
  ) => {
    setLocalAttributes(
      localAttributes.map((attr) =>
        attr.id === id ? { ...attr, ...updates } : attr
      )
    );
  };

  const updateAttributeValues = (attributeId: string, valueIds: number[]) => {
    console.log("Updating attribute values:", attributeId, valueIds);
    
    // Update local attributes
    setLocalAttributes(
      localAttributes.map((attr) =>
        attr.id === attributeId
          ? { ...attr, attribute_value_ids: valueIds }
          : attr
      )
    );

    // Update formData
    setFormData({
      ...formData,
      attributes: formData.attributes.map((attr) =>
        attr.attribute_id === parseInt(attributeId)
          ? { ...attr, attribute_value_ids: valueIds }
          : attr
      ),
    });
  };

  const generateVariations = () => {
    console.log("Generate variations clicked");
    console.log("Local attributes:", localAttributes);
    
    const variationAttributes = localAttributes.filter(
      (attr) => attr.usedForVariations
    );

    console.log("Variation attributes:", variationAttributes);

    if (variationAttributes.length === 0) {
      toast.error("Please add at least one attribute marked for variations");
      return;
    }

    // Check if attributes have values
    const hasEmptyValues = variationAttributes.some((attr) => {
      const noValues = !attr.values.trim();
      const noValueIds = !attr.attribute_value_ids || attr.attribute_value_ids.length === 0;
      
      console.log(`Attribute ${attr.name}:`, {
        id: attr.id,
        attribute_id: attr.attribute_id,
        values: attr.values,
        valueIds: attr.attribute_value_ids,
        valueIdsLength: attr.attribute_value_ids?.length || 0,
        noValues,
        noValueIds,
        fullObject: attr
      });
      
      return noValues || noValueIds;
    });

    if (hasEmptyValues) {
      toast.error("Please select values for all attributes");
      return;
    }

    // Generate combinations
    const attributeData = variationAttributes.map((attr) => ({
      attribute_id: attr.attribute_id,
      name: attr.name,
      values: attr.values.split(",").map((v) => v.trim()).filter((v) => v),
      value_ids: attr.attribute_value_ids,
    }));

    console.log("Attribute data for combinations:", attributeData);

    const generateCombinations = (
      arrays: any[],
      prefix: any[] = []
    ): any[][] => {
      if (arrays.length === 0) return [prefix];
      const [first, ...rest] = arrays;
      return first.values.flatMap((_: any, idx: number) =>
        generateCombinations(rest, [
          ...prefix,
          { 
            attr_id: first.attribute_id, 
            attr_name: first.name,
            value: first.values[idx],
            value_id: first.value_ids[idx] 
          },
        ])
      );
    };

    const combinations = generateCombinations(attributeData);
    console.log("Generated combinations:", combinations);

    // Create a map of existing variations by their attribute combination
    const existingVariationsMap = new Map();
    formData.variations.forEach(variation => {
      // Create a key from sorted attribute value IDs
      const key = variation.attributes
        .map(a => `${a.attribute_id}:${a.attribute_value_id}`)
        .sort()
        .join('|');
      existingVariationsMap.set(key, variation);
    });

    console.log("Existing variations map:", existingVariationsMap);

    // Generate variations, preserving existing ones
    const newVariations = combinations.map((combo, index) => {
      // Create key for this combination
      const key = combo
        .map(c => `${c.attr_id}:${c.value_id}`)
        .sort()
        .join('|');

      // Check if this combination already exists
      const existing = existingVariationsMap.get(key);

      if (existing) {
        // Keep existing variation data
        console.log("Found existing variation for:", key);
        return existing;
      } else {
        // Create new variation
        console.log("Creating new variation for:", key);
        const sku = `SKU-${Date.now()}-${index}`;
        
        return {
          sku,
          price: "",
          sale_price: "",
          quantity: 0,
          low_stock_threshold: 5,
          status: "active" as const,
          attributes: combo.map((c) => ({
            attribute_id: c.attr_id,
            attribute_value_id: c.value_id,
          })),
        };
      }
    });

    console.log("Final variations (preserved + new):", newVariations);

    setFormData({
      ...formData,
      variations: newVariations,
    });

    setActiveTab("variations");
    toast.success(`Updated variations: ${newVariations.length} total (${newVariations.length - existingVariationsMap.size} new)`);
  };

  const updateVariation = (index: number, updates: any) => {
    const newVariations = [...formData.variations];
    newVariations[index] = { ...newVariations[index], ...updates };
    setFormData({ ...formData, variations: newVariations });
  };

  const removeVariation = (index: number) => {
    setFormData({
      ...formData,
      variations: formData.variations.filter((_, i) => i !== index),
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="attributes">
          Attributes ({localAttributes.length})
        </TabsTrigger>
        <TabsTrigger value="variations">
          Variations ({formData.variations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="attributes" className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <AddAttributesDialog
            existingAttributeIds={localAttributes.map((a) => a.id)}
            onAdd={addAttributes}
            selectedProductAttributes={localAttributes}
            onUpdateAttributeValues={updateAttributeValues}
            isEditMode={true}
          />
          {localAttributes.length > 0 && (
            <Button 
              onClick={generateVariations}
              className="bg-primary hover:bg-primary/90"
            >
              Generate Variations
            </Button>
          )}
        </div>

        {localAttributes.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No attributes added yet. Click "Add Attributes" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {localAttributes.map((attribute) => (
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
            attributes={localAttributes}
            onUpdate={updateVariation}
            onRemove={removeVariation}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default VariantsSection;