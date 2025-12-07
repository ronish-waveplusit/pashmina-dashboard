import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ColorProductFormData, SizeColorProductFormData } from "../../../types/product";

interface Props {
  formData: ColorProductFormData | SizeColorProductFormData;
  setFormData: (data: ColorProductFormData | SizeColorProductFormData) => void;
}

const StatusSection = ({ formData, setFormData }: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Product Status
        </label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          {formData.status === "active"
            ? "Product is visible and available for purchase"
            : formData.status === "inactive"
            ? "Product is hidden from customers"
            : "Product is saved as draft"}
        </p>
      </div>
    </div>
  );
};

export default StatusSection;