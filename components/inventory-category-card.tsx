import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export const InventoryByCategory: React.FC<InventoryByCategoryProps> = ({
  categories,
  inventoryItems,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryItems = inventoryItems.filter(
              (item) => item.category === category.id
            );
            const categoryValue = categoryItems.reduce(
              (sum, item) => sum + Number(item.price) * item.quantity,
              0
            );

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Items</p>
                      <p className="font-medium">{categoryItems.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Value</p>
                      <p className="font-medium">
                        ${categoryValue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-medium">
                        {categoryItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-4 text-gray-500">
              No categories found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};