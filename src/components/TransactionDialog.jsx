import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function TransactionDialog({ open, onOpenChange, item, user, onTransaction }) {
  const [formData, setFormData] = useState({
    transactionType: 'IN',
    quantity: '',
    reason: ''
  })

  const itemName = item?.itemName || item?.item_name || ''
  const category = item?.category || item?.categoryName || item?.category_name || ''
  const location = item?.location || item?.locationName || item?.location_name || ''
  const quantity = item?.quantity || 0
  const reorderLevel = item?.reorderLevel || item?.reorder_level || 0

  const reasonsIN = [
    'Restock from supplier',
    'Return from customer',
    'Transfer from other warehouse',
    'Inventory adjustment',
    'Other'
  ]

  const reasonsOUT = [
    'Sold to customer',
    'Used in operations',
    'Transfer to other warehouse',
    'Damaged/Discarded',
    'Other'
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateStockAfter = () => {
    const qty = parseInt(formData.quantity) || 0
    if (formData.transactionType === 'IN') {
      return quantity + qty
    } else {
      return quantity - qty
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const qty = parseInt(formData.quantity)
    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    if (formData.transactionType === 'OUT' && qty > quantity) {
      alert(`Cannot remove ${qty} items. Only ${quantity} available in stock.`)
      return
    }

    if (!formData.reason) {
      alert('Please provide a reason for this transaction')
      return
    }

    const transaction = {
      id: Date.now(),
      itemId: item.id,
      itemName: itemName,
      transactionType: formData.transactionType,
      quantity: qty,
      reason: formData.reason,
      userName: user.name,
      userRole: user.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      stockBefore: quantity,
      stockAfter: calculateStockAfter()
    }

    onTransaction(transaction)

    setFormData({
      transactionType: 'IN',
      quantity: '',
      reason: ''
    })
    onOpenChange(false)
  }

  const stockAfter = calculateStockAfter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Stock Transaction</DialogTitle>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{itemName}</h4>
            <Badge>{category}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Current Stock:</span>
              <span className="font-semibold ml-2">{quantity}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Location:</span>
              <span className="font-semibold ml-2">{location}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionType">
                Transaction Type <span className="text-red-500">*</span>
              </Label>
              <Select
                id="transactionType"
                value={formData.transactionType}
                onChange={(e) => handleChange('transactionType', e.target.value)}
              >
                <option value="IN">IN - Add to Stock (Restock)</option>
                <option value="OUT">OUT - Remove from Stock (Usage/Sales)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={formData.transactionType === 'OUT' ? quantity : undefined}
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
              />
              {formData.transactionType === 'OUT' && (
                <p className="text-xs text-muted-foreground">
                  Maximum: {quantity} (current stock)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                required
              >
                <option value="">Select reason...</option>
                {(formData.transactionType === 'IN' ? reasonsIN : reasonsOUT).map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </Select>
            </div>

            {formData.quantity && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Transaction Preview:</p>
                <div className="flex items-center gap-2 text-sm">
                  <span>Current: <strong>{quantity}</strong></span>
                  <span className={formData.transactionType === 'IN' ? 'text-green-600' : 'text-red-600'}>
                    {formData.transactionType === 'IN' ? '+' : '-'}{formData.quantity}
                  </span>
                  <span>→</span>
                  <span>After: <strong className={stockAfter <= reorderLevel ? 'text-orange-600' : ''}>{stockAfter}</strong></span>
                </div>
                {stockAfter <= reorderLevel && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Warning: Stock will be at or below reorder level
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Record Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}