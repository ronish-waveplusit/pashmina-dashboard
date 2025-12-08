import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../components/layouts/Layout";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Package, Calendar, TrendingUp, Search, X } from "lucide-react";
import { ITEMS_PER_PAGE } from "../../../constants/common";
import Pagination from "../../../components/pagination/pagination";
import { useProductVariation } from ".././_hooks/useProductVariation";
import { Lot } from "../../../types/product-variation";

const ViewLotsPage = () => {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const lotFilters = useMemo(
    () => ({
      page,
      per_page: ITEMS_PER_PAGE,
      search: debouncedSearchQuery,
    }),
    [page, debouncedSearchQuery]
  );

  const {
    lots,
    lotMeta,
    isLoadingLots,
    isErrorLots,
  } = useProductVariation({}, lotFilters, true);

  // Filter lots for specific product if productId is provided
  const filteredLots = productId 
    ? lots.filter(lot => lot.lotable_id === parseInt(productId))
    : lots;

  const totalQuantity = filteredLots.reduce((sum, lot) => sum + (lot.quantity_received || 0), 0);
  const totalLots = productId ? filteredLots.length : (lotMeta?.total || lots.length);

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  if (isLoadingLots) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading lot history...</div>
        </div>
      </Layout>
    );
  }

  if (isErrorLots) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-600">
          Error loading lot history. Please try again.
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Lot History</h1>
              <p className="text-gray-600 mt-1">
                {productId 
                  ? "View all stock imports for this product" 
                  : "View all stock import records"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Lots</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalLots}</p>
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
                  <p className="text-sm text-gray-600 font-medium">Total Quantity</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalQuantity}</p>
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
                  <p className="text-sm text-gray-600 font-medium">Latest Import</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {filteredLots.length > 0 
                      ? new Date(filteredLots[0].imported_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lots Table Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            {/* Search */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by product name or SKU..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            {filteredLots.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Lot ID
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Imported Date
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Quantity Received
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLots.map((lot: Lot) => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-900 font-mono">
                          #{lot.id}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">
                          {lot.lotable?.product_name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                          {lot.lotable?.sku || 'N/A'}
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
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Imported
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {lotMeta && !productId && (
                  <Pagination
                    meta={lotMeta}
                    setPage={setPage}
                    isLoading={isLoadingLots}
                    itemLabel="lots"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No lot history found</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search"
                    : productId 
                      ? "This product has no import records yet"
                      : "No lots have been created yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ViewLotsPage;