import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Label } from './ui/label'
import { normalizeDamagedItems } from '../lib/dataMapper'

export default function DamagedItemsPage({ user, damagedItems, onUpdateDamagedItem, onRemoveDamagedItem }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

  const normalizedItems = useMemo(() => 
    normalizeDamagedItems(damagedItems), 
    [damagedItems]
  )

  const filteredItems = normalizedItems.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === 'standby') {
      matchesStatus = item.status === 'Standby'
    } else if (filterStatus === 'thrown') {
      matchesStatus = item.status === 'Thrown'
    }

    return matchesSearch && matchesStatus
  })

  const standbyCount = normalizedItems.filter(i => i.status === 'Standby').length
  const thrownCount = normalizedItems.filter(i => i.status === 'Thrown').length
  const totalValue = normalizedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Damaged Items</h1>
        <p className="text-muted-foreground mt-1">
          Manage damaged inventory items - mark as standby or thrown
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Damaged</p>
                <h3 className="text-2xl sm:text-3xl font-bold mt-2">{normalizedItems.length}</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">In Standby</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">{standbyCount}</h3>
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
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Thrown</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-600 mt-2">{thrownCount}</h3>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value Lost</p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 mt-2">
                  ₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Damaged Items List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl">Damaged Items List</CardTitle>
          </div>

          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="search"
                placeholder="Search by item name, location, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({normalizedItems.length})
              </Button>
              <Button 
                variant={filterStatus === 'standby' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('standby')}
              >
                Standby ({standbyCount})
              </Button>
              <Button 
                variant={filterStatus === 'thrown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('thrown')}
              >
                Thrown ({thrownCount})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Damaged</TableHead>
                  <TableHead>Value Lost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterStatus !== 'all'
                        ? 'No damaged items found matching filters'
                        : 'No damaged items recorded'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-sm">{item.reason}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'Standby' ? 'warning' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.dateDamaged}</TableCell>
                      <TableCell>
                        ₱{(item.quantity * item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.role === 'Admin' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setIsUpdateDialogOpen(true)
                                }}
                              >
                                Update Status
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (window.confirm(`Remove "${item.itemName}" from damaged items?`)) {
                                    onRemoveDamagedItem(item.id)
                                  }
                                }}
                              >
                                Remove
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || filterStatus !== 'all'
                  ? 'No damaged items found matching filters'
                  : 'No damaged items recorded'
                }
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="p-4 border-red-200 bg-red-50">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.itemName}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{item.dateDamaged}</p>
                      </div>
                      <Badge variant={item.status === 'Standby' ? 'warning' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    
                    {/* Quantity and Value */}
                    <div className="flex items-center justify-between py-2 border-y border-red-300">
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <p className="text-2xl font-bold text-red-600">{item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Value Lost</p>
                        <p className="text-xl font-bold text-red-600">
                          ₱{(item.quantity * item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{item.location}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reason</p>
                        <p className="font-medium">{item.reason}</p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {user.role === 'Admin' && (
                      <div className="flex gap-2 pt-2 border-t border-red-300">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsUpdateDialogOpen(true)
                          }}
                          className="flex-1"
                        >
                          Update Status
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm(`Remove "${item.itemName}" from damaged items?`)) {
                              onRemoveDamagedItem(item.id)
                            }
                          }}
                          className="flex-1"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {filteredItems.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredItems.length} of {normalizedItems.length} damaged items
            </p>
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      {selectedItem && (
        <UpdateStatusDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          item={selectedItem}
          onUpdate={onUpdateDamagedItem}
        />
      )}
    </div>
  )
}

// Update Status Dialog Component
function UpdateStatusDialog({ open, onOpenChange, item, onUpdate }) {
  const [status, setStatus] = useState(item.status)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const updatedItem = {
      ...item,
      status,
      notes,
      lastUpdated: new Date().toLocaleString('en-PH')
    }
    
    onUpdate(updatedItem)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Damaged Item Status</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Item Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold">{item.itemName}</h4>
              <p className="text-sm text-muted-foreground">Quantity: {item.quantity} | Location: {item.location}</p>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Standby">Standby - Keep for now</option>
                <option value="Thrown">Thrown - Disposed/Discarded</option>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}