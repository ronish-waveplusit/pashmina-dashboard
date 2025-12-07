import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useProduct } from "../_hooks/useProduct";

type VariationType = "color" | "size_color";

const ProductForm = () => {
  const navigate = useNavigate();
  const { actions, isAdding } = useProduct();
  
  const [variationType, setVariationType] = useState<VariationType>("color");
  
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

  // Shared image state
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

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

      // Add images
      if (featuredImage) {
        formData.append("featured_image", featuredImage);
      }

      galleryImages.forEach(img => {
        formData.append("gallery_images[]", img);
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

      await actions.add(formData);
      toast.success("Product created successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    }
  };

  return (
    <Layout>
      <div className="space-y-6 mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-foreground">Add New Product</h2>
        </div>

        {/* Variation Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variation Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={variationType}
              onValueChange={(value) => setVariationType(value as VariationType)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="color" id="color" />
                <Label htmlFor="color" className="cursor-pointer">
                  Simple Product (Single Price/Stock)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="size_color" id="size_color" />
                <Label htmlFor="size_color" className="cursor-pointer">
                  Variable Product (Multiple Attributes & Variations)
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-2">
              {variationType === "color"
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
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} size="lg" disabled={isAdding}>
            {isAdding ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductForm;