import { X } from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import {ProductAttribute} from "../../../types/product";
import AttributeValueSelector from "./AttributeValueSelector";

interface Props {
  attribute: ProductAttribute;
  onUpdate: (id: string, updates: Partial<ProductAttribute>) => void;
  onRemove: (id: string) => void;
}

const AttributeCard = ({ attribute, onUpdate, onRemove }: Props) => {
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`visible-${attribute.id}`}
                checked={attribute.visibleOnProduct}
                onCheckedChange={(checked) =>
                  onUpdate(attribute.id, { visibleOnProduct: !!checked })
                }
              />
              <label htmlFor={`visible-${attribute.id}`} className="text-sm cursor-pointer">
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
              <label htmlFor={`variation-${attribute.id}`} className="text-sm cursor-pointer">
                Used for variations
              </label>
            </div>
          </div>
        </div>

        <div>
          <AttributeValueSelector attribute={attribute} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
};

export default AttributeCard;