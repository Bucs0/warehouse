// ✅ FIXED EditItemDialog.jsx - Shows proper location names

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'

const CATEGORIES = ['Office Supplies', 'Equipment', 'Furniture', 'Electronics', 'Other']

export default function EditItemDialog({ 
  open, 
  onOpenChange, 
  item, 
  onEdit, 
  suppliers, 
  categories,
  locations = []  
}) {
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Office Supplies',
    quantity: '',
    location: '',
    reorderLevel: '',
    price: '',
    supplier: '',
    supplierId: null
  })

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName || '',
        category: item.category || 'Office Supplies',
        quantity: item.quantity?.toString() || '',
        location: item.location || '',
        reorderLevel: item.reorderLevel?.toString() || '',
        price: item.price?.toString() || '',
        supplier: item.supplier || '',
        supplierId: item.supplierId || null
      })
    }
  }, [item])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSupplierChange = (supplierId) => {
    const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId))
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplierId: selectedSupplier.id,
        supplier: selectedSupplier.supplierName || selectedSupplier.supplier_name || ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.itemName || !formData.quantity || !formData.location) {
      alert('Please fill in all required fields')
      return
    }

    const updatedItem = {
      ...item,
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      price: parseFloat(formData.price) || 0
    }

    onEdit(updatedItem)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-itemName">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-itemName"
                placeholder="e.g., A4 Bond Paper"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                id="edit-category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories && categories.length > 0 ? (
                  categories.map(cat => {
                    const categoryName = cat.categoryName || cat.category_name || 'Unknown'
                    return (
                      <option key={cat.id} value={categoryName}>
                        {categoryName}
                      </option>
                    )
                  })
                ) : (
                  CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                )}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Select
                id="edit-supplier"
                value={formData.supplierId || ''}
                onChange={(e) => handleSupplierChange(e.target.value)}
              >
                <option value="">Select Supplier...</option>
                {suppliers && suppliers
                  .filter(s => s.isActive || s.is_active)
                  .map(supplier => {
                    const supplierName = supplier.supplierName || supplier.supplier_name || 'Unknown'
                    return (
                      <option key={supplier.id} value={supplier.id}>
                        {supplierName}
                      </option>
                    )
                  })
                }
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                <Input
                  id="edit-reorderLevel"
                  type="number"
                  min="0"
                  placeholder="e.g., 10"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange('reorderLevel', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">
                Location <span className="text-red-500">*</span>
              </Label>
              {locations && locations.length > 0 ? (
                <Select
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                >
                  <option value="">Select Location...</option>
                  {locations.map(location => {
                    // ✅ FIX: Get the proper location name
                    const locationName = location.locationName || location.location_name || 'Unknown Location'
                    const description = location.description || ''
                    
                    return (
                      <option key={location.id} value={locationName}>
                        {locationName}
                        {description && ` - ${description}`}
                      </option>
                    )
                  })}
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground border rounded-lg p-3 bg-yellow-50">
                  No locations available. Current: {formData.location}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₱)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 250.00"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}