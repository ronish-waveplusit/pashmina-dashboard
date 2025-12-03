import { ProductFormData } from "../../../types/product";
import { useTransactionCategory } from "../../category/_hooks/useCategory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

const GeneralInformation = ({ formData, setFormData }: Props) => {
  const {
    transactionCategories,
    isLoading,
    isError,
  } = useTransactionCategory();

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col w-1/2">
          <label className="text-sm font-medium text-foreground">Category</label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading categories...</SelectItem>
              ) : isError ? (
                <SelectItem value="error" disabled>Error loading categories</SelectItem>
              ) : transactionCategories && transactionCategories.length > 0 ? (
                transactionCategories.map((category: any) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>No categories available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col w-1/2">
          <label className="text-sm font-medium text-foreground">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>


    </div>
  );
};

export default GeneralInformation;