// ✅ CLEAN PRODUCTION VERSION - InventoryTable.jsx

import { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import AddItemDialog from './AddItemDialog'
import EditItemDialog from './EditItemDialog'
import LocationManagementDialog from './LocationManagementDialog'

export default function InventoryTable({ 
  user, 
  inventoryData, 
  suppliers,
  categories,
  locations, 
  onAddItem, 
  onEditItem, 
  onDeleteItem,
  onAddLocation, 
  onEditLocation,  
  onDeleteLocation  
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)

  // Simple normalization - handles both camelCase and snake_case
  const normalizeItem = (item) => {
    if (!item) return null
    
    return {
      id: item.id,
      itemName: item.item_name || item.itemName || 'Unknown Item',
      category: item.category || item.category_name || 'Uncategorized',
      quantity: Number(item.quantity) || 0,
      location: item.location || item.location_name || 'No Location',
      reorderLevel: Number(item.reorder_level || item.reorderLevel) || 10,
      price: Number(item.price) || 0,
      supplier: item.supplier || item.supplier_name || '',
      supplierId: item.supplier_id || item.supplierId,
      damagedStatus: item.damaged_status || item.damagedStatus || 'Good'
    }
  }

  // Normalize inventory data
  const normalizedInventory = useMemo(() => {
    if (!inventoryData || !Array.isArray(inventoryData)) return []
    return inventoryData.map(normalizeItem).filter(Boolean)
  }, [inventoryData])

  // Get unique categories from inventory
  const uniqueCategories = useMemo(() => {
    const cats = new Set()
    normalizedInventory.forEach(item => {
      if (item.category) cats.add(item.category)
    })
    return Array.from(cats).sort()
  }, [normalizedInventory])

  // Filter items
  const filteredItems = useMemo(() => {
    return normalizedInventory.filter(item => {
      if (!item) return false
      
      const itemName = String(item.itemName || '').toLowerCase()
      const category = String(item.category || '').toLowerCase()
      const location = String(item.location || '').toLowerCase()
      const search = searchTerm.toLowerCase()
      
      const matchesSearch = itemName.includes(search) ||
                           category.includes(search) ||
                           location.includes(search)
      
      let matchesStatus = true
      if (filterStatus === 'low-stock') {
        matchesStatus = item.quantity <= item.reorderLevel
      }

      let matchesCategory = true
      if (filterCategory !== 'all') {
        matchesCategory = item.category === filterCategory
      }

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [normalizedInventory, searchTerm, filterStatus, filterCategory])

  const lowStockCount = normalizedInventory.filter(item => 
    item.quantity <= item.reorderLevel
  ).length

  const handleDelete = (item) => {
    if (window.confirm(`Delete "${item.itemName}"?`)) {
      onDeleteItem(item.id)
    }
  }

  // Loading state
  if (!inventoryData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* MAIN INVENTORY CARD */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Inventory Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {normalizedInventory.length} total items • {filteredItems.length} showing
              </p>
            </div>
            
            {user?.role === 'Admin' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => setIsLocationDialogOpen(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Locations
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </Button>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="search"
                placeholder="Search by name, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Category Filter Dropdown */}
              <select
                className="h-9 rounded-md border-2 border-blue-500 bg-blue-50 px-3 py-1 text-sm font-medium min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-100 transition-colors"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({normalizedInventory.length})
              </Button>
              <Button 
                variant={filterStatus === 'low-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('low-stock')}
              >
                Low Stock {lowStockCount > 0 && `(${lowStockCount})`}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="space-y-4">
                        {normalizedInventory.length === 0 ? (
                          <>
                            <div className="text-6xl">📦</div>
                            <div className="text-xl font-bold">No Items Found</div>
                            <div className="text-muted-foreground">
                              <p>Add your first item using the "Add Item" button above</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl">🔍</div>
                            <div className="text-lg font-semibold">No Match Found</div>
                            <div className="text-sm text-muted-foreground">
                              {searchTerm && <p>Search: "{searchTerm}"</p>}
                              {filterStatus !== 'all' && <p>Filter: {filterStatus}</p>}
                              {filterCategory !== 'all' && <p>Category: {filterCategory}</p>}
                              <p className="mt-2">Try different search terms or filters</p>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={item.quantity <= item.reorderLevel ? 'text-orange-600 font-semibold' : ''}>
                            {item.quantity}
                          </span>
                          {item.quantity <= item.reorderLevel && (
                            <Badge variant="warning" className="text-xs">Low</Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>{item.location}</TableCell>
                      
                      <TableCell>
                        <Badge variant={item.damagedStatus === 'Good' ? 'success' : 'destructive'}>
                          {item.damagedStatus}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        ₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingItem(item)}
                          >
                            Edit
                          </Button>
                          
                          {user?.role === 'Admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="space-y-4">
                  {normalizedInventory.length === 0 ? (
                    <>
                      <div className="text-6xl">📦</div>
                      <div className="text-xl font-bold">No Items Found</div>
                      <div className="text-muted-foreground">
                        <p>Add your first item using the "Add Item" button above</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl">🔍</div>
                      <div className="text-lg font-semibold">No Match Found</div>
                      <div className="text-sm text-muted-foreground">
                        {searchTerm && <p>Search: "{searchTerm}"</p>}
                        {filterStatus !== 'all' && <p>Filter: {filterStatus}</p>}
                        {filterCategory !== 'all' && <p>Category: {filterCategory}</p>}
                        <p className="mt-2">Try different search terms or filters</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.itemName}</h3>
                        <Badge variant="outline" className="mt-1">{item.category}</Badge>
                      </div>
                      <Badge variant={item.damagedStatus === 'Good' ? 'success' : 'destructive'}>
                        {item.damagedStatus}
                      </Badge>
                    </div>
                    
                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between py-2 border-y">
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-2xl font-bold ${
                            item.quantity <= item.reorderLevel ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {item.quantity}
                          </p>
                          {item.quantity <= item.reorderLevel && (
                            <Badge variant="warning" className="text-xs">Low</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-xl font-bold text-blue-600">
                          ₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">{item.location}</span>
                    </div>
                    
                    {/* Supplier */}
                    {item.supplier && (
                      <div className="text-xs text-muted-foreground">
                        Supplier: {item.supplier}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingItem(item)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      
                      {user?.role === 'Admin' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item)}
                          className="flex-1"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {filteredItems.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredItems.length} of {normalizedInventory.length} items
            </p>
          )}
        </CardContent>
      </Card>

      {/* DIALOGS */}
      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={onAddItem}
        suppliers={suppliers}
        categories={categories}
        locations={locations}
      />

      {editingItem && (
        <EditItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onEdit={onEditItem}
          suppliers={suppliers}
          categories={categories}
          locations={locations}
        />
      )}

      <LocationManagementDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        locations={locations}
        inventoryData={inventoryData}
        onAddLocation={onAddLocation}
        onEditLocation={onEditLocation}
        onDeleteLocation={onDeleteLocation}
      />
    </div>
  )
}