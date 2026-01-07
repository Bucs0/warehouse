
// Dialog for editing existing supplier

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'

export default function EditSupplierDialog({ open, onOpenChange, supplier, onEdit, isReadOnly }) {
  const [formData, setFormData] = useState({
    supplierName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true
  })

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
    }
  }, [supplier])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

    // Update supplier
    const updatedSupplier = {
      ...supplier,
      ...formData
    }

    onEdit(updatedSupplier)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? 'View Supplier' : 'Edit Supplier'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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