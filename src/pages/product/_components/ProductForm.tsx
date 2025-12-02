import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import GeneralInformation from "./GeneralInformation";
import ImageUpload from "./ImageUpload";
import PricingStock from "./PricingStock";
import StatusSection from "./StatusSection";
import VariantsSection from "./VariantsSection";
import { toast } from "sonner";
import Layout from "../../../components/layouts/Layout";
import {ProductFormData} from "../../../types/product";

const ProductForm = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    description: "",
    ingredients: "",
    details: "",
    images: [],
    sellingPrice: "",
    costPrice: "",
    stockQuantity: "",
    lowStockThreshold: "",
    status: "",
    attributes: [],
    variations: [],
  });

  const handleSubmit = () => {
    if (!formData.productName) {
      toast.error("Please enter a product name");
      return;
    }
    
    console.log("Product Data:", formData);
    toast.success("Product created successfully!");
  };

  return (
   < Layout>
    <div className="space-y-6 mt-5">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-foreground">Add New Product</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent>
              <GeneralInformation formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing And Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <PricingStock formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <VariantsSection formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Img</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing And Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Selling Price</label>
                  <input
                    type="text"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Stock Quantity</label>
                  <input
                    type="text"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusSection formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={handleSubmit} size="lg">
          Create Product
        </Button>
      </div>
    </div>
    </Layout>
  );
};

export default ProductForm;