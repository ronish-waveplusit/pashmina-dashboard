import { ColorProductFormData } from "../../../types/product";
import { FieldError } from "../../../components/ui/field-error";
interface Props {
  formData: ColorProductFormData;
  setFormData: (data: ColorProductFormData) => void;
  errors?: Record<string, string[]>;
}


const PricingStock = ({ formData, setFormData, errors={} }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-foreground">
          Price <span className="text-destructive">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="0.00"
        />
        <FieldError errors={errors?.price} />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Sale Price
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.sale_price}
          onChange={(e) =>
            setFormData({ ...formData, sale_price: e.target.value })
          }
          className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Stock Quantity <span className="text-destructive">*</span>
        </label>
        <input
          type="number"
          min="0"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
          }
          className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="0"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Low Stock Threshold
        </label>
        <input
          type="number"
          min="0"
          value={formData.low_stock_threshold}
          onChange={(e) =>
            setFormData({
              ...formData,
              low_stock_threshold: parseInt(e.target.value) || 0,
            })
          }
          className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="5"
        />
      </div>
    </div>
  );
};

export default PricingStock;