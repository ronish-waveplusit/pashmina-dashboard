import { X } from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

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
  attribute: LocalAttribute;
  onUpdate: (id: string, updates: Partial<LocalAttribute>) => void;
  onRemove: (id: string) => void;
}

const AttributeCard = ({ attribute, onUpdate, onRemove }: Props) => {
  const valueNames = attribute.values.split(",").map((v) => v.trim()).filter((v) => v);

  return (
    <div className="rounded border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{attribute.name}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(attribute.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Checkboxes */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`visible-${attribute.id}`}
              checked={attribute.visibleOnProduct}
              onCheckedChange={(checked) =>
                onUpdate(attribute.id, { visibleOnProduct: !!checked })
              }
            />
            <label
              htmlFor={`visible-${attribute.id}`}
              className="text-sm cursor-pointer"
            >
              Visible on product page
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`variation-${attribute.id}`}
              checked={attribute.usedForVariations}
              onCheckedChange={(checked) =>
                onUpdate(attribute.id, { usedForVariations: !!checked })
              }
            />
            <label
              htmlFor={`variation-${attribute.id}`}
              className="text-sm cursor-pointer"
            >
              Used for variations
            </label>
          </div>
        </div>

        {/* Selected Values */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">
            Selected Values ({valueNames.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {valueNames.map((value, index) => (
              <Badge key={index} variant="secondary">
                {value}
              </Badge>
            ))}
          </div>
          {valueNames.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No values selected. Use "Add Attributes" to select values.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttributeCard;