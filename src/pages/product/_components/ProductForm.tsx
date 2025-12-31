import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import GeneralInformation from "./GeneralInformation";
import ImageUpload, { GalleryImage } from "./ImageUpload";
import PricingStock from "./PricingStock";
import StatusSection from "./StatusSection";
import VariantsSection from "./VariantsSection";
import { toast } from "sonner";
import Layout from "../../../components/layouts/Layout";
import { ColorProductFormData, SizeColorProductFormData } from "../../../types/product";
import { useProduct, useProductDetail } from "../_hooks/useProduct";

type VariationType = "color" | "size_color";

interface LocalAttribute {
  id: string;
  name: string;
  values: string;
  visibleOnProduct: boolean;
  usedForVariations: boolean;
  attribute_id: number;
  attribute_value_ids: number[];
}

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { actions, isAdding, isUpdating } = useProduct();
  const { product, isLoading: isLoadingProduct } = useProductDetail(id || "");

  const [variationType, setVariationType] = useState<VariationType>("color");

  const [localAttributes, setLocalAttributes] = useState<LocalAttribute[]>([]);

  // Track deletions
  const [deleteFeaturedImage, setDeleteFeaturedImage] = useState(false);
  const [deletedGalleryImageUuids, setDeletedGalleryImageUuids] = useState<string[]>([]);
  const [deletedVariationIds, setDeletedVariationIds] = useState<number[]>([]);

  // Color product state
  const [colorFormData, setColorFormData] = useState<ColorProductFormData>({
    name: "",
    code: "",
    description: "",
    composition: "",
    excerpt: "",
    price: "",
    sale_price: "",
    quantity: 0,
    status: "active",
    variation_type: "color",
    low_stock_threshold: 5,
    category_id: [],
  });

  // Size/Color product state
  const [sizeColorFormData, setSizeColorFormData] = useState<SizeColorProductFormData>({
    name: "",
    code: "",
    description: "",
    composition: "",
    excerpt: "",
    status: "active",
    variation_type: "size_color",
    attributes: [],
    variations: [],
    category_id: [],
  });

  // Updated image state to use GalleryImage type
  const [featuredImage, setFeaturedImage] = useState<File | string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

 
 

useEffect(() => {
  if (isEditMode && product) {
    const varType = product.variation_type as VariationType;
    setVariationType(varType);

    // Extract category IDs
    const categoryIds = (() => {
      const categories = product.category || product.categories;

      if (!categories) return [];
      if (typeof categories === 'string') return [];
      if (Array.isArray(categories)) {
        return categories.map(cat => cat.id);
      }
      // Single category object
      return [categories.id];
    })();

    // Set images if available
    if (product.featured_image) {
      setFeaturedImage(product.featured_image);
    } else {
      setFeaturedImage(null);
    }

    // Parse gallery images with uuid and url
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      const parsedGalleryImages: GalleryImage[] = product.gallery_images.map((img: any) => {
        if (typeof img === 'string') {
          return { url: img };
        } else if (img && typeof img === 'object' && img.url) {
          return { url: img.url, uuid: img.uuid };
        }
        return { url: img };
      });
      setGalleryImages(parsedGalleryImages);
    } else {
      setGalleryImages([]);
    }

    // Reset deletion tracking when loading fresh product data
    setDeleteFeaturedImage(false);
    setDeletedGalleryImageUuids([]);
    setDeletedVariationIds([]);

    if (varType === "color") {
      const variation = product.variations?.[0];

      setColorFormData({
        name: product.name || "",
        code: product.code || "",
        description: product.description || "",
        composition: product.composition || "",
        excerpt: product.excerpt || "",
        price: variation?.price?.toString() || "",
        sale_price: variation?.sale_price?.toString() || "",
        quantity: variation?.quantity || 0,
        status: product.status || "active",
        variation_type: "color",
        low_stock_threshold: variation?.low_stock_threshold || 5,
        category_id: categoryIds,
      });
    } else {
      const usedAttributeValues = new Map<number, Set<number>>();

      product.variations?.forEach((variation: any) => {
        variation.attributes?.forEach((attr: any) => {
          const attrId = attr.attribute.id;
          const valueId = attr.value.id;

          if (!usedAttributeValues.has(attrId)) {
            usedAttributeValues.set(attrId, new Set());
          }
          usedAttributeValues.get(attrId)?.add(valueId);
        });
      });

      const productAttributes = product.attributes?.map((attr: any) => {
        const attributeObj = attr.attribute;
        const usedValueIds = Array.from(usedAttributeValues.get(attributeObj.id) || []);

        return {
          attribute_id: attributeObj.id,
          attribute_value_ids: usedValueIds,
        };
      }) || [];

      const localAttrs: LocalAttribute[] = product.attributes?.map((attr: any) => {
        const attributeObj = attr.attribute;
        const usedValueIds = Array.from(usedAttributeValues.get(attributeObj.id) || []);

        const usedValueNames = attributeObj.attribute_values
          ?.filter((v: any) => usedValueIds.includes(v.id))
          .map((v: any) => v.name)
          .join(", ") || "";

        return {
          id: String(attributeObj.id),
          name: attributeObj.name,
          values: usedValueNames,
          visibleOnProduct: true,
          usedForVariations: true,
          attribute_id: attributeObj.id,
          attribute_value_ids: usedValueIds,
        };
      }) || [];

      setLocalAttributes(localAttrs);

      const mappedVariations = product.variations?.map((variation: any) => ({
        id: variation.id, // Make sure to include the ID
        sku: variation.sku || "",
        price: variation.price?.toString() || "",
        sale_price: variation.sale_price?.toString() || "",
        quantity: variation.quantity || 0,
        low_stock_threshold: variation.low_stock_threshold || 5,
        status: variation.status || "active",
        attributes: variation.attributes?.map((attr: any) => ({
          attribute_id: attr.attribute.id,
          attribute_value_id: attr.value.id,
        })) || [],
      })) || [];

      setSizeColorFormData({
        name: product.name || "",
        code: product.code || "",
        description: product.description || "",
        composition: product.composition || "",
        excerpt: product.excerpt || "",
        status: product.status || "active",
        variation_type: "size_color",
        attributes: productAttributes,
        variations: mappedVariations,
        category_id: categoryIds,
      });
    }

 
  }
}, [product, isEditMode, id]); 




  const handleDeleteFeaturedImage = () => {
    setDeleteFeaturedImage(true);
  };

  const handleDeleteGalleryImage = (uuid: string) => {
    setDeletedGalleryImageUuids(prev => [...prev, uuid]);
  };

  const handleSubmit = async () => {
    try {
      setValidationErrors({});
      const formData = new FormData();

      const currentData = variationType === "color" ? colorFormData : sizeColorFormData;

      if (!currentData.name || !currentData.code) {
        toast.error("Please fill in required fields (Name and Code)");
        return;
      }

      formData.append("name", currentData.name);
      formData.append("code", currentData.code);
      formData.append("description", currentData.description);
      formData.append("status", currentData.status);
      formData.append("variation_type", variationType);

      if (currentData.composition) formData.append("composition", currentData.composition);
      if (currentData.excerpt) formData.append("excerpt", currentData.excerpt);

      if (currentData.category_id && currentData.category_id.length > 0) {
        currentData.category_id.forEach(id => {
          formData.append("category_id[]", id.toString());
        });
      }

      // Handle featured image deletion
      if (deleteFeaturedImage && isEditMode) {
        formData.append("delete_featured_image", "1");
      }

      // Add new featured image if it's a File
      if (featuredImage && featuredImage instanceof File) {
        formData.append("featured_image", featuredImage);
      }

      // Handle gallery images deletion
      if (deletedGalleryImageUuids.length > 0 && isEditMode) {
        deletedGalleryImageUuids.forEach(uuid => {
          formData.append("delete_media_uuids[]", uuid);
        });
      }

      // Add new gallery images
      galleryImages.forEach(img => {
        if (img.file) {
          formData.append("gallery_images[]", img.file);
        }
      });

      if (variationType === "color") {
        formData.append("price", colorFormData.price);
        formData.append("sale_price", colorFormData.sale_price);
        formData.append("quantity", colorFormData.quantity.toString());
        formData.append("low_stock_threshold", colorFormData.low_stock_threshold.toString());
      } else {
        sizeColorFormData.attributes.forEach((attr, attrIdx) => {
          formData.append(`attributes[${attrIdx}][attribute_id]`, attr.attribute_id.toString());
          attr.attribute_value_ids.forEach((valId, valIdx) => {
            formData.append(
              `attributes[${attrIdx}][attribute_value_ids][${valIdx}]`,
              valId.toString()
            );
          });
        });

        if (sizeColorFormData.variations.length === 0) {
          toast.error("Please generate or add at least one variation");
          return;
        }

        sizeColorFormData.variations.forEach((variation, varIdx) => {
          // Only send variations that don't have an ID (new) or have an ID but weren't deleted
          if (!variation.id || !deletedVariationIds.includes(variation.id)) {
            // If variation has an ID, include it for update
            if (variation.id) {
              formData.append(`variations[${varIdx}][id]`, variation.id.toString());
            }

            formData.append(`variations[${varIdx}][sku]`, variation.sku);
            formData.append(`variations[${varIdx}][price]`, variation.price);
            formData.append(`variations[${varIdx}][sale_price]`, variation.sale_price);
            formData.append(`variations[${varIdx}][quantity]`, variation.quantity.toString());
            formData.append(
              `variations[${varIdx}][low_stock_threshold]`,
              variation.low_stock_threshold.toString()
            );
            formData.append(`variations[${varIdx}][status]`, variation.status);

            variation.attributes.forEach((attr, attrIdx) => {
              formData.append(
                `variations[${varIdx}][attributes][${attrIdx}][attribute_id]`,
                attr.attribute_id.toString()
              );
              formData.append(
                `variations[${varIdx}][attributes][${attrIdx}][attribute_value_id]`,
                attr.attribute_value_id.toString()
              );
            });

            if (variation.image instanceof File) {
              formData.append(`variations[${varIdx}][image]`, variation.image);
            }
          }
        });

        // Send deleted variation IDs
        if (deletedVariationIds.length > 0 && isEditMode) {
          deletedVariationIds.forEach(id => {
            formData.append("delete_variation_ids[]", id.toString());
          });
        }
      }

      if (isEditMode && id) {
        formData.append("_method", "PUT");
       
        await actions.update(id, formData);
        toast.success("Product updated successfully!");
      } else {
      
        await actions.add(formData);
        toast.success("Product created successfully!");
      }

     
      window.location.href = "/#/products";

    } catch (error: unknown) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} product:`, error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 422 && axiosError.response?.data?.errors) {
          setValidationErrors(axiosError.response.data.errors);
        }
      }
    }
  };

  if (isEditMode && isLoadingProduct) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading product data...</p>
        </div>
      </Layout>
    );
  }

  const isSubmitting = isAdding || isUpdating;

  return (
    <Layout>
      <div className="space-y-6 mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-foreground">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Variation Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={variationType}
              onValueChange={(value) => setVariationType(value as VariationType)}
              className="flex gap-6"
              disabled={isEditMode}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="color" id="color" disabled={isEditMode} />
                <Label htmlFor="color" className={isEditMode ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                  Simple Product (Single Price/Stock)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="size_color" id="size_color" disabled={isEditMode} />
                <Label htmlFor="size_color" className={isEditMode ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                  Variable Product (Multiple Attributes & Variations)
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-2">
              {isEditMode
                ? "Variation type cannot be changed when editing a product"
                : variationType === "color"
                  ? "Use this for products with a single price and stock quantity"
                  : "Use this for products with multiple attributes like size, color, etc."}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent>
                <GeneralInformation
                  formData={variationType === "color" ? colorFormData : sizeColorFormData}
                  setFormData={(data) => {
                    if (variationType === "color") {
                      setColorFormData(data as ColorProductFormData);
                    } else {
                      setSizeColorFormData(data as SizeColorProductFormData);
                    }
                  }}
                  errors={validationErrors}
                />
              </CardContent>
            </Card>

            {variationType === "color" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing And Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <PricingStock
                    formData={colorFormData}
                    setFormData={setColorFormData}
                    errors={validationErrors}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <VariantsSection
                    formData={sizeColorFormData}
                    setFormData={setSizeColorFormData}
                    initialLocalAttributes={localAttributes}
                    onVariationDeleted={(variationId: number | undefined) => {
                      if (variationId) {
                        setDeletedVariationIds(prev => [...prev, variationId]);
                      }
                    }}

                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  featuredImage={featuredImage}
                  galleryImages={galleryImages}
                  setFeaturedImage={setFeaturedImage}
                  setGalleryImages={setGalleryImages}
                  onDeleteFeaturedImage={handleDeleteFeaturedImage}
                  onDeleteGalleryImage={handleDeleteGalleryImage}
                  errors={validationErrors}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusSection
                  formData={variationType === "color" ? colorFormData : sizeColorFormData}
                  setFormData={(data) => {
                    if (variationType === "color") {
                      setColorFormData(data as ColorProductFormData);
                    } else {
                      setSizeColorFormData(data as SizeColorProductFormData);
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} size="lg" disabled={isSubmitting}>
            {isSubmitting
              ? (isEditMode ? "Updating..." : "Creating...")
              : (isEditMode ? "Update Product" : "Create Product")}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductForm;