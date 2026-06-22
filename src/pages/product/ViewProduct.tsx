import { useParams, useNavigate } from "react-router-dom";
import { useProductDetail } from "./_hooks/useProduct";
import { ArrowLeft, Pencil, ImageIcon, Layers } from "lucide-react";
import Layout from "../../components/layouts/Layout";

export interface GalleryImage {
  file?: File;
  url?: string;
  uuid?: string;
}

const Pill = ({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: "gray" | "green" | "sky" | "red" | "amber";
}) => {
  const map: Record<string, string> = {
    gray: "bg-zinc-100 text-zinc-500",
    green: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
    sky: "bg-sky-50 text-sky-600 ring-1 ring-sky-200",
    red: "bg-red-50 text-red-500 ring-1 ring-red-200",
    amber: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider uppercase ${map[color]}`}>
      {children}
    </span>
  );
};

const StatBox = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) => (
  <div className="flex flex-col gap-1 border-l-2 border-zinc-200 pl-4">
    <span className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</span>
    <span className={`text-2xl font-bold tabular-nums ${accent ?? "text-zinc-900"}`}>{value}</span>
  </div>
);

const ProductView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, isLoading, isError } = useProductDetail(id!);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-zinc-400 text-sm">Product not found</p>
            <button onClick={() => navigate("/products")} className="text-sm text-zinc-800 underline underline-offset-4">
              ← Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const firstVariation = product.variations[0];
  const isColorType = product.variation_type === "color";
  const isInStock = firstVariation?.stock_status === "in_stock";

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-50 ">

        {/* ── TOPBAR ── */}
        <div className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
          <button
            onClick={() => navigate(`/product-form/${product.id}`)}
            className="flex items-center gap-2 bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* ── BANNER STRIP ── */}
        <div className="bg-white border-b border-zinc-100 px-8 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">{product.code}</span>
                <Pill color="gray">{product.variation_type.replace("_", " ")}</Pill>
                <Pill color={firstVariation?.status === "active" ? "green" : "gray"}>
                  {firstVariation?.status || "N/A"}
                </Pill>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-zinc-400 mt-1 font-mono">{product.slug}</p>
            </div>

            {/* Stock status big */}
            <div className="shrink-0">
              <Pill color={isInStock ? "green" : "red"}>
                {firstVariation?.stock_status?.replace("_", " ") || "—"}
              </Pill>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">

          {/* ROW 1: Image + Details */}
          <div className="grid grid-cols-12 gap-6">

            {/* Featured Image */}
            <div className="col-span-12 md:col-span-5">
              <div className="rounded-2xl overflow-hidden bg-white border border-zinc-200 aspect-[4/5] w-full">
                {product.featured_image ? (
                  <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-200">
                    <ImageIcon className="w-12 h-12" />
                    <span className="text-xs text-zinc-300">No image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 md:col-span-7 flex flex-col gap-5">

              {/* Pricing Card — color type */}
              {isColorType && firstVariation && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-5">Pricing & Stock</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <StatBox label="Price" value={`Rs. ${parseFloat(firstVariation.price).toFixed(2)}`} accent="text-zinc-900" />
                    <StatBox label="Sale Price" value={`Rs. ${parseFloat(firstVariation.sale_price).toFixed(2)}`} accent="text-sky-600" />
                    <StatBox label="Quantity" value={firstVariation.quantity} />
                    <StatBox label="Low Stock At" value={firstVariation.low_stock_threshold} accent="text-amber-500" />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">Description</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>

                {product.composition && (
                  <>
                    <div className="border-t border-zinc-100 my-4" />
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">Composition</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{product.composition}</p>
                  </>
                )}

                {product.excerpt && (
                  <>
                    <div className="border-t border-zinc-100 my-4" />
                    <p className="text-sm text-zinc-500 italic leading-relaxed border-l-2 border-zinc-200 pl-4">
                      {product.excerpt}
                    </p>
                  </>
                )}
              </div>

              {/* Timestamps */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex gap-8">
                {[
                  { label: "Created", value: product.created_at },
                  { label: "Last Updated", value: product.updated_at },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
                    <p className="text-sm font-medium text-zinc-700">
                      {new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2: Gallery */}
          {product.gallery_images && product.gallery_images.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">Gallery</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {(product.gallery_images as GalleryImage[]).map((image, index) =>
                  image.url ? (
                    <div
                      key={index}
                      className="shrink-0 w-36 h-36 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 group"
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* ROW 3: Variations */}
          {!isColorType && product.variations.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400">Variations</p>
                </div>
                <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-3 py-1">
                  {product.variations.length} total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      {["#", "SKU", "Price", "Sale Price", "Qty", "Stock", "Status", "Attributes"].map((h) => (
                        <th key={h} className="text-left text-[10px] uppercase tracking-widest text-zinc-400 pb-3 pr-6 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {product.variations.map((variation, index) => (
                      <tr key={variation.id} className="hover:bg-zinc-50 transition-colors group">
                        <td className="py-3.5 pr-6 text-zinc-400 font-mono text-xs">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="py-3.5 pr-6 font-mono text-xs text-zinc-500">{variation.sku}</td>
                        <td className="py-3.5 pr-6 font-semibold text-zinc-900">
                          Rs.{parseFloat(variation.price).toFixed(2)}
                        </td>
                        <td className="py-3.5 pr-6 font-semibold text-sky-600">
                          Rs.{parseFloat(variation.sale_price).toFixed(2)}
                        </td>
                        <td className="py-3.5 pr-6 text-zinc-700">{variation.quantity}</td>
                        <td className="py-3.5 pr-6">
                          <Pill color={variation.stock_status === "in_stock" ? "green" : "red"}>
                            {variation.stock_status.replace("_", " ")}
                          </Pill>
                        </td>
                        <td className="py-3.5 pr-6">
                          <Pill color={variation.status === "active" ? "green" : "gray"}>
                            {variation.status}
                          </Pill>
                        </td>
                        <td className="py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {variation.attributes?.map((attr: any, idx: number) => (
                              <span key={idx} className="text-[10px] bg-zinc-100 text-zinc-500 rounded px-2 py-0.5">
                                {attr.attribute?.name}: {attr.value?.name}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default ProductView;