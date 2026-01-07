// ✅ FIXED LocationManagementDialog.jsx - Proper error handling

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'

export default function LocationManagementDialog({ 
  open, 
  onOpenChange, 
  locations = [], 
  onAddLocation, 
  onEditLocation, 
  onDeleteLocation,
  inventoryData = []
}) {
  const [isAddMode, setIsAddMode] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [formData, setFormData] = useState({
    locationName: '',
    description: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setIsAddMode(false)
      setEditingLocation(null)
      setFormData({ locationName: '', description: '' })
    }
  }, [open])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAdd = async () => {
    const trimmedName = formData.locationName.trim()
    
    if (!trimmedName) {
      alert('Please enter a location name')
      return
    }

    // Check for duplicate
    const duplicate = locations.find(loc => {
      const locName = loc.locationName || loc.location_name || ''
      return locName.toLowerCase() === trimmedName.toLowerCase()
    })
    
    if (duplicate) {
      alert(`Location "${trimmedName}" already exists!`)
      return
    }

    setIsSubmitting(true)

    try {
      // ✅ FIX: Send proper data format - backend handles date automatically
      const locationData = {
        locationName: trimmedName,
        description: formData.description.trim()
      }

      console.log('📤 Sending location data:', locationData)
      
      await onAddLocation(locationData)

      // Reset form
      setFormData({ locationName: '', description: '' })
      setIsAddMode(false)
      
      console.log('✅ Location added successfully')
    } catch (error) {
      console.error('❌ Failed to add location:', error)
      alert(`Failed to add location: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    const trimmedName = formData.locationName.trim()
    
    if (!trimmedName) {
      alert('Please enter a location name')
      return
    }

    // Check for duplicate
    const duplicate = locations.find(loc => {
      if (loc.id === editingLocation.id) return false
      const locName = loc.locationName || loc.location_name || ''
      return locName.toLowerCase() === trimmedName.toLowerCase()
    })
    
    if (duplicate) {
      alert(`Location "${trimmedName}" already exists!`)
      return
    }

    setIsSubmitting(true)

    try {
      await onEditLocation({
        ...editingLocation,
        locationName: trimmedName,
        description: formData.description.trim()
      })

      setFormData({ locationName: '', description: '' })
      setEditingLocation(null)
    } catch (error) {
      console.error('❌ Failed to edit location:', error)
      alert(`Failed to edit location: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (location) => {
    setEditingLocation(location)
    setFormData({
      locationName: location.locationName || location.location_name || '',
      description: location.description || ''
    })
    setIsAddMode(false)
  }

  const handleDelete = (location) => {
    const locationName = location.locationName || location.location_name || ''
    const itemCount = getLocationItemCount(locationName)
    
    if (itemCount > 0) {
      alert(`Cannot delete location "${locationName}" because it has ${itemCount} item(s). Please move or remove items first.`)
      return
    }
    
    if (window.confirm(`Are you sure you want to delete location "${locationName}"?`)) {
      onDeleteLocation(location.id)
    }
  }

  const getLocationItemCount = (locationName) => {
    if (!locationName) return 0
    
    return inventoryData.filter(item => {
      const itemLocation = item.location || item.location_name || ''
      return itemLocation.toLowerCase() === locationName.toLowerCase()
    }).length
  }

  const filteredLocations = locations.filter(location => {
    if (!location) return false
    
    const locationName = location.locationName || location.location_name || ''
    const description = location.description || ''
    const search = searchTerm.toLowerCase()
    
    return locationName.toLowerCase().includes(search) ||
           description.toLowerCase().includes(search)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Warehouse Location Management</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Manage warehouse locations for inventory organization
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {(isAddMode || editingLocation) && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold mb-4">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="locationName">
                    Location Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="locationName"
                    placeholder="e.g., Warehouse A, Shelf 1"
                    value={formData.locationName}
                    onChange={(e) => handleChange('locationName', e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Main storage area, first floor"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={editingLocation ? handleEdit : handleAdd}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      editingLocation ? 'Save Changes' : 'Add Location'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddMode(false)
                      setEditingLocation(null)
                      setFormData({ locationName: '', description: '' })
                    }}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add Button */}
          {!isAddMode && !editingLocation && (
            <Button 
              onClick={() => setIsAddMode(true)}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Location
            </Button>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Total Locations</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{locations.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">In Use</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {locations.filter(loc => {
                  const locName = loc.locationName || loc.location_name || ''
                  return getLocationItemCount(locName) > 0
                }).length}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Empty</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {locations.filter(loc => {
                  const locName = loc.locationName || loc.location_name || ''
                  return getLocationItemCount(locName) === 0
                }).length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search Locations</Label>
            <Input
              type="search"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Locations Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm
                        ? 'No locations found matching search'
                        : 'No locations yet. Add your first location to get started.'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations.map((location) => {
                    const locationName = location.locationName || location.location_name || 'Unknown'
                    const itemCount = getLocationItemCount(locationName)
                    const dateAdded = location.dateAdded || location.date_added || 'N/A'
                    
                    return (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{locationName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {location.description || 'No description'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={itemCount > 0 ? 'default' : 'outline'}>
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {dateAdded}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(location)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(location)}
                              disabled={itemCount > 0}
                              title={itemCount > 0 ? 'Cannot delete location with items' : 'Delete location'}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredLocations.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredLocations.length} of {locations.length} locations
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}