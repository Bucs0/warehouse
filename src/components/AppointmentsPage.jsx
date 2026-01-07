// ✅ UPDATED: Added data normalization for email service compatibility

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import ScheduleAppointmentDialog from './ScheduleAppointmentDialog'
import EditAppointmentDialog from './EditAppointmentDialog'
import ViewAppointmentDialog from './ViewAppointmentDialog'
import { normalizeSuppliers, normalizeAppointments } from '../lib/dataMapper'

// Import email functions
import { sendAppointmentEmail, sendAppointmentCancelEmail } from '../lib/emailService'

export default function AppointmentsPage({ 
  user, 
  appointments, 
  suppliers, 
  inventoryData,
  onScheduleAppointment, 
  onEditAppointment, 
  onCancelAppointment,
  onCompleteAppointment 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [viewingAppointment, setViewingAppointment] = useState(null)

  // ✅ Normalize data
  const normalizedSuppliers = useMemo(() => 
    normalizeSuppliers(suppliers), 
    [suppliers]
  )

  const normalizedAppointments = useMemo(() => 
    normalizeAppointments(appointments), 
    [appointments]
  )

  // Filter appointments
  const filteredAppointments = normalizedAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.items.some(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus

    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(a.date) - new Date(b.date))

  // Calculate statistics
  const pendingCount = normalizedAppointments.filter(a => a.status === 'pending').length
  const confirmedCount = normalizedAppointments.filter(a => a.status === 'confirmed').length
  const completedCount = normalizedAppointments.filter(a => a.status === 'completed').length
  const cancelledCount = normalizedAppointments.filter(a => a.status === 'cancelled').length

  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  
  const upcomingAppointments = normalizedAppointments.filter(a => {
    const appointmentDate = new Date(a.date)
    return appointmentDate >= today && appointmentDate <= nextWeek && a.status !== 'completed' && a.status !== 'cancelled'
  }).length

  // ✅ Schedule handler with email notification and normalized supplier data
  const handleScheduleWithEmail = async (appointment) => {
    onScheduleAppointment(appointment)

    // Find and normalize supplier
    const supplier = normalizedSuppliers.find(s => s.id === appointment.supplierId)
    
    if (supplier && supplier.contactEmail) {
      console.log('📧 Sending appointment confirmation email to:', supplier.contactEmail)
      
      const emailResult = await sendAppointmentEmail(appointment, supplier)
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully to supplier')
        alert(`✅ Appointment scheduled and confirmation email sent to ${supplier.supplierName}!`)
      } else {
        console.error('❌ Failed to send email:', emailResult.error)
        alert(`✅ Appointment scheduled successfully, but email notification failed to send. Please contact the supplier manually.`)
      }
    } else {
      console.warn('⚠️ No email address found for supplier')
      alert(`✅ Appointment scheduled! Note: Supplier has no email address on file for automatic notification.`)
    }
  }

  // ✅ Edit handler with email notification and normalized supplier data
  const handleEditWithEmail = async (updatedAppointment) => {
    onEditAppointment(updatedAppointment)

    const originalAppointment = normalizedAppointments.find(a => a.id === updatedAppointment.id)
    const statusChanged = originalAppointment.status !== updatedAppointment.status
    const isNowConfirmed = updatedAppointment.status === 'confirmed'

    if (statusChanged && isNowConfirmed) {
      const supplier = normalizedSuppliers.find(s => s.id === updatedAppointment.supplierId)
      
      if (supplier && supplier.contactEmail) {
        console.log('📧 Sending confirmation email for updated appointment to:', supplier.contactEmail)
        
        const emailResult = await sendAppointmentEmail(updatedAppointment, supplier)
        
        if (emailResult.success) {
          console.log('✅ Confirmation email sent successfully')
          alert(`✅ Appointment updated and confirmation email sent to ${supplier.supplierName}!`)
        } else {
          console.error('❌ Failed to send confirmation email:', emailResult.error)
          alert(`✅ Appointment updated, but confirmation email failed to send.`)
        }
      }
    }
  }

  const handleComplete = (appointment) => {
    if (window.confirm(`Mark appointment with ${appointment.supplierName} as completed?`)) {
      onCompleteAppointment(appointment.id)
    }
  }

  // ✅ Cancel handler with normalized supplier data
  const handleCancel = async (appointment) => {
    const cancelReason = prompt(
      `Please provide a reason for cancelling the appointment with ${appointment.supplierName}:`,
      'Schedule conflict'
    )
    
    if (cancelReason === null) {
      return
    }

    if (!window.confirm(`Cancel appointment with ${appointment.supplierName}? This action cannot be undone.`)) {
      return
    }

    onCancelAppointment(appointment.id)

    // Find and normalize supplier
    const supplier = normalizedSuppliers.find(s => s.id === appointment.supplierId)
    
    if (supplier && supplier.contactEmail) {
      console.log('📧 Sending cancellation email to:', supplier.contactEmail)
      
      const emailResult = await sendAppointmentCancelEmail(
        appointment, 
        supplier, 
        cancelReason
      )
      
      if (emailResult.success) {
        console.log('✅ Cancellation email sent successfully')
        alert(`✅ Appointment cancelled and notification email sent to ${supplier.supplierName}`)
      } else {
        console.error('❌ Failed to send cancellation email:', emailResult.error)
        alert(`✅ Appointment cancelled, but notification email failed to send. Please contact ${supplier.supplierName} manually.`)
      }
    } else {
      console.warn('⚠️ No email address found for supplier')
      alert(`✅ Appointment cancelled. Note: Supplier has no email address on file, please contact them manually.`)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const isOverdue = (appointment) => {
    const appointmentDate = new Date(appointment.date)
    return appointmentDate < today && appointment.status !== 'completed' && appointment.status !== 'cancelled'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Scheduling</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage restock appointments with suppliers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{upcomingAppointments}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">{confirmedCount}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{completedCount}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <h3 className="text-3xl font-bold text-gray-600 mt-2">{cancelledCount}</h3>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List/Calendar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>
              {viewMode === 'list' ? 'Appointments List' : 'Calendar View'}
            </CardTitle>
            
            {user.role === 'Admin' && (
              <Button onClick={() => setIsScheduleDialogOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Schedule Appointment
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by supplier, items, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({normalizedAppointments.length})
              </Button>
              <Button 
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({pendingCount})
              </Button>
              <Button 
                variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('confirmed')}
              >
                Confirmed ({confirmedCount})
              </Button>
              <Button 
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                Completed ({completedCount})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === 'list' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm || filterStatus !== 'all'
                          ? 'No appointments found matching filters'
                          : 'No appointments scheduled yet'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow 
                        key={appointment.id}
                        className={isOverdue(appointment) ? 'bg-red-50' : ''}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(appointment.date)}</span>
                            <span className="text-sm text-muted-foreground">{appointment.time}</span>
                            {isOverdue(appointment) && (
                              <Badge variant="destructive" className="mt-1 w-fit">Overdue</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{appointment.supplierName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {appointment.items.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="text-sm">
                                {item.itemName} ({item.quantity})
                              </span>
                            ))}
                            {appointment.items.length > 2 && (
                              <span className="text-sm text-muted-foreground">
                                +{appointment.items.length - 2} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            appointment.status === 'pending' ? 'warning' :
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'completed' ? 'success' :
                            'secondary'
                          }>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{appointment.scheduledBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingAppointment(appointment)}
                            >
                              View
                            </Button>
                            
                            {user.role === 'Admin' && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingAppointment(appointment)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleComplete(appointment)}
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancel(appointment)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppointments.map((appointment) => (
                <Card 
                  key={appointment.id}
                  className={`hover:shadow-md transition-shadow ${isOverdue(appointment) ? 'border-red-300' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{appointment.supplierName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(appointment.date)} at {appointment.time}
                        </p>
                      </div>
                      <Badge variant={
                        appointment.status === 'pending' ? 'warning' :
                        appointment.status === 'confirmed' ? 'default' :
                        appointment.status === 'completed' ? 'success' :
                        'secondary'
                      }>
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Items to restock:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {appointment.items.map((item, idx) => (
                          <li key={idx}>• {item.itemName} ({item.quantity})</li>
                        ))}
                      </ul>
                    </div>

                    {isOverdue(appointment) && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        ⚠️ This appointment is overdue
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setViewingAppointment(appointment)}
                      >
                        View Details
                      </Button>
                      {user.role === 'Admin' && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleComplete(appointment)}
                        >
                          ✓ Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredAppointments.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredAppointments.length} of {normalizedAppointments.length} appointments
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ScheduleAppointmentDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        suppliers={normalizedSuppliers}
        inventoryData={inventoryData}
        user={user}
        onSchedule={handleScheduleWithEmail}
      />

      {editingAppointment && (
        <EditAppointmentDialog
          open={!!editingAppointment}
          onOpenChange={(open) => !open && setEditingAppointment(null)}
          appointment={editingAppointment}
          suppliers={normalizedSuppliers}
          inventoryData={inventoryData}
          onEdit={handleEditWithEmail}
        />
      )}

      {viewingAppointment && (
        <ViewAppointmentDialog
          open={!!viewingAppointment}
          onOpenChange={(open) => !open && setViewingAppointment(null)}
          appointment={viewingAppointment}
        />
      )}
    </div>
  )
}