// 🐛 MINIMAL DEBUG VERSION - InventoryTable.jsx

import { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import AddItemDialog from './AddItemDialog'
import EditItemDialog from './EditItemDialog'
import LocationManagementDialog from './LocationManagementDialog'

// Import with error handling
let normalizeInventoryItems
try {
  normalizeInventoryItems = require('../lib/dataMapper').normalizeInventoryItems
  console.log('✅ Normalizer imported')
} catch (e) {
  console.error('❌ Import failed:', e)
  normalizeInventoryItems = (items) => items || []
}

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

  // Debug logging
  useEffect(() => {
    console.group('🔍 InventoryTable Debug')
    console.log('inventoryData:', inventoryData)
    console.log('Type:', Array.isArray(inventoryData) ? 'Array' : typeof inventoryData)
    console.log('Length:', inventoryData?.length)
    console.log('User:', user)
    console.log('Categories:', categories?.length)
    console.log('Locations:', locations?.length)
    console.groupEnd()
  }, [inventoryData, user, categories, locations])

  // Normalize with logging
  const normalizedInventory = useMemo(() => {
    console.log('🔄 Normalizing...', inventoryData?.length, 'items')
    
    if (!inventoryData || !Array.isArray(inventoryData)) {
      console.warn('⚠️ Invalid data:', inventoryData)
      return []
    }
    
    try {
      const result = normalizeInventoryItems(inventoryData)
      console.log('✅ Normalized:', result?.length, 'items')
      return result || []
    } catch (error) {
      console.error('❌ Normalization error:', error)
      return inventoryData
    }
  }, [inventoryData])

  const filteredItems = normalizedInventory.filter(item => {
    if (!item) return false
    
    try {
      const itemName = item.itemName || item.item_name || ''
      const category = item.category || item.category_name || ''
      const location = item.location || item.location_name || ''
      
      const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesStatus = true
      if (filterStatus === 'low-stock') {
        const qty = item.quantity || 0
        const reorder = item.reorderLevel || item.reorder_level || 0
        matchesStatus = qty <= reorder
      }

      return matchesSearch && matchesStatus
    } catch (error) {
      console.error('❌ Filter error:', error, item)
      return false
    }
  })

  console.log('📊 Rendering:', filteredItems.length, 'items')

  const handleDelete = (item) => {
    const name = item.itemName || item.item_name || 'this item'
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDeleteItem(item.id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Debug Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <div className="font-bold mb-2">🐛 Debug Information:</div>
        <div className="grid grid-cols-2 gap-2">
          <div>Raw Data: {inventoryData?.length || 0}</div>
          <div>Normalized: {normalizedInventory.length}</div>
          <div>Filtered: {filteredItems.length}</div>
          <div>User: {user?.name || 'Unknown'}</div>
        </div>
      </div>

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
                onClick={() => {
                  console.log('Low stock filter clicked')
                  setFilterStatus('low-stock')
                }}
              >
                Low Stock
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
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="space-y-4">
                        <div className="text-muted-foreground">
                          {normalizedInventory.length === 0 ? (
                            <div>
                              <div className="text-lg font-semibold mb-2">No inventory data</div>
                              <div className="text-sm">Check console for debug info (F12)</div>
                            </div>
                          ) : (
                            'No items match your search/filter'
                          )}
                        </div>
                        
                        {normalizedInventory.length === 0 && (
                          <div className="text-left max-w-md mx-auto bg-yellow-50 p-4 rounded border">
                            <div className="font-semibold mb-2">Troubleshooting:</div>
                            <ul className="text-sm space-y-1">
                              <li>• Check browser console (F12)</li>
                              <li>• Verify backend is running</li>
                              <li>• Check database has data</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const itemName = item.itemName || item.item_name || 'Unknown'
                    const category = item.category || item.category_name || 'N/A'
                    const location = item.location || item.location_name || 'N/A'
                    const quantity = item.quantity || 0
                    const reorderLevel = item.reorderLevel || item.reorder_level || 0
                    const status = item.damagedStatus || item.damaged_status || 'Good'
                    const price = item.price || 0
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{itemName}</TableCell>
                        
                        <TableCell>
                          <Badge variant="outline">{category}</Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={quantity <= reorderLevel ? 'text-orange-600 font-semibold' : ''}>
                              {quantity}
                            </span>
                            {quantity <= reorderLevel && (
                              <Badge variant="warning" className="text-xs">Low</Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>{location}</TableCell>
                        
                        <TableCell>
                          <Badge variant={status === 'Good' ? 'success' : 'destructive'}>
                            {status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          ₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
                    )
                  })
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