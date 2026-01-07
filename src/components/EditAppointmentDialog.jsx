
// Dialog for editing existing appointment

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function EditAppointmentDialog({ 
  open, 
  onOpenChange, 
  appointment,
  suppliers,
  inventoryData,
  onEdit 
}) {
  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    date: '',
    time: '',
    status: 'pending',
    notes: ''
  })

  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    if (appointment) {
      setFormData({
        supplierId: appointment.supplierId || '',
        supplierName: appointment.supplierName || '',
        date: appointment.date || '',
        time: appointment.time || '',
        status: appointment.status || 'pending',
        notes: appointment.notes || ''
      })
      setSelectedItems(appointment.items || [])
    }
  }, [appointment])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find(s => s.id === parseInt(supplierId))
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        supplierId: supplier.id,
        supplierName: supplier.supplierName
      }))
    }
  }

  const supplierItems = formData.supplierId 
    ? inventoryData.filter(item => item.supplierId === formData.supplierId)
    : []

  const handleAddItem = (e) => {
    e.preventDefault()
    const itemId = parseInt(e.target.itemSelect.value)
    const quantity = parseInt(e.target.itemQuantity.value)

    if (!itemId || !quantity || quantity <= 0) {
      alert('Please select an item and enter valid quantity')
      return
    }

    if (selectedItems.some(item => item.itemId === itemId)) {
      alert('Item already added')
      return
    }

    const item = inventoryData.find(i => i.id === itemId)
    if (item) {
      setSelectedItems(prev => [...prev, {
        itemId: item.id,
        itemName: item.itemName,
        quantity: quantity
      }])
      
      e.target.itemSelect.value = ''
      e.target.itemQuantity.value = ''
    }
  }

  const handleRemoveItem = (itemId) => {
    setSelectedItems(prev => prev.filter(item => item.itemId !== itemId))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.supplierId || !formData.date || !formData.time) {
      alert('Please fill in all required fields')
      return
    }

    if (selectedItems.length === 0) {
      alert('Please add at least one item')
      return
    }

    const updatedAppointment = {
      ...appointment,
      ...formData,
      items: selectedItems,
      lastUpdated: new Date().toLocaleString('en-PH')
    }

    onEdit(updatedAppointment)
    onOpenChange(false)
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-supplier">
                Supplier <span className="text-red-500">*</span>
              </Label>
              <Select
                id="edit-supplier"
                value={formData.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                required
              >
                <option value="">Select Supplier...</option>
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
                <Label htmlFor="edit-date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  min={getTodayDate()}
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                id="edit-status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </Select>
            </div>

            {formData.supplierId && (
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold">Items to Restock</h4>
                
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">
                    <Select name="itemSelect">
                      <option value="">Select item...</option>
                      {supplierItems
                        .filter(item => !selectedItems.some(si => si.itemId === item.id))
                        .map(item => (
                          <option key={item.id} value={item.id}>
                            {item.itemName} (Current: {item.quantity})
                          </option>
                        ))
                      }
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      name="itemQuantity"
                      min="1"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={handleAddItem}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium">Selected Items:</p>
                    {selectedItems.map((item) => (
                      <div key={item.itemId} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">
                          {item.itemName} <Badge variant="outline">{item.quantity} units</Badge>
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveItem(item.itemId)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
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