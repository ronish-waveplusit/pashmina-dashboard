import { useEffect, useState } from "react";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import {ProductAttribute} from "../../../types/product";

interface Props {
  attribute: ProductAttribute;
  onUpdate: (id: string, updates: Partial<ProductAttribute>) => void;
}

// Mock API call to fetch attribute values
const fetchAttributeValues = async (attributeId: string): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const valueMap: Record<string, string[]> = {
        size: ["Small", "Medium", "Large", "X-Large"],
        color: ["Red", "Blue", "Black", "White", "Green"],
        material: ["Cotton", "Polyester", "Silk", "Wool"],
        style: ["Casual", "Formal", "Sport", "Vintage"],
      };
      resolve(valueMap[attributeId] || []);
    }, 300);
  });
};

const AttributeValueSelector = ({ attribute, onUpdate }: Props) => {
  const [availableValues, setAvailableValues] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(attribute.values ? attribute.values.split(", ").filter(v => v) : [])
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValues = async () => {
      try {
        const values = await fetchAttributeValues(attribute.id);
        setAvailableValues(values);
      } catch (error) {
        console.error("Failed to fetch attribute values:", error);
      } finally {
        setLoading(false);
      }
    };

    loadValues();
  }, [attribute.id]);

  const handleToggle = (value: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelectedValues(newSelected);
    onUpdate(attribute.id, { values: Array.from(newSelected).join(", ") });
  };

  if (loading) {
    return <p className="text-xs text-muted-foreground">Loading values...</p>;
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">
        Select Values
      </Label>
      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
        {availableValues.map((value) => (
          <div key={value} className="flex items-center space-x-2">
            <Checkbox
              id={`${attribute.id}-${value}`}
              checked={selectedValues.has(value)}
              onCheckedChange={() => handleToggle(value)}
            />
            <label
              htmlFor={`${attribute.id}-${value}`}
              className="text-sm cursor-pointer select-none"
            >
              {value}
            </label>
          </div>
        ))}
      </div>
      {selectedValues.size > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedValues.size} value(s) selected
        </p>
      )}
    </div>
  );
};

export default AttributeValueSelector;