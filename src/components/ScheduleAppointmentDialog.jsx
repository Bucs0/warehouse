
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function ScheduleAppointmentDialog({ 
  open, 
  onOpenChange, 
  suppliers, 
  inventoryData,
  user,
  onSchedule 
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
  
  // ✅ FIX: Separate states for item selection form
  const [selectedItemId, setSelectedItemId] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')

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
      setSelectedItems([])
      // ✅ Reset item selection when supplier changes
      setSelectedItemId('')
      setItemQuantity('')
    }
  }

  const supplierItems = formData.supplierId 
    ? inventoryData.filter(item => item.supplierId === formData.supplierId)
    : []

  // ✅ FIX: Rewritten handleAddItem to use state properly
  const handleAddItem = () => {
    const itemId = parseInt(selectedItemId)
    const quantity = parseInt(itemQuantity)

    if (!itemId || !quantity || quantity <= 0) {
      alert('Please select an item and enter valid quantity')
      return
    }

    if (selectedItems.some(item => item.itemId === itemId)) {
      alert('Item already added to this appointment')
      return
    }

    const item = inventoryData.find(i => i.id === itemId)
    if (item) {
      setSelectedItems(prev => [...prev, {
        itemId: item.id,
        itemName: item.itemName,
        quantity: quantity
      }])
      
      // ✅ Reset form after adding
      setSelectedItemId('')
      setItemQuantity('')
    }
  }

  const handleRemoveItem = (itemId) => {
    setSelectedItems(prev => prev.filter(item => item.itemId !== itemId))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    if (!formData.supplierId || !formData.date || !formData.time) {
      alert('Please fill in supplier, date, and time')
      return
    }

    // ✅ This check should now work correctly
    if (selectedItems.length === 0) {
      alert('Please add at least one item to the appointment')
      return
    }

    const selectedDate = new Date(`${formData.date}T${formData.time}`)
    const now = new Date()
    if (selectedDate < now) {
      if (!window.confirm('The selected date/time is in the past. Continue anyway?')) {
        return
      }
    }

    const newAppointment = {
      id: Date.now(),
      ...formData,
      items: selectedItems,
      scheduledBy: user.name,
      scheduledDate: new Date().toLocaleString('en-PH'),
      lastUpdated: new Date().toLocaleString('en-PH')
    }

    onSchedule(newAppointment)

    // Reset form
    setFormData({
      supplierId: '',
      supplierName: '',
      date: '',
      time: '',
      status: 'pending',
      notes: ''
    })
    setSelectedItems([])
    setSelectedItemId('')
    setItemQuantity('')
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
          <DialogTitle>Schedule Restock Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">
                Supplier <span className="text-red-500">*</span>
              </Label>
              <Select
                id="supplier"
                value={formData.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                required
              >
                <option value="">Select Supplier...</option>
                {suppliers
                  .filter(s => s.isActive)
                  .map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName} - {supplier.contactPerson}
                    </option>
                  ))
                }
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={getTodayDate()}
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="pending">Pending - Awaiting confirmation</option>
                <option value="confirmed">Confirmed - Supplier confirmed</option>
              </Select>
            </div>

            {/* ✅ FIXED: Item selection section with proper state management */}
            {formData.supplierId && (
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold">Items to Restock</h4>
                
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">
                    <Select 
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                    >
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
                      min="1"
                      placeholder="Qty"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
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

                {supplierItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No items from this supplier in inventory.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>

            {selectedItems.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium">Appointment Summary:</p>
                <p className="mt-1">Supplier: <strong>{formData.supplierName}</strong></p>
                <p>Date: <strong>{formData.date} at {formData.time}</strong></p>
                <p>Items: <strong>{selectedItems.length} item(s)</strong></p>
                <p>Total Units: <strong>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</strong></p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Schedule Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}