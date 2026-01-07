
// Dialog for editing existing category

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

export default function EditCategoryDialog({ open, onOpenChange, category, onEdit, isReadOnly, existingCategories }) {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: ''
  })

  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.categoryName || '',
        description: category.description || ''
      })
    }
  }, [category])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isReadOnly) {
      onOpenChange(false)
      return
    }

    // Validate
    if (!formData.categoryName) {
      alert('Please enter category name')
      return
    }

    // Check for duplicate (excluding current category)
    const duplicate = existingCategories.find(
      cat => cat.id !== category.id && 
      cat.categoryName.toLowerCase() === formData.categoryName.toLowerCase()
    )
    if (duplicate) {
      alert(`Category "${formData.categoryName}" already exists!`)
      return
    }

    // Update category
    const updatedCategory = {
      ...category,
      ...formData
    }

    onEdit(updatedCategory)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? 'View Category' : 'Edit Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-categoryName">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-categoryName"
                placeholder="e.g., Office Supplies"
                value={formData.categoryName}
                onChange={(e) => handleChange('categoryName', e.target.value)}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="e.g., Paper, pens, and general office items"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && <Button type="submit">Save Changes</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}