import {ProductVariation,ProductAttribute} from "../../../types/product";
import VariationCard from "./VariationCard";

interface Props {
  variations: ProductVariation[];
  attributes: ProductAttribute[];
  onUpdate: (id: string, updates: Partial<ProductVariation>) => void;
  onRemove: (id: string) => void;
}

const VariationsList = ({ variations, attributes, onUpdate, onRemove }: Props) => {
  const attributeNames = attributes
    .filter(attr => attr.usedForVariations)
    .map(attr => attr.name);

  return (
    <div className="space-y-4">
      <div className="rounded border border-border bg-card">
        <div className="border-b border-border bg-accent px-4 py-3">
          <h3 className="font-semibold text-foreground">Variants</h3>
        </div>
        <div className="space-y-0">
          {variations.map((variation, index) => (
            <VariationCard
              key={variation.id}
              variation={variation}
              attributeNames={attributeNames}
              onUpdate={onUpdate}
              onRemove={onRemove}
              isLast={index === variations.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VariationsList;