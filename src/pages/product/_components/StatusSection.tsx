import {ProductFormData} from "../../../types/product";

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

const StatusSection = ({ formData, setFormData }: Props) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Enter status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
};

export default StatusSection;