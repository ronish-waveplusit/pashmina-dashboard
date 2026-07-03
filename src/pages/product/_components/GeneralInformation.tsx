import { ColorProductFormData, SizeColorProductFormData } from "../../../types/product";
import { useTransactionCategory } from "../../category/_hooks/useCategory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { FieldError } from "../../../components/ui/field-error";
interface Props {
  formData: ColorProductFormData | SizeColorProductFormData;
  setFormData: (data: ColorProductFormData | SizeColorProductFormData) => void;
  errors?: Record<string, string[]>;
}

const GeneralInformation = ({ formData, setFormData, errors={} }: Props) => {
  const { transactionCategories, isLoading, isError } = useTransactionCategory();

  const selectedCategoryIds = formData.category_id || [];
  const selectedCategoryId = selectedCategoryIds[0];

  const handleSelectCategory = (categoryId: string) => {
    setFormData({
      ...formData,
      category_id: categoryId ? [parseInt(categoryId)] : [],
    });
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
          <FieldError errors={errors?.code} />
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
          <FieldError errors={errors?.composition} />
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
          <FieldError errors={errors?.excerpt} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Category
          </label>

          {/* Category Selector (single select) */}
          <Select
            value={selectedCategoryId ? String(selectedCategoryId) : ""}
            onValueChange={handleSelectCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
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
                transactionCategories.map((category: any) => (
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
          <FieldError errors={errors?.category_id} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Status (Public/Private)
          </label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Public</SelectItem>
              <SelectItem value="inactive">Private</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.status === "active"
              ? "Visible and available for purchase"
              : "Hidden from customers"}
          </p>
          <FieldError errors={errors?.status} />
        </div>
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
      <FieldError errors={errors?.description} />
    </div>
  );
};

export default GeneralInformation;