import { useState } from "react";
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

const VariantsSection = ({ formData, setFormData }: Props) => {
  const [activeTab, setActiveTab] = useState("attributes");
  const [localAttributes, setLocalAttributes] = useState<LocalAttribute[]>([]);

  const addAttributes = (newAttributes: any[]) => {
    console.log("Adding attributes:", newAttributes);
    
    // Convert ProductAttribute to LocalAttribute
    const newLocalAttrs: LocalAttribute[] = newAttributes.map((attr) => {
      return {
        id: String(attr.id),
        name: attr.name,
        values: attr.values || "",
        visibleOnProduct: attr.visibleOnProduct ?? true,
        usedForVariations: attr.usedForVariations ?? true,
        attribute_id: parseInt(String(attr.id)),
        attribute_value_ids: attr.attribute_value_ids || [], // Use the IDs from dialog
      };
    });

    setLocalAttributes([...localAttributes, ...newLocalAttrs]);

    // Update formData attributes
    const formDataAttrs = newAttributes.map((attr) => ({
      attribute_id: parseInt(String(attr.id)),
      attribute_value_ids: attr.attribute_value_ids || [], // Use the IDs from dialog
    }));

    setFormData({
      ...formData,
      attributes: [...formData.attributes, ...formDataAttrs],
    });
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

    const newVariations = combinations.map((combo, index) => {
      const sku = `SKU-${Date.now()}-${index}`;
      
      // Create a readable name from the combination
      const variantName = combo.map(c => c.value).join(" / ");

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
    });

    console.log("New variations:", newVariations);

    setFormData({
      ...formData,
      variations: newVariations,
    });

    setActiveTab("variations");
    toast.success(`Generated ${newVariations.length} variations`);
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