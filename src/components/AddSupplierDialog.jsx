
// Dialog for adding new supplier with item selection

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function AddSupplierDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  inventoryData = [],
  categories = []
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
  const [newItemNames, setNewItemNames] = useState([])
  const [newItemInput, setNewItemInput] = useState('')

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemToggle = (itemId) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleAddNewItem = () => {
    const trimmedName = newItemInput.trim()
    if (!trimmedName) {
      alert('Please enter an item name')
      return
    }

    // Check if item already exists in inventory
    const existsInInventory = inventoryData.some(
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

  const handleRemoveNewItem = (itemName) => {
    setNewItemNames(prev => prev.filter(name => name !== itemName))
  }

  const handleSubmit = () => {
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

    // Create supplier with selected items
    const supplierData = {
      ...formData,
      suppliedItemIds: selectedItemIds,
      newItems: newItemNames
    }

    onAdd(supplierData)

    // Reset form
    setFormData({
      supplierName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      isActive: true
    })
    setSelectedItemIds([])
    setNewItemNames([])
    setNewItemInput('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="supplierName">
                Supplier Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supplierName"
                placeholder="jomissmart@gmail.com"
                value={formData.supplierName}
                onChange={(e) => handleChange('supplierName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">
                Contact Person <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactPerson"
                placeholder="berdecaloy@gmail.com"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="chiefmayo2024@gmail.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="e.g., +63-912-345-6789"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="e.g., Quezon City, Metro Manila"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                id="isActive"
                value={formData.isActive.toString()}
                onChange={(e) => handleChange('isActive', e.target.value === 'true')}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>

          {/* Items This Supplier Can Supply */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-sm">Items This Supplier Can Supply</h3>
            
            {/* Existing Items Selection */}
            {inventoryData.length > 0 && (
              <div className="space-y-2">
                <Label>Select from existing inventory:</Label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-gray-50">
                  {inventoryData.map(item => (
                    <label 
                      key={item.id} 
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => handleItemToggle(item.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm">{item.itemName}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedItemIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedItemIds.length} item(s) selected
                  </p>
                )}
              </div>
            )}

            {/* Add New Items */}
            <div className="space-y-2">
              <Label>Add new items (not in inventory yet):</Label>
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
                    ℹ️ You'll be asked to provide details for these items after adding the supplier
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Supplier
            {(selectedItemIds.length > 0 || newItemNames.length > 0) && (
              <Badge variant="secondary" className="ml-2">
                {selectedItemIds.length + newItemNames.length} items
              </Badge>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}