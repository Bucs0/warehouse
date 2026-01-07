
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'

export default function AddItemDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  suppliers = [],
  categories = [],
  locations = [] 
}) {
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Office Supplies',
    quantity: '',
    location: '',
    reorderLevel: '10',
    price: '',
    supplierId: '',
    supplier: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSupplierChange = (supplierId) => {
    const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId))
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplierId: selectedSupplier.id,
        supplier: selectedSupplier.supplierName
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        supplierId: '',
        supplier: ''
      }))
    }
  }

  const handleSubmit = () => {
    if (!formData.itemName || !formData.quantity || !formData.location) {
      alert('Please fill in all required fields (Item Name, Quantity, Location)')
      return
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      price: parseFloat(formData.price) || 0,
      damagedStatus: 'Good',
      dateAdded: new Date().toLocaleDateString('en-PH')
    }

    onAdd(newItem)

    setFormData({
      itemName: '',
      category: 'Office Supplies',
      quantity: '',
      location: '',
      reorderLevel: '10',
      price: '',
      supplierId: '',
      supplier: ''
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">
              Item Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="itemName"
              placeholder="e.g., A4 Bond Paper"
              value={formData.itemName}
              onChange={(e) => handleChange('itemName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {categories && categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat.id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))
              ) : (
                <>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Other">Other</option>
                </>
              )}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select
              id="supplier"
              value={formData.supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
            >
              <option value="">Select Supplier (Optional)...</option>
              {suppliers
                .filter(s => s.isActive)
                .map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplierName}
                  </option>
                ))
              }
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="e.g., 100"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                min="0"
                placeholder="e.g., 10"
                value={formData.reorderLevel}
                onChange={(e) => handleChange('reorderLevel', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            {locations && locations.length > 0 ? (
              <Select
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              >
                <option value="">Select Location...</option>
                {locations.map(location => (
                  <option key={location.id} value={location.locationName}>
                    {location.locationName}
                    {location.description && ` - ${location.description}`}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground border rounded-lg p-3 bg-yellow-50">
                No locations available. Please add locations first in Manage Locations.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₱)</Label>
            <Input
              id="price"
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
          <Button onClick={handleSubmit}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}