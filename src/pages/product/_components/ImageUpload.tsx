import { Plus } from "lucide-react";
import { ProductFormData } from "../../../types/product";

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

const ImageUpload = ({ formData, setFormData }: Props) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData({ ...formData, images: [...formData.images, ...newImages] });
    }
  };

  return (
    <div className="space-y-4">
      {formData.images.length > 0 && (
        <div className="aspect-square w-full overflow-hidden rounded border border-input bg-accent">
          <img
            src={formData.images[0]}
            alt="Main product"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {formData.images.slice(0, 2).map((image, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden rounded border border-input bg-accent"
          >
            <img src={image} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer items-center justify-center rounded border-2 border-dashed border-border bg-accent hover:bg-accent/80">
          <Plus className="h-6 w-6 text-muted" />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;