import { useParams, useNavigate } from "react-router-dom";
import { useProductDetail } from "./_hooks/useProduct";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Edit, Package, Layers, ArrowDownUp } from "lucide-react";
import Layout from "../../components/layouts/Layout";

const ProductView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, isLoading, isError } = useProductDetail(id!);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load product details</p>
              <Button onClick={() => navigate("/products")}>Back to Products</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstVariation = product.variations[0];
  const isColorType = product.variation_type === "color";

  return (
    <Layout>
    <div className="container mx-auto p-6 max-w-8xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>
        <Button onClick={() => navigate(`/product-form/${product.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product Code</p>
                  <p className="font-medium">{product.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Slug</p>
                  <p className="font-medium">{product.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Variation Type</p>
                  <Badge variant="outline" className="capitalize">
                    {product.variation_type.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    variant={firstVariation?.status === "active" ? "default" : "secondary"}
                  >
                    {firstVariation?.status || "N/A"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700">{product.description}</p>
              </div>

              {product.composition && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Composition</p>
                    <p className="text-gray-700">{product.composition}</p>
                  </div>
                </>
              )}

              {product.excerpt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Excerpt</p>
                    <p className="text-gray-700">{product.excerpt}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Stock Card (for color type) */}
          {isColorType && firstVariation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                
                  <ArrowDownUp className="h-5 w-5" />
                  Pricing & Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      Rs. {parseFloat(firstVariation.price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sale Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      Rs. {parseFloat(firstVariation.sale_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="text-2xl font-bold">{firstVariation.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Low Stock Threshold</p>
                    <p className="text-2xl font-bold">{firstVariation.low_stock_threshold}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Stock Status</p>
                  <Badge
                    variant={firstVariation.stock_status === "in_stock" ? "default" : "destructive"}
                    className="mt-1"
                  >
                    {firstVariation.stock_status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variations Card (for size_color type) */}
          {!isColorType && product.variations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Product Variations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.variations.map((variation, index) => (
                    <div
                      key={variation.id}
                      className="border border-[#EDEAE7] rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">Variation #{index + 1}</p>
                          <p className="text-sm text-gray-500">SKU: {variation.sku}</p>
                        </div>
                        <Badge
                          variant={variation.status === "active" ? "default" : "secondary"}
                        >
                          {variation.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="font-semibold text-green-600">
                            Rs.{parseFloat(variation.price).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Sale Price</p>
                          <p className="font-semibold text-blue-600">
                            Rs.{parseFloat(variation.sale_price).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="font-semibold">{variation.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Stock Status</p>
                          <Badge
                            variant={variation.stock_status === "in_stock" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {variation.stock_status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      {variation.attributes && variation.attributes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#EDEAE7]">
                          <p className="text-xs text-gray-500 mb-2">Attributes</p>
                          <div className="flex flex-wrap gap-2">
                            {variation.attributes.map((attr: any, idx: number) => (
                              <Badge key={idx} variant="outline">
                                {attr.attribute?.name}: {attr.value?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          {product.featured_image && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={product.featured_image}
                  alt={product.name}
                  className="w-full rounded-lg object-cover"
                />
              </CardContent>
            </Card>
          )}

          {/* Gallery Images */}
          {product.gallery_images && product.gallery_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {product.gallery_images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full rounded-lg object-cover aspect-square"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {new Date(product.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {new Date(product.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default ProductView;