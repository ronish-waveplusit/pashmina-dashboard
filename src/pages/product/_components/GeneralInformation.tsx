import { ColorProductFormData, SizeColorProductFormData } from "../../../types/product";
import { useTransactionCategory } from "../../category/_hooks/useCategory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { X } from "lucide-react";
import { FieldError } from "../../../components/ui/field-error";
interface Props {
  formData: ColorProductFormData | SizeColorProductFormData;
  setFormData: (data: ColorProductFormData | SizeColorProductFormData) => void;
  errors?: Record<string, string[]>;
}

const GeneralInformation = ({ formData, setFormData, errors={} }: Props) => {
  const { transactionCategories, isLoading, isError } = useTransactionCategory();

  const selectedCategoryIds = formData.category_id || [];

  const handleAddCategory = (categoryId: string) => {
    const id = parseInt(categoryId);
    if (!selectedCategoryIds.includes(id)) {
      setFormData({
        ...formData,
        category_id: [...selectedCategoryIds, id],
      });
    }
  };

  const handleRemoveCategory = (categoryId: number) => {
    setFormData({
      ...formData,
      category_id: selectedCategoryIds.filter((id) => id !== categoryId),
    });
  };

  const getCategoryName = (id: number) => {
    const category = transactionCategories?.find((cat: any) => cat.id === id);
    return category?.name || `Category ${id}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">
            Product Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter product name"
          />
          <FieldError errors={errors?.name} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">
            Product Code <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g., PROD-001"
          />
        </div>
      </div>

     

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Composition</label>
          <input
            type="text"
            value={formData.composition || ""}
            onChange={(e) =>
              setFormData({ ...formData, composition: e.target.value })
            }
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g., 100% Cotton"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Excerpt</label>
          <input
            type="text"
            value={formData.excerpt || ""}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Short description"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Categories
        </label>

        {/* Selected Categories */}
        {selectedCategoryIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedCategoryIds.map((id) => (
              <Badge key={id} variant="secondary" className="pl-3 pr-1">
                {getCategoryName(id)}
                <button
                  onClick={() => handleRemoveCategory(id)}
                  className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Category Selector */}
        <Select onValueChange={handleAddCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select categories" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading categories...
              </SelectItem>
            ) : isError ? (
              <SelectItem value="error" disabled>
                Error loading categories
              </SelectItem>
            ) : transactionCategories && transactionCategories.length > 0 ? (
              transactionCategories
                .filter((category: any) => !selectedCategoryIds.includes(category.id))
                .map((category: any) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))
            ) : (
              <SelectItem value="empty" disabled>
                No categories available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
       <div>
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter product description"
        />
      </div>
    </div>
  );
};

export default GeneralInformation;