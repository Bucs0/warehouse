// ✅ FIXED VERSION - InventoryTable.jsx with proper dataMapper import

import { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import AddItemDialog from './AddItemDialog'
import EditItemDialog from './EditItemDialog'
import LocationManagementDialog from './LocationManagementDialog'
import { normalizeInventoryItems } from '../lib/dataMapper'

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
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)

  // Enhanced debug logging
  useEffect(() => {
    console.group('🔍 InventoryTable Debug Info')
    console.log('Raw inventoryData:', inventoryData)
    console.log('Is Array?', Array.isArray(inventoryData))
    console.log('Length:', inventoryData?.length)
    console.log('First Item:', inventoryData?.[0])
    console.log('User:', user)
    console.log('Categories:', categories)
    console.log('Locations:', locations)
    console.log('Suppliers:', suppliers)
    console.groupEnd()
  }, [inventoryData, user, categories, locations, suppliers])

  // ✅ FIXED: Proper normalization using dataMapper
  const normalizedInventory = useMemo(() => {
    console.log('🔄 Starting normalization...')
    
    if (!inventoryData) {
      console.warn('⚠️ No inventoryData provided')
      return []
    }
    
    if (!Array.isArray(inventoryData)) {
      console.error('❌ inventoryData is not an array:', typeof inventoryData)
      return []
    }
    
    try {
      const normalized = normalizeInventoryItems(inventoryData)
      console.log('✅ Normalized:', normalized.length, 'items')
      console.log('First normalized item:', normalized[0])
      return normalized
    } catch (error) {
      console.error('❌ Normalization error:', error)
      // Fallback: return items as-is if normalization fails
      return inventoryData.map(item => ({
        id: item.id,
        itemName: item.item_name || item.itemName || 'Unknown',
        category: item.category || 'N/A',
        quantity: item.quantity || 0,
        location: item.location || 'N/A',
        reorderLevel: item.reorder_level || item.reorderLevel || 0,
        price: item.price || 0,
        supplier: item.supplier || '',
        supplierId: item.supplier_id || item.supplierId,
        damagedStatus: item.damaged_status || item.damagedStatus || 'Good'
      }))
    }
  }, [inventoryData])

  // ✅ FIXED: Better filtering with null checks
  const filteredItems = useMemo(() => {
    return normalizedInventory.filter(item => {
      if (!item) return false
      
      try {
        const itemName = (item.itemName || '').toLowerCase()
        const category = (item.category || '').toLowerCase()
        const location = (item.location || '').toLowerCase()
        const search = searchTerm.toLowerCase()
        
        const matchesSearch = itemName.includes(search) ||
                             category.includes(search) ||
                             location.includes(search)
        
        let matchesStatus = true
        if (filterStatus === 'low-stock') {
          const qty = item.quantity || 0
          const reorder = item.reorderLevel || 0
          matchesStatus = qty <= reorder
        }

        return matchesSearch && matchesStatus
      } catch (error) {
        console.error('❌ Filter error:', error, item)
        return false
      }
    })
  }, [normalizedInventory, searchTerm, filterStatus])

  // Count low stock items
  const lowStockCount = normalizedInventory.filter(item => 
    (item.quantity || 0) <= (item.reorderLevel || 0)
  ).length

  console.log('📊 Final filtered items:', filteredItems.length)

  const handleDelete = (item) => {
    const name = item.itemName || 'this item'
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDeleteItem(item.id)
    }
  }

  // ✅ FIXED: Show loading state
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Inventory Management</CardTitle>
            
            {user?.role === 'Admin' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsLocationDialogOpen(true)}
                  variant="outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage Locations
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by name, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
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
          <div className="rounded-md border">
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
                            <div className="text-6xl mb-4">📦</div>
                            <div className="text-lg font-semibold">No inventory items found</div>
                            <div className="text-sm text-muted-foreground max-w-md mx-auto">
                              {inventoryData?.length === 0 ? (
                                <>
                                  <p className="mb-3">Your database appears to be empty.</p>
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                    <p className="font-semibold mb-2">Quick Fix:</p>
                                    <ol className="space-y-1 text-sm">
                                      <li>1. Open terminal in backend folder</li>
                                      <li>2. Run: <code className="bg-blue-100 px-2 py-1 rounded">node setup.js</code></li>
                                      <li>3. Refresh this page</li>
                                    </ol>
                                  </div>
                                </>
                              ) : (
                                <p>Add your first item using the "Add Item" button above</p>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl mb-4">🔍</div>
                            <div className="text-lg font-semibold">No items match your search</div>
                            <div className="text-sm text-muted-foreground">
                              Try adjusting your filters or search term
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

          {filteredItems.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredItems.length} of {normalizedInventory.length} items
            </p>
          )}
        </CardContent>
      </Card>

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