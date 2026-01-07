
// Dialog for viewing appointment details (read-only)

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function ViewAppointmentDialog({ open, onOpenChange, appointment }) {
  if (!appointment) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PH', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const isOverdue = () => {
    const appointmentDate = new Date(appointment.date)
    const today = new Date()
    return appointmentDate < today && appointment.status !== 'completed' && appointment.status !== 'cancelled'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Date */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{appointment.supplierName}</h3>
              <p className="text-muted-foreground mt-1">
                {formatDate(appointment.date)} at {appointment.time}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge variant={
                appointment.status === 'pending' ? 'warning' :
                appointment.status === 'confirmed' ? 'default' :
                appointment.status === 'completed' ? 'success' :
                'secondary'
              } className="text-sm">
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
              {isOverdue() && (
                <Badge variant="destructive">Overdue</Badge>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h4 className="font-semibold mb-3">Items to Restock:</h4>
            <div className="space-y-2">
              {appointment.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <span className="font-medium">{item.itemName}</span>
                  <Badge variant="outline">{item.quantity} units</Badge>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total: {appointment.items.reduce((sum, item) => sum + item.quantity, 0)} units across {appointment.items.length} item(s)
            </p>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div>
              <h4 className="font-semibold mb-2">Notes:</h4>
              <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg border">
                {appointment.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
            <p>Scheduled by: <strong>{appointment.scheduledBy}</strong></p>
            <p>Scheduled on: {appointment.scheduledDate}</p>
            {appointment.lastUpdated && appointment.lastUpdated !== appointment.scheduledDate && (
              <p>Last updated: {appointment.lastUpdated}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}