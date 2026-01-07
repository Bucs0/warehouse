// Quick dialog for adding item info when creating supplier with new items
// ✅ UPDATED: Removed quantity field - automatically set to 0 when adding new items

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { normalizeCategories, normalizeLocations } from '../lib/dataMapper'

export default function NewItemQuickAddDialog({ 
  open, 
  onOpenChange, 
  itemName, 
  categories,
  locations = [],
  onComplete 
}) {
  // ✅ Normalize categories and locations to handle snake_case from database
  const normalizedCategories = useMemo(() => 
    normalizeCategories(categories || []),
    [categories]
  )
  
  const normalizedLocations = useMemo(() => 
    normalizeLocations(locations || []),
    [locations]
  )

  console.log('📝 NewItemQuickAddDialog - Data:', {
    categories: { raw: categories?.slice(0, 2), normalized: normalizedCategories?.slice(0, 2) },
    locations: { raw: locations?.slice(0, 2), normalized: normalizedLocations?.slice(0, 2) }
  })

  const [formData, setFormData] = useState({
    category: normalizedCategories.length > 0 ? normalizedCategories[0].categoryName : 'Office Supplies',
    location: '',
    reorderLevel: '10',
    price: ''
  })

  // Reset form when itemName changes
  useEffect(() => {
    if (itemName) {
      setFormData({
        category: normalizedCategories.length > 0 ? normalizedCategories[0].categoryName : 'Office Supplies',
        location: '',
        reorderLevel: '10',
        price: ''
      })
    }
  }, [itemName, normalizedCategories])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    // ✅ UPDATED: Only check for location now
    if (!formData.location) {
      alert('Please select a location')
      return
    }

    const itemData = {
      ...formData,
      quantity: 0, // ✅ ADDED: Automatically set quantity to 0
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      price: parseFloat(formData.price) || 0
    }

    onComplete(itemData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item Details</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Complete the information for: <Badge variant="outline">{itemName}</Badge>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="quick-category">Category</Label>
            <Select
              id="quick-category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {normalizedCategories && normalizedCategories.length > 0 ? (
                normalizedCategories.map(cat => (
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

          {/* ✅ REMOVED: Quantity and Reorder Level grid - Only showing Reorder Level now */}
          <div className="space-y-2">
            <Label htmlFor="quick-reorderLevel">Reorder Level</Label>
            <Input
              id="quick-reorderLevel"
              type="number"
              min="0"
              placeholder="e.g., 10"
              value={formData.reorderLevel}
              onChange={(e) => handleChange('reorderLevel', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Initial quantity will be set to 0. Use Stock Transactions to add inventory.
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="quick-location">
              Location <span className="text-red-500">*</span>
            </Label>
            {normalizedLocations && normalizedLocations.length > 0 ? (
              <Select
                id="quick-location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              >
                <option value="">Select Location...</option>
                {normalizedLocations.map(location => (
                  <option key={location.id} value={location.locationName}>
                    {location.locationName}
                    {location.description && ` - ${location.description}`}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground border rounded-lg p-3 bg-yellow-50">
                ⚠️ No locations available. Please add locations first in Manage Locations.
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="quick-price">Price (₱)</Label>
            <Input
              id="quick-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 250.00"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>

          {/* ✅ ADDED: Info message about quantity */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Initial Quantity</p>
                <p className="mt-1">This item will be created with 0 quantity. Add stock later using the Stock Transactions feature.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.location}
          >
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}