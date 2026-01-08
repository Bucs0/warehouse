// Dialog for editing existing supplier with items management
// ✅ ENHANCED: Added ability to add new items and edit item details like in AddSupplierDialog

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { normalizeInventoryItems } from '../lib/dataMapper'

export default function EditSupplierDialog({ 
  open, 
  onOpenChange, 
  supplier, 
  inventoryData = [],
  onEdit, 
  onUpdateSupplierItems,
  isReadOnly 
}) {
  const [formData, setFormData] = useState({
    supplierName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true
  })

  const [selectedItemIds, setSelectedItemIds] = useState([])
  // ✅ NEW: States for adding new items
  const [newItemNames, setNewItemNames] = useState([])
  const [newItemInput, setNewItemInput] = useState('')

  // ✅ Normalize inventory data
  const normalizedInventory = useMemo(() => 
    normalizeInventoryItems(inventoryData || []),
    [inventoryData]
  )

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplierName: supplier.supplierName || '',
        contactPerson: supplier.contactPerson || '',
        contactEmail: supplier.contactEmail || '',
        contactPhone: supplier.contactPhone || '',
        address: supplier.address || '',
        isActive: supplier.isActive !== undefined ? supplier.isActive : true
      })

      // Get items that currently have this supplier assigned
      const supplierItems = normalizedInventory
        .filter(item => item.supplierId === supplier.id)
        .map(item => item.id)
      
      setSelectedItemIds(supplierItems)
      
      // ✅ Reset new items when dialog opens
      setNewItemNames([])
      setNewItemInput('')
      
      console.log('📦 Loaded supplier items:', {
        supplierId: supplier.id,
        itemCount: supplierItems.length,
        items: supplierItems
      })
    }
  }, [supplier, normalizedInventory])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemToggle = (itemId) => {
    if (isReadOnly) return
    
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // ✅ NEW: Handle adding new items
  const handleAddNewItem = () => {
    const trimmedName = newItemInput.trim()
    if (!trimmedName) {
      alert('Please enter an item name')
      return
    }

    // Check if item already exists in inventory
    const existsInInventory = normalizedInventory.some(
      item => item.itemName.toLowerCase() === trimmedName.toLowerCase()
    )
    if (existsInInventory) {
      alert('This item already exists in inventory. Please select it from the list above.')
      return
    }

    // Check if already in new items list
    if (newItemNames.includes(trimmedName)) {
      alert('This item is already in the new items list')
      return
    }

    setNewItemNames(prev => [...prev, trimmedName])
    setNewItemInput('')
  }

  // ✅ NEW: Handle removing new items
  const handleRemoveNewItem = (itemName) => {
    setNewItemNames(prev => prev.filter(name => name !== itemName))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isReadOnly) {
      onOpenChange(false)
      return
    }

    // Validate required fields
    if (!formData.supplierName || !formData.contactPerson) {
      alert('Please fill in supplier name and contact person')
      return
    }

    // Email validation
    if (formData.contactEmail && !formData.contactEmail.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    // Update supplier basic info
    const updatedSupplier = {
      ...supplier,
      ...formData,
      newItems: newItemNames // ✅ Include new items to be added
    }

    console.log('💾 Saving supplier with items:', {
      supplier: updatedSupplier,
      selectedItems: selectedItemIds.length,
      newItems: newItemNames.length
    })

    onEdit(updatedSupplier)
    
    // Notify parent about item assignments if handler is provided
    if (onUpdateSupplierItems) {
      onUpdateSupplierItems(supplier.id, selectedItemIds)
    }
    
    onOpenChange(false)
  }

  // Get items that are currently assigned to this supplier
  const currentSupplierItems = normalizedInventory.filter(item => 
    selectedItemIds.includes(item.id)
  )

  // Get items that are NOT assigned to this supplier
  const availableItems = normalizedInventory.filter(item => 
    !selectedItemIds.includes(item.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? 'View Supplier' : 'Edit Supplier'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>
              
              {/* Supplier Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-supplierName">
                  Supplier Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-supplierName"
                  placeholder="e.g., Office Warehouse"
                  value={formData.supplierName}
                  onChange={(e) => handleChange('supplierName', e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </div>

              {/* Contact Person */}
              <div className="space-y-2">
                <Label htmlFor="edit-contactPerson">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-contactPerson"
                  placeholder="e.g., Juan Dela Cruz"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Contact Email */}
                <div className="space-y-2">
                  <Label htmlFor="edit-contactEmail">Contact Email</Label>
                  <Input
                    id="edit-contactEmail"
                    type="email"
                    placeholder="e.g., sales@supplier.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-2">
                  <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                  <Input
                    id="edit-contactPhone"
                    type="tel"
                    placeholder="e.g., +63-912-345-6789"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  placeholder="e.g., Quezon City, Metro Manila"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="edit-isActive">Status</Label>
                <Select
                  id="edit-isActive"
                  value={formData.isActive.toString()}
                  onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                  disabled={isReadOnly}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </div>
            </div>

            {/* Items This Supplier Can Supply Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Items This Supplier Can Supply</h3>
                <Badge variant="outline">
                  {selectedItemIds.length + newItemNames.length} item{selectedItemIds.length + newItemNames.length !== 1 ? 's' : ''} selected
                </Badge>
              </div>

              {normalizedInventory.length > 0 ? (
                <>
                  {/* Currently Assigned Items */}
                  {currentSupplierItems.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-700">
                        ✓ Currently Assigned ({currentSupplierItems.length})
                      </Label>
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-green-50">
                        {currentSupplierItems.map(item => (
                          <label 
                            key={item.id} 
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                              isReadOnly ? 'opacity-60' : 'hover:bg-green-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => handleItemToggle(item.id)}
                              disabled={isReadOnly}
                              className="w-4 h-4"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-sm font-medium">{item.itemName}</span>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Stock: {item.quantity}
                                </Badge>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Items to Assign */}
                  {availableItems.length > 0 && !isReadOnly && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Available Items in Inventory ({availableItems.length})
                      </Label>
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-gray-50">
                        {availableItems.map(item => (
                          <label 
                            key={item.id} 
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleItemToggle(item.id)}
                              className="w-4 h-4"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-sm">{item.itemName}</span>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Stock: {item.quantity}
                                </Badge>
                                {item.supplierId && (
                                  <Badge variant="outline" className="text-xs text-orange-600">
                                    Has Supplier
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: You can assign items from other suppliers to this supplier
                      </p>
                    </div>
                  )}

                  {currentSupplierItems.length === 0 && isReadOnly && (
                    <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-gray-50">
                      No items currently assigned to this supplier.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-yellow-50">
                  No items in inventory. Add items first before assigning to suppliers.
                </p>
              )}

              {/* ✅ NEW: Add New Items Section */}
              {!isReadOnly && (
                <div className="space-y-2 border-t pt-4">
                  <Label className="text-sm font-medium">Add New Items (not in inventory yet):</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type item name and click Add..."
                      value={newItemInput}
                      onChange={(e) => setNewItemInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddNewItem()
                        }
                      }}
                    />
                    <Button 
                      type="button"
                      onClick={handleAddNewItem}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {newItemNames.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs font-medium">New items to be added:</p>
                      <div className="space-y-1">
                        {newItemNames.map((itemName, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded"
                          >
                            <span className="text-sm font-medium">{itemName}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveNewItem(itemName)}
                              className="h-6 text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600">
                        ℹ️ You'll be asked to provide details for these items after updating the supplier
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit">
                Save Changes
                {(selectedItemIds.length > 0 || newItemNames.length > 0) && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedItemIds.length + newItemNames.length} items
                  </Badge>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
