
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

export default function AddCategoryDialog({ open, onOpenChange, onAdd, existingCategories }) {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.categoryName) {
      alert('Please enter category name')
      return
    }

    const duplicate = existingCategories.find(
      cat => cat.categoryName.toLowerCase() === formData.categoryName.toLowerCase()
    )
    if (duplicate) {
      alert(`Category "${formData.categoryName}" already exists!`)
      return
    }

    const newCategory = {
      id: Date.now(),
      ...formData,
      dateAdded: new Date().toLocaleDateString('en-PH')
    }

    onAdd(newCategory)

    setFormData({
      categoryName: '',
      description: ''
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="categoryName"
                placeholder="e.g., Office Supplies"
                value={formData.categoryName}
                onChange={(e) => handleChange('categoryName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Paper, pens, and general office items"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}