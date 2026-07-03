import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Zap } from "lucide-react";

// Fields that can be bulk-applied to every variation at once.
export interface BulkUpdates {
  price?: string;
  sale_price?: string;
  quantity?: number;
  low_stock_threshold?: number;
  status?: string;
}

interface Props {
  count: number;
  onApply: (updates: BulkUpdates) => void;
}

const NO_CHANGE = "__no_change__";

const inputClass =
  "w-full rounded border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

/**
 * A compact toolbar that lets the user set a value once and push it to every
 * variation in one click. Only the fields that were actually filled in get
 * applied, so leaving a box empty means "don't touch this field".
 */
const BulkEditToolbar = ({ count, onApply }: Props) => {
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowStock, setLowStock] = useState("");
  const [status, setStatus] = useState<string>(NO_CHANGE);

  const buildUpdates = (): BulkUpdates => {
    const updates: BulkUpdates = {};
    if (price.trim() !== "") updates.price = price;
    if (salePrice.trim() !== "") updates.sale_price = salePrice;
    if (quantity.trim() !== "") updates.quantity = parseInt(quantity) || 0;
    if (lowStock.trim() !== "")
      updates.low_stock_threshold = parseInt(lowStock) || 0;
    if (status !== NO_CHANGE) updates.status = status;
    return updates;
  };

  const hasSomething =
    price.trim() !== "" ||
    salePrice.trim() !== "" ||
    quantity.trim() !== "" ||
    lowStock.trim() !== "" ||
    status !== NO_CHANGE;

  const reset = () => {
    setPrice("");
    setSalePrice("");
    setQuantity("");
    setLowStock("");
    setStatus(NO_CHANGE);
  };

  const handleApply = () => {
    const updates = buildUpdates();
    if (Object.keys(updates).length === 0) return;
    onApply(updates);
    reset();
  };

  return (
    <div className="rounded-lg border border-border bg-accent/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Bulk edit</h4>
        <span className="text-xs text-muted-foreground">
          Fill any field, then apply it to all {count} variation
          {count === 1 ? "" : "s"} at once.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Sale price
          </label>
          <input
            type="number"
            step="0.01"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Low stock
          </label>
          <input
            type="number"
            value={lowStock}
            onChange={(e) => setLowStock(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-[34px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CHANGE}>No change</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={handleApply}
            disabled={!hasSomething}
            className="w-full"
          >
            Apply to all
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkEditToolbar;
