// ✅ UPDATED: Added locations prop to function signature and passed it to NewItemQuickAddDialog

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import AddSupplierDialog from './AddSupplierDialog'
import EditSupplierDialog from './EditSupplierDialog'
import NewItemQuickAddDialog from './NewItemQuickAddDialog'

export default function SuppliersPage({ 
  user, 
  suppliers, 
  inventoryData, 
  categories,
  locations = [], // ✅ ADDED: locations prop
  onAddSupplier, 
  onEditSupplier, 
  onDeleteSupplier,
  onAddItem
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  
  // States for handling new items
  const [pendingNewItems, setPendingNewItems] = useState([])
  const [currentNewItemIndex, setCurrentNewItemIndex] = useState(0)
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false)
  const [pendingSupplierData, setPendingSupplierData] = useState(null)
  const [createdItemIds, setCreatedItemIds] = useState([])

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = supplier.isActive === true
    } else if (filterStatus === 'inactive') {
      matchesStatus = supplier.isActive === false
    }

    return matchesSearch && matchesStatus
  })

  const getSupplierItemCount = (supplierId) => {
    return inventoryData.filter(item => item.supplierId === supplierId).length
  }

  const handleDelete = (supplier) => {
    const itemCount = getSupplierItemCount(supplier.id)
    if (itemCount > 0) {
      if (!window.confirm(`This supplier has ${itemCount} item(s) in inventory. Are you sure you want to delete "${supplier.supplierName}"?`)) {
        return
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete supplier "${supplier.supplierName}"?`)) {
        return
      }
    }
    onDeleteSupplier(supplier.id)
  }

  const handleAddSupplierWithItems = (supplierData) => {
    if (supplierData.newItems && supplierData.newItems.length > 0) {
      setPendingSupplierData(supplierData)
      setPendingNewItems(supplierData.newItems)
      setCurrentNewItemIndex(0)
      setCreatedItemIds([])
      setIsNewItemDialogOpen(true)
    } else {
      const finalSupplier = {
        id: Date.now(),
        supplierName: supplierData.supplierName,
        contactPerson: supplierData.contactPerson,
        contactEmail: supplierData.contactEmail,
        contactPhone: supplierData.contactPhone,
        address: supplierData.address,
        isActive: supplierData.isActive,
        suppliedItemIds: supplierData.suppliedItemIds,
        dateAdded: new Date().toLocaleDateString('en-PH')
      }
      onAddSupplier(finalSupplier)
    }
  }

  const handleNewItemComplete = (itemData) => {
    const itemName = pendingNewItems[currentNewItemIndex]
    const newItemId = Date.now() + currentNewItemIndex
    
    const newItem = {
      id: newItemId,
      itemName: itemName,
      ...itemData,
      supplier: pendingSupplierData.supplierName,
      supplierId: null,
      damagedStatus: 'Good',
      dateAdded: new Date().toLocaleDateString('en-PH')
    }
    
    onAddItem(newItem)
    setCreatedItemIds(prev => [...prev, newItemId])
    
    if (currentNewItemIndex < pendingNewItems.length - 1) {
      setCurrentNewItemIndex(currentNewItemIndex + 1)
    } else {
      const supplierId = Date.now()
      
      const finalSupplier = {
        id: supplierId,
        supplierName: pendingSupplierData.supplierName,
        contactPerson: pendingSupplierData.contactPerson,
        contactEmail: pendingSupplierData.contactEmail,
        contactPhone: pendingSupplierData.contactPhone,
        address: pendingSupplierData.address,
        isActive: pendingSupplierData.isActive,
        suppliedItemIds: [...pendingSupplierData.suppliedItemIds, ...createdItemIds, newItemId],
        dateAdded: new Date().toLocaleDateString('en-PH')
      }
      
      onAddSupplier(finalSupplier)
      
      setIsNewItemDialogOpen(false)
      setPendingNewItems([])
      setCurrentNewItemIndex(0)
      setPendingSupplierData(null)
      setCreatedItemIds([])
    }
  }

  const activeSuppliers = suppliers.filter(s => s.isActive).length
  const inactiveSuppliers = suppliers.filter(s => !s.isActive).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supplier Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage supplier information and contacts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <h3 className="text-3xl font-bold mt-2">{suppliers.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Suppliers</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{activeSuppliers}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm font-medium text-muted-foreground">Inactive Suppliers</p>
                <h3 className="text-3xl font-bold text-gray-600 mt-2">{inactiveSuppliers}</h3>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Suppliers List</CardTitle>
            
            {user.role === 'Admin' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Supplier
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by name, contact person, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({suppliers.length})
              </Button>
              <Button 
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active ({activeSuppliers})
              </Button>
              <Button 
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive ({inactiveSuppliers})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterStatus !== 'all'
                        ? 'No suppliers found matching filters'
                        : 'No suppliers yet. Add your first supplier to get started.'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell>
                        <a href={`mailto:${supplier.contactEmail}`} className="text-blue-600 hover:underline">
                          {supplier.contactEmail}
                        </a>
                      </TableCell>
                      <TableCell>{supplier.contactPhone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getSupplierItemCount(supplier.id)} items</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={supplier.isActive ? 'success' : 'secondary'}>
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSupplier(supplier)}
                          >
                            {user.role === 'Admin' ? 'Edit' : 'View'}
                          </Button>
                          
                          {user.role === 'Admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(supplier)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredSuppliers.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </p>
          )}
        </CardContent>
      </Card>

      <AddSupplierDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddSupplierWithItems}
        inventoryData={inventoryData}
        categories={categories}
      />

      {editingSupplier && (
        <EditSupplierDialog
          open={!!editingSupplier}
          onOpenChange={(open) => !open && setEditingSupplier(null)}
          supplier={editingSupplier}
          onEdit={onEditSupplier}
          isReadOnly={user.role !== 'Admin'}
        />
      )}

      {/* ✅ UPDATED: Added locations prop to NewItemQuickAddDialog */}
      {pendingNewItems.length > 0 && (
        <NewItemQuickAddDialog
          open={isNewItemDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsNewItemDialogOpen(false)
              setPendingNewItems([])
              setCurrentNewItemIndex(0)
              setPendingSupplierData(null)
              setCreatedItemIds([])
            }
          }}
          itemName={pendingNewItems[currentNewItemIndex]}
          categories={categories}
          locations={locations} // ✅ ADDED: Pass locations to dialog
          onComplete={handleNewItemComplete}
        />
      )}
    </div>
  )
}