// Index.tsx
import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Plus, Search, X, Tag as TagIcon, Edit, Trash2 } from "lucide-react";
import { useAttribute } from "./_hooks/useAttribute";
import { AttributeForm } from "./_components/AttributeForm";
import { AttributeValueForm } from "./_components/AttributeValueForm";
import { AttributeValuePayload, AttributeWithValues } from "../../types/attribute";
import { useHasPermission } from "../../utils/helper/permissionUtils";
import Pagination from "../../components/pagination/pagination";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { ITEMS_PER_PAGE } from "../../constants/common";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

type ModalMode = "attribute" | "attributeValue" | null;

// Utility function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const Index = () => {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingAttribute, setEditingAttribute] = useState<AttributeWithValues | null>(null);
  const [editingAttributeValue, setEditingAttributeValue] = useState<AttributeValuePayload | null>(null);
  const [selectedAttributeForValue, setSelectedAttributeForValue] = useState<AttributeWithValues | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filters = useMemo(
    () => ({
      page,
      search: debouncedSearchQuery,
      per_page: ITEMS_PER_PAGE,
    }),
    [page, debouncedSearchQuery]
  );

  const {
    attributes: rawAttributes,
    isLoading,
    isError,
    isAdding,
    isUpdating,
    isDeleting,
    attributeToDelete,
    valueToDelete,
    actions,
    meta,
  } = useAttribute(filters);

  // Map API response to component format
  const attributes: AttributeWithValues[] = useMemo(() => {
    if (!rawAttributes) return [];

    return rawAttributes.map((attr: any) => ({
      id: attr.id,
      name: attr.name,
      slug: attr.slug || generateSlug(attr.name),
      attributeValues: attr.attribute_values?.map((val: any) => ({
        id: val.id,
        attribute_id: val.attribute_id,
        name: val.name,
        created_at: val.created_at,
        updated_at: val.updated_at,
      })) || [],
      created_at: attr.created_at,
      updated_at: attr.updated_at,
    }));
  }, [rawAttributes]);

  // Permission checks
  const canCreate = useHasPermission("attribute:create");
  const canEdit = useHasPermission("attribute:update");
  const canDelete = useHasPermission("attribute:delete");

  const handleOpenModal = (
    mode: "attribute" | "attributeValue",
    attribute?: AttributeWithValues,
    attributeValue?: AttributeValuePayload
  ) => {
    setModalMode(mode);

    if (mode === "attribute") {
      setEditingAttribute(attribute || null);
      setEditingAttributeValue(null);
      setSelectedAttributeForValue(null);
    } else {
      setEditingAttribute(null);
      setEditingAttributeValue(attributeValue || null);
      setSelectedAttributeForValue(attribute || null);
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingAttribute(null);
    setEditingAttributeValue(null);
    setSelectedAttributeForValue(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const toggleExpandRow = (attributeId: string | number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attributeId)) {
        newSet.delete(attributeId);
      } else {
        newSet.add(attributeId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border mx-auto" ></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading attributes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-sm text-red-500">Error loading attributes</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-start sm:items-center sm:flex-row flex-col gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
              Product Attributes
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage product attributes and their values
            </p>
          </div>
          {canCreate && (
            <Button
              onClick={() => handleOpenModal("attribute")}
              className="flex items-center text-sm w-full sm:w-auto"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Attribute
            </Button>
          )}
        </div>

        {/* Attribute Modal */}
        <Dialog open={modalMode === "attribute"} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editingAttribute ? "Edit Attribute" : "Add New Attribute"}
              </DialogTitle>
            </DialogHeader>
            <AttributeForm
              initialData={editingAttribute}
              onSubmit={
                editingAttribute
                  ? (data) => actions.updateAttribute(editingAttribute.id, data)
                  : actions.addAttribute
              }
              isSubmitting={editingAttribute ? isUpdating : isAdding}
              onCloseModal={handleCloseModal}
            />
          </DialogContent>
        </Dialog>

        {/* Attribute Value Modal */}
        <Dialog open={modalMode === "attributeValue"} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editingAttributeValue
                  ? "Edit Attribute Value"
                  : `Add Value${selectedAttributeForValue ? ` for ${selectedAttributeForValue.name}` : ""}`}
              </DialogTitle>
            </DialogHeader>
            <AttributeValueForm
              initialData={editingAttributeValue}
              selectedAttribute={selectedAttributeForValue}
              attributes={attributes}
              onSubmit={
                editingAttributeValue
                  ? (data) => actions.updateAttributeValue(editingAttributeValue.id, data)
                  : actions.addAttributeValue
              }
              isSubmitting={editingAttributeValue ? isUpdating : isAdding}
              onCloseModal={handleCloseModal}
            />
          </DialogContent>
        </Dialog>

        {/* Main Card */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-base sm:text-lg">Attributes List</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {/* Search */}
            <div className="relative flex-1 space-y-2 mb-4">
              <Label htmlFor="search" className="text-xs sm:text-sm">
                Search Attributes
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search attributes..."
                  className="pl-8 sm:pl-9 text-xs sm:text-sm h-9 sm:h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Table - Desktop View */}
            {attributes.length > 0 ? (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden md:block rounded-md border"
                style={{ borderColor: "hsl(25 10% 90%)" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Values</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attributes.map((attribute, index) => (
                        <>
                          <TableRow key={attribute.id}>
                            <TableCell className="text-sm">
                              {(page - 1) * ITEMS_PER_PAGE + index + 1}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {attribute.name}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {attribute.slug}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {attribute.attributeValues && attribute.attributeValues.length > 0 ? (
                                  <>
                                    {attribute.attributeValues.slice(0, 3).map((val) => (
                                      <div key={val.id} className="relative group">
                                        <Badge variant="secondary" className="pr-6 text-xs">
                                          {val.name}
                                        </Badge>
                                        {canDelete && (
                                          <button
                                            onClick={() => actions.confirmDeleteValue(val)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    {attribute.attributeValues.length > 3 && (
                                      <Badge
                                        variant="outline"
                                        className="cursor-pointer text-xs"
                                        onClick={() => toggleExpandRow(attribute.id)}
                                      >
                                        +{attribute.attributeValues.length - 3} more
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <Badge variant="outline" className="text-xs">No values</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenModal("attributeValue", attribute)}
                                  className="text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Value
                                </Button>
                                {canEdit && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenModal("attribute", attribute)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => actions.confirmDeleteAttribute(attribute.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(attribute.id) && attribute.attributeValues && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-muted/50">
                                <div className="p-4 space-y-2">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-sm">All Values for {attribute.name}</h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleExpandRow(attribute.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                                    {attribute.attributeValues.map((val) => (
                                      <div
                                        key={val.id}
                                        className="flex items-center justify-between p-2 border rounded-md bg-background"
                                      >
                                        <Badge variant="secondary" className="text-xs">{val.name}</Badge>
                                        <div className="flex gap-1">
                                          {canEdit && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                const valuePayload: AttributeValuePayload = {
                                                  id: val.id,
                                                  attribute_id: val.attribute_id,
                                                  name: val.name,
                                                };
                                                handleOpenModal("attributeValue", attribute, valuePayload);
                                              }}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          )}
                                          {canDelete && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-destructive hover:text-destructive"
                                              onClick={() => actions.confirmDeleteValue(val)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {attributes.map((attribute, index) => (
                    <div key={attribute.id} className="border rounded-lg p-3 space-y-3 bg-card"
                    style={{ borderColor: "hsl(25 10% 90%)" }}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              #{(page - 1) * ITEMS_PER_PAGE + index + 1}
                            </span>
                            <h3 className="font-medium text-sm truncate">{attribute.name}</h3>
                          </div>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                            {attribute.slug}
                          </code>
                        </div>
                      </div>

                      {/* Values */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Values:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {attribute.attributeValues && attribute.attributeValues.length > 0 ? (
                            <>
                              {(expandedRows.has(attribute.id) 
                                ? attribute.attributeValues 
                                : attribute.attributeValues.slice(0, 5)
                              ).map((val) => (
                                <div key={val.id} className="relative group">
                                  <Badge variant="secondary" className="text-xs pr-6">
                                    {val.name}
                                  </Badge>
                                  {canDelete && (
                                    <button
                                      onClick={() => actions.confirmDeleteValue(val)}
                                      className="absolute right-1 top-1/2 -translate-y-1/2"
                                    >
                                      <X className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {attribute.attributeValues.length > 5 && (
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer text-xs"
                                  onClick={() => toggleExpandRow(attribute.id)}
                                >
                                  {expandedRows.has(attribute.id) 
                                    ? "Show less" 
                                    : `+${attribute.attributeValues.length - 5} more`}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">No values</Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t"
                      style={{ borderColor: "hsl(25 10% 90%)" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal("attributeValue", attribute)}
                          className="flex-1 text-xs h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Value
                        </Button>
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal("attribute", attribute)}
                            className="h-8"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => actions.confirmDeleteAttribute(attribute.id)}
                            className="h-8"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {meta && (
                  <Pagination
                    meta={meta}
                    setPage={setPage}
                    isLoading={isLoading}
                    itemLabel="attributes"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <TagIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium">No attributes yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Add your first attribute to get started
                </p>
                {canCreate && (
                  <Button
                    onClick={() => handleOpenModal("attribute")}
                    className="mt-3 sm:mt-4 text-sm"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Attribute
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Attribute Confirmation Dialog */}
        <Dialog
          open={!!attributeToDelete}
          onOpenChange={actions.cancelDelete}
        >
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm">
                Are you sure you want to delete the attribute "
                {attributeToDelete?.name}"?
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                This will also delete all associated attribute values.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={actions.cancelDelete} className="w-full sm:w-auto text-sm" size="sm">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={actions.handleDeleteAttribute}
                disabled={isDeleting}
                className="w-full sm:w-auto text-sm"
                size="sm"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Attribute Value Confirmation Dialog */}
        <Dialog open={!!valueToDelete} onOpenChange={actions.cancelDelete}>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Confirm Delete</DialogTitle>
            </DialogHeader>
            <div>
              <p className="text-sm">
                Are you sure you want to delete the value "{valueToDelete?.name}"?
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={actions.cancelDelete} className="w-full sm:w-auto text-sm" size="sm">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={actions.handleDeleteValue}
                disabled={isDeleting}
                className="w-full sm:w-auto text-sm"
                size="sm"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Index;