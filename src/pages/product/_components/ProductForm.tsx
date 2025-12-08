import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import GeneralInformation from "./GeneralInformation";
import ImageUpload from "./ImageUpload";
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [localAttributes, setLocalAttributes] = useState<LocalAttribute[]>([]);
  
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

  // Shared image state - can be File (new upload) or string (existing URL)
  const [featuredImage, setFeaturedImage] = useState<File | string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(File | string)[]>([]);

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && product && !isInitialized) {
      const varType = product.variation_type as VariationType;
      setVariationType(varType);

      // Extract category IDs
      const categoryIds = (() => {
  if (!product.categories) return [];
  if (typeof product.categories === 'string') return [];
  if (Array.isArray(product.categories)) {
    return product.categories.map(cat => cat.id);
  }
  // Single category object
  return [product.categories.id];
})();

      // Set images if available
      if (product.featured_image) {
        setFeaturedImage(product.featured_image);
      }
      if (product.gallery_images && Array.isArray(product.gallery_images)) {
        setGalleryImages(product.gallery_images);
      }

      if (varType === "color") {
        // For simple products, data is in the first variation
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
        // For variable products, we need to find which attribute values are actually used
        // by checking the variations
        const usedAttributeValues = new Map<number, Set<number>>();
        
        // Collect all attribute value IDs used in variations
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

        // Map attributes with only the used values
        const productAttributes = product.attributes?.map((attr: any) => {
          const attributeObj = attr.attribute;
          const usedValueIds = Array.from(usedAttributeValues.get(attributeObj.id) || []);
          
          return {
            attribute_id: attributeObj.id,
            attribute_value_ids: usedValueIds,
          };
        }) || [];

        // Create local attributes for the VariantsSection
        const localAttrs: LocalAttribute[] = product.attributes?.map((attr: any) => {
          const attributeObj = attr.attribute;
          const usedValueIds = Array.from(usedAttributeValues.get(attributeObj.id) || []);
          
          // Get names only for used values
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

        // Map variations
        const mappedVariations = product.variations?.map((variation: any) => ({
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

      setIsInitialized(true);
    }
  }, [product, isEditMode, isInitialized]);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      
      // Add common fields
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

      // Add categories
      if (currentData.category_id && currentData.category_id.length > 0) {
        currentData.category_id.forEach(id => {
          formData.append("category_id[]", id.toString());
        });
      }

      // Add images (only if they are new File uploads)
      if (featuredImage && featuredImage instanceof File) {
        formData.append("featured_image", featuredImage);
      }

      galleryImages.forEach(img => {
        if (img instanceof File) {
          formData.append("gallery_images[]", img);
        }
      });

      // Add variation-specific fields
      if (variationType === "color") {
        formData.append("price", colorFormData.price);
        formData.append("sale_price", colorFormData.sale_price);
        formData.append("quantity", colorFormData.quantity.toString());
        formData.append("low_stock_threshold", colorFormData.low_stock_threshold.toString());
      } else {
        // Add attributes
        sizeColorFormData.attributes.forEach((attr, attrIdx) => {
          formData.append(`attributes[${attrIdx}][attribute_id]`, attr.attribute_id.toString());
          attr.attribute_value_ids.forEach((valId, valIdx) => {
            formData.append(
              `attributes[${attrIdx}][attribute_value_ids][${valIdx}]`,
              valId.toString()
            );
          });
        });

        // Add variations
        if (sizeColorFormData.variations.length === 0) {
          toast.error("Please generate or add at least one variation");
          return;
        }

        sizeColorFormData.variations.forEach((variation, varIdx) => {
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
        });
      }

      if (isEditMode && id) {
        // Update existing product
        await actions.update(id, formData);
        toast.success("Product updated successfully!");
      } else {
        // Create new product
        await actions.add(formData);
        toast.success("Product created successfully!");
      }
      
      navigate("/products");
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} product:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
    }
  };

  // Show loading state when fetching product data
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

        {/* Variation Type Selection - Disabled in edit mode */}
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