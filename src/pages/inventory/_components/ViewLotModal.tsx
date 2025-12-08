import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../components/layouts/Layout";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, Package, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { getLotById } from "../../../api/product-variation"; // Update with your actual path
import { ProductVariation } from "../../../types/product-variation";
import { Lot } from "../../../types/product-variation";

const LotView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [productVariation, setProductVariation] = useState<ProductVariation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLotData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await getLotById(id);
        setProductVariation(data);
      } catch (err) {
        setError("Failed to load lot data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLotData();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading lot details...</div>
        </div>
      </Layout>
    );
  }

  if (error || !productVariation) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-600">
          {error || "Product variation not found"}
        </div>
      </Layout>
    );
  }

  const totalQuantityReceived = productVariation?.lots?.reduce(
  (sum: number, lot: Lot) => sum + (lot?.quantity_received || 0), 
  0
) || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Product Variation Lots
              </h1>
              <p className="text-gray-600 mt-1">
                SKU: {productVariation.sku}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Lots</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {productVariation?.lots?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Current Stock</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {productVariation.quantity}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Received</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totalQuantityReceived}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Price</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    Rs.{productVariation.price}
                  </p>
                  {productVariation.sale_price && (
                    <p className="text-sm text-green-600 font-medium">
                      Sale: Rs. {productVariation.sale_price}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Details Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Stock Status</p>
                <p className="font-medium text-gray-900 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    productVariation.stock_status === 'in_stock' 
                      ? 'bg-green-100 text-green-800'
                      : productVariation.stock_status === 'low_stock'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {productVariation?.stock_status?.replace('_', ' ').toUpperCase()}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-gray-900 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    productVariation.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {productVariation?.status?.toUpperCase()}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock Threshold</p>
                <p className="font-medium text-gray-900 mt-1">
                  {productVariation.low_stock_threshold}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900 mt-1">
                  {new Date(productVariation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lots Table Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Import History
            </h2>

           {productVariation.lots && productVariation.lots.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Lot ID
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Imported Date
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Quantity Received
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productVariation.lots && productVariation.lots.map((lot: Lot) => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-900 font-mono">
                          #{lot.id}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(lot.imported_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            +{lot.quantity_received}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(lot.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No lot history found
                </h3>
                <p className="text-gray-600">
                  This product variation has no import records yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LotView;