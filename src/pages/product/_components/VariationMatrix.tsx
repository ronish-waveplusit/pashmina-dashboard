import { Trash2, ImagePlus, CopyPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface VariationAttribute {
  attribute_id: number;
  attribute_value_id: number;
}

interface Variation {
  id?: number;
  sku: string;
  price: string;
  sale_price: string;
  quantity: number;
  low_stock_threshold: number;
  status: string;
  attributes: VariationAttribute[];
  image?: File | string;
}

interface LocalAttribute {
  id: string;
  name: string;
  values: string;
  attribute_id: number;
  attribute_value_ids: number[];
  usedForVariations: boolean;
}

interface Props {
  variations: Variation[];
  attributes: LocalAttribute[];
  onUpdate: (index: number, updates: Partial<Variation>) => void;
  onBulkUpdate: (
    predicate: (v: Variation) => boolean,
    updates: Partial<Variation>
  ) => void;
  onRemove: (index: number) => void;
  errors?: Record<string, string[]>;
}

interface ValueRef {
  id: number;
  name: string;
}

// Turn the parallel `values` CSV + `attribute_value_ids` arrays into objects.
const parseValues = (attr: LocalAttribute): ValueRef[] => {
  const names = attr.values
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v);
  return names.map((name, i) => ({ id: attr.attribute_value_ids[i], name }));
};

const getImageUrl = (image: File | string | undefined): string | null => {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (image instanceof File) return URL.createObjectURL(image);
  return null;
};

const inputClass =
  "w-full rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const VariationMatrix = ({
  variations,
  attributes,
  onUpdate,
  onBulkUpdate,
  onRemove,
  errors = {},
}: Props) => {
  const variationAttributes = attributes.filter((a) => a.usedForVariations);

  const getFieldError = (index: number, field: string): string | undefined =>
    errors[`variations.${index}.${field}`]?.[0];

  const cellHasError = (index: number): boolean =>
    index >= 0 &&
    Object.keys(errors).some((k) => k.startsWith(`variations.${index}.`));

  // The full set of editable fields for a single variation, shown inside every
  // grid cell / card so nothing from the old list view is lost.
  const renderFields = (variation: Variation, index: number) => (
    <div className="flex flex-col gap-1.5">
      <div>
        <input
          type="text"
          value={variation.sku}
          onChange={(e) => onUpdate(index, { sku: e.target.value })}
          className={inputClass}
          placeholder="SKU"
        />
        {getFieldError(index, "sku") && (
          <p className="mt-0.5 text-[10px] text-destructive">
            {getFieldError(index, "sku")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <label className="text-[10px] uppercase text-muted-foreground">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            value={variation.price}
            onChange={(e) => onUpdate(index, { price: e.target.value })}
            className={inputClass}
            placeholder="0.00"
          />
          {getFieldError(index, "price") && (
            <p className="mt-0.5 text-[10px] text-destructive">
              {getFieldError(index, "price")}
            </p>
          )}
        </div>
        <div>
          <label className="text-[10px] uppercase text-muted-foreground">
            Sale
          </label>
          <input
            type="number"
            step="0.01"
            value={variation.sale_price}
            onChange={(e) => onUpdate(index, { sale_price: e.target.value })}
            className={inputClass}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <label className="text-[10px] uppercase text-muted-foreground">
            Qty
          </label>
          <input
            type="number"
            value={variation.quantity}
            onChange={(e) =>
              onUpdate(index, { quantity: parseInt(e.target.value) || 0 })
            }
            className={inputClass}
            placeholder="0"
          />
          {getFieldError(index, "quantity") && (
            <p className="mt-0.5 text-[10px] text-destructive">
              {getFieldError(index, "quantity")}
            </p>
          )}
        </div>
        <div>
          <label className="text-[10px] uppercase text-muted-foreground">
            Low stock
          </label>
          <input
            type="number"
            value={variation.low_stock_threshold}
            onChange={(e) =>
              onUpdate(index, {
                low_stock_threshold: parseInt(e.target.value) || 0,
              })
            }
            className={inputClass}
            placeholder="5"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase text-muted-foreground">
          Status
        </label>
        <Select
          value={variation.status}
          onValueChange={(value) => onUpdate(index, { status: value })}
        >
          <SelectTrigger className="h-[30px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="mt-0.5 inline-flex items-center gap-1 self-end text-[10px] text-destructive hover:underline"
      >
        <Trash2 className="h-3 w-3" />
        Remove
      </button>
    </div>
  );

  // ---- Fallback: not the colour × size case (1 or 3+ attributes) ----
  // Render one card per variation with its attribute combo + all fields.
  if (variationAttributes.length !== 2) {
    const valueName = (v: Variation, attr: LocalAttribute): string => {
      const names = attr.values.split(",").map((s) => s.trim());
      const valueId = v.attributes.find(
        (a) => a.attribute_id === attr.attribute_id
      )?.attribute_value_id;
      const idx = attr.attribute_value_ids.indexOf(valueId ?? -1);
      return idx >= 0 ? names[idx] : "";
    };

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {variations.map((variation, index) => {
          const imgUrl = getImageUrl(variation.image);
          return (
            <div
              key={variation.id ?? index}
              className={`rounded border p-3 ${
                cellHasError(index)
                  ? "border-destructive bg-destructive/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <label className="group relative h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-input bg-background">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImagePlus className="h-4 w-4" />
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUpdate(index, { image: file });
                    }}
                  />
                </label>
                <div className="flex flex-wrap gap-1 text-xs">
                  {variationAttributes.map((attr) => (
                    <span
                      key={attr.id}
                      className="rounded bg-accent px-1.5 py-0.5 font-medium"
                    >
                      {valueName(variation, attr)}
                    </span>
                  ))}
                </div>
              </div>
              {renderFields(variation, index)}
            </div>
          );
        })}
      </div>
    );
  }

  // ---- Colour × size matrix ----
  const colorIdx = variationAttributes.findIndex((a) =>
    /colou?r/i.test(a.name)
  );
  const rowAttr =
    colorIdx >= 0 ? variationAttributes[colorIdx] : variationAttributes[0];
  const colAttr = variationAttributes.find(
    (a) => a.attribute_id !== rowAttr.attribute_id
  )!;

  const rowValues = parseValues(rowAttr);
  const colValues = parseValues(colAttr);

  const valueIdFor = (v: Variation, attributeId: number): number | undefined =>
    v.attributes.find((a) => a.attribute_id === attributeId)?.attribute_value_id;

  const findIndex = (rowId: number, colId: number): number =>
    variations.findIndex(
      (v) =>
        valueIdFor(v, rowAttr.attribute_id) === rowId &&
        valueIdFor(v, colAttr.attribute_id) === colId
    );

  const inRow = (rowId: number) => (v: Variation) =>
    valueIdFor(v, rowAttr.attribute_id) === rowId;

  const rowImage = (rowId: number): File | string | undefined =>
    variations.find((v) => inRow(rowId)(v) && v.image)?.image;

  // Push one shared image onto every variation of this colour group.
  const setRowImage = (rowId: number, image: File | string | undefined) => {
    onBulkUpdate(inRow(rowId), { image });
  };

  // Copy the first filled cell of the row across the whole colour group.
  const copyAcrossRow = (rowId: number) => {
    const source = variations.find(
      (v) => inRow(rowId)(v) && (v.price !== "" || v.quantity > 0)
    );
    if (!source) return;
    onBulkUpdate(inRow(rowId), {
      price: source.price,
      sale_price: source.sale_price,
      quantity: source.quantity,
      low_stock_threshold: source.low_stock_threshold,
      status: source.status,
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Rows are grouped by <span className="font-medium">{rowAttr.name}</span>{" "}
        (one shared image per group) · columns are{" "}
        <span className="font-medium">{colAttr.name}</span>.
      </p>

      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-accent">
              <th className="sticky left-0 z-10 min-w-[220px] border-b border-r border-border bg-accent px-3 py-2 text-left font-semibold">
                {rowAttr.name} \ {colAttr.name}
              </th>
              {colValues.map((col) => (
                <th
                  key={col.id}
                  className="min-w-[190px] border-b border-border px-3 py-2 text-center font-semibold"
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowValues.map((row) => {
              const img = rowImage(row.id);
              const imgUrl = getImageUrl(img);

              return (
                <tr key={row.id} className="border-b border-border last:border-0">
                  {/* Row header: colour name + shared image + copy-across */}
                  <th className="sticky left-0 z-10 border-r border-border bg-card px-3 py-3 text-left align-top">
                    <div className="flex items-start gap-3">
                      <label className="group relative h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-input bg-background">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={row.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImagePlus className="h-5 w-5" />
                          </span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setRowImage(row.id, file);
                          }}
                        />
                      </label>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{row.name}</p>
                        <div className="mt-1 flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => copyAcrossRow(row.id)}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <CopyPlus className="h-3 w-3" />
                            Copy to all {colAttr.name.toLowerCase()}s
                          </button>
                          {imgUrl && (
                            <button
                              type="button"
                              onClick={() => setRowImage(row.id, undefined)}
                              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </th>

                  {/* One full-field cell per size */}
                  {colValues.map((col) => {
                    const index = findIndex(row.id, col.id);
                    const variation = index >= 0 ? variations[index] : null;

                    if (!variation) {
                      return (
                        <td
                          key={col.id}
                          className="border-l border-border px-2 py-2 text-center align-middle text-xs text-muted-foreground"
                        >
                          —
                        </td>
                      );
                    }

                    return (
                      <td
                        key={col.id}
                        className={`border-l border-border px-2 py-2 align-top ${
                          cellHasError(index) ? "bg-destructive/5" : ""
                        }`}
                      >
                        {renderFields(variation, index)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VariationMatrix;
