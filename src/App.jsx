import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import InventoryTable from './components/InventoryTable'
import StockTransactions from './components/StockTransactions'
import SuppliersPage from './components/SuppliersPage'
import CategoriesPage from './components/CategoriesPage'
import AppointmentsPage from './components/AppointmentsPage'
import DamagedItemsPage from './components/DamagedItemsPage'
import ActivityLogs from './components/ActivityLogs'

import {
  inventoryAPI,
  categoriesAPI,
  locationsAPI,
  suppliersAPI,
  transactionsAPI,
  appointmentsAPI,
  damagedItemsAPI,
  activityLogsAPI,
  lowStockAlertsAPI
} from './lib/api'

import { sendLowStockAlert } from './lib/emailService'

const ADMIN_EMAIL = 'markjadebucao10@gmail.com'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [inventoryData, setInventoryData] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [transactionHistory, setTransactionHistory] = useState([])
  const [appointments, setAppointments] = useState([])
  const [damagedItems, setDamagedItems] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('App State:', {
        user: currentUser?.name,
        page: currentPage,
        dataLoaded: !isLoading
      })
    }
  }, [currentUser, currentPage, isLoading])

  useEffect(() => {
    if (currentUser) {
      loadAllData()
    }
  }, [currentUser])

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [
        inventory,
        cats,
        locs,
        sups,
        trans,
        apts,
        damaged,
        logs
      ] = await Promise.all([
        inventoryAPI.getAll(),
        categoriesAPI.getAll(),
        locationsAPI.getAll(),
        suppliersAPI.getAll(),
        transactionsAPI.getAll(),
        appointmentsAPI.getAll(),
        damagedItemsAPI.getAll(),
        activityLogsAPI.getAll()
      ])
      
      setInventoryData(inventory)
      setCategories(cats)
      setLocations(locs)
      setSuppliers(sups)
      setTransactionHistory(trans)
      setAppointments(apts)
      setDamagedItems(damaged)
      setActivityLogs(logs)
    } catch (err) {
      console.error('❌ Error loading data:', err)
      setError('Failed to load data. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!currentUser) return

    const checkLowStock = async () => {
      try {
        const pendingAlerts = await lowStockAlertsAPI.getPendingAlerts()
        
        console.log('📦 Pending low stock alerts:', pendingAlerts)
        
        for (const item of pendingAlerts) {
          const normalizedItem = {
            itemName: item.item_name || item.itemName || 'Unknown Item',
            quantity: item.quantity || 0,
            reorderLevel: item.reorder_level || item.reorderLevel || 0,
            location: item.location || item.location_name || 'Unknown Location',
            category: item.category || item.category_name || 'Uncategorized',
            supplier: item.supplier || item.supplier_name || 'No supplier assigned'
          }
          
          console.log('📧 Sending email for:', normalizedItem)
          
          const result = await sendLowStockAlert(normalizedItem, ADMIN_EMAIL)
          
          if (result.success) {
            console.log(`✅ Low stock alert sent for: ${item.item_name}`)
            
            await lowStockAlertsAPI.markAsSent(item.id)
            

            await activityLogsAPI.add({
              itemName: item.item_name,
              action: 'Alert',
              userId: currentUser.id,
              details: `Low stock email alert sent to admin (${item.quantity} units remaining, reorder at ${item.reorder_level})`
            })
            
            const logs = await activityLogsAPI.getAll()
            setActivityLogs(logs)
          } else {
            console.error('❌ Failed to send alert:', result.error)
          }
        }
      } catch (error) {
        console.error('Error checking low stock:', error)
      }
    }

    checkLowStock()
    const interval = setInterval(checkLowStock, 300000)

    return () => clearInterval(interval)
  }, [currentUser, inventoryData])

  const handleLogin = (user) => {
    setCurrentUser(user)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage('dashboard')
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
    
    if (page === 'dashboard') {
      const reloadLogs = async () => {
        try {
          const logs = await activityLogsAPI.getAll()
          setActivityLogs(logs)
          console.log('✅ Activity logs refreshed:', logs.length, 'logs')
        } catch (error) {
          console.error('❌ Error reloading activity logs:', error)
        }
      }
      reloadLogs()
    }
  }

  const addActivityLog = async (itemName, action, details) => {
    try {
      console.log('📝 Adding activity log:', { itemName, action, details, userId: currentUser.id })
      
      const result = await activityLogsAPI.add({
        itemName,
        action,
        userId: currentUser.id,
        details
      })
      
      console.log('✅ Activity log added:', result)
      
      const logs = await activityLogsAPI.getAll()
      console.log('📊 Refreshed activity logs:', logs.length, 'total logs')
      console.log('🔹 Latest log:', logs[logs.length - 1])
      
      setActivityLogs(logs)
    } catch (error) {
      console.error('❌ Error adding activity log:', error)
      console.error('❌ Error details:', error.message, error.response)
    }
  }

  const handleAddItem = async (newItem) => {
    try {
      console.log('📤 Frontend: Adding item:', newItem)
      
      const category = categories.find(c => c.category_name === newItem.category || c.categoryName === newItem.category)
      const location = locations.find(l => l.location_name === newItem.location || l.locationName === newItem.location)
      
      if (!category) {
        throw new Error(`Category "${newItem.category}" not found`)
      }
      if (!location) {
        throw new Error(`Location "${newItem.location}" not found`)
      }
      
      const currentDate = newItem.dateAdded || new Date().toISOString().split('T')[0]
      
      console.log('📤 Sending to API:', {
        itemName: newItem.itemName,
        categoryId: category?.id,
        quantity: newItem.quantity,
        locationId: location?.id,
        reorderLevel: newItem.reorderLevel,
        price: newItem.price,
        supplierId: newItem.supplierId,
        dateAdded: currentDate
      })
      
      await inventoryAPI.add({
        itemName: newItem.itemName,
        categoryId: category?.id,
        quantity: newItem.quantity,
        locationId: location?.id,
        reorderLevel: newItem.reorderLevel,
        price: newItem.price,
        supplierId: newItem.supplierId,
        dateAdded: currentDate
      })
      
      await addActivityLog(
        newItem.itemName,
        'Added',
        `Added ${newItem.quantity} units to inventory`
      )
      
      console.log('✅ Item added successfully, reloading inventory...')
      
      const inventory = await inventoryAPI.getAll()
      setInventoryData(inventory)
    } catch (error) {
      console.error('❌ Error adding item:', error)
      alert('Failed to add item: ' + error.message)
    }
  }

  const handleEditItem = async (updatedItem) => {
    try {
      const oldItem = inventoryData.find(item => item.id === updatedItem.id)
      
      const category = categories.find(c => c.category_name === updatedItem.category || c.categoryName === updatedItem.category)
      const location = locations.find(l => l.location_name === updatedItem.location || l.locationName === updatedItem.location)
      
      await inventoryAPI.update(updatedItem.id, {
        itemName: updatedItem.itemName,
        categoryId: category?.id,
        quantity: updatedItem.quantity,
        locationId: location?.id,
        reorderLevel: updatedItem.reorderLevel,
        price: updatedItem.price,
        supplierId: updatedItem.supplierId,
        damagedStatus: updatedItem.damagedStatus
      })
      
      const changes = []
      if (oldItem.quantity !== updatedItem.quantity) {
        changes.push(`quantity: ${oldItem.quantity} → ${updatedItem.quantity}`)
      }
      if (oldItem.location !== updatedItem.location) {
        changes.push(`location: ${oldItem.location} → ${updatedItem.location}`)
      }
      
      await addActivityLog(
        updatedItem.itemName,
        'Edited',
        changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Updated item information'
      )
      
      const inventory = await inventoryAPI.getAll()
      setInventoryData(inventory)
    } catch (error) {
      console.error('Error editing item:', error)
      alert('Failed to edit item: ' + error.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    try {
      const item = inventoryData.find(i => i.id === itemId)
      
      await inventoryAPI.delete(itemId)
      
      await addActivityLog(
        item.item_name || item.itemName,
        'Deleted',
        'Item removed from inventory'
      )
      
      const inventory = await inventoryAPI.getAll()
      setInventoryData(inventory)
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item: ' + error.message)
    }
  }

  const handleTransaction = async (transaction) => {
    try {
      await transactionsAPI.add({
        itemId: transaction.itemId,
        transactionType: transaction.transactionType,
        quantity: transaction.quantity,
        reason: transaction.reason,
        userId: currentUser.id,
        stockBefore: transaction.stockBefore,
        stockAfter: transaction.stockAfter
      })
      
      const action = transaction.transactionType === 'IN' 
        ? `Stock IN: +${transaction.quantity}` 
        : `Stock OUT: -${transaction.quantity}`
      
      await addActivityLog(
        transaction.itemName,
        'Transaction',
        `${action} (${transaction.stockBefore} → ${transaction.stockAfter}) - ${transaction.reason}`
      )
      
      const [inventory, trans, damaged] = await Promise.all([
        inventoryAPI.getAll(),
        transactionsAPI.getAll(),
        damagedItemsAPI.getAll()
      ])
      setInventoryData(inventory)
      setTransactionHistory(trans)
      setDamagedItems(damaged)
      
      const item = inventory.find(i => i.id === transaction.itemId)
      if (item && item.quantity > item.reorder_level) {
        await lowStockAlertsAPI.clearAlert(item.id)
      }
    } catch (error) {
      console.error('Error recording transaction:', error)
      alert('Failed to record transaction: ' + error.message)
    }
  }

  const handleAddCategory = async (newCategory) => {
    try {
      await categoriesAPI.add(newCategory)
      
      await addActivityLog(
        newCategory.categoryName,
        'Added',
        'New category added'
      )
      
      const cats = await categoriesAPI.getAll()
      setCategories(cats)
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category: ' + error.message)
    }
  }

  const handleEditCategory = async (updatedCategory) => {
    try {
      await categoriesAPI.update(updatedCategory.id, {
        categoryName: updatedCategory.categoryName,
        description: updatedCategory.description
      })
      
      await addActivityLog(
        updatedCategory.categoryName,
        'Edited',
        'Category information updated'
      )
      
      const [cats, inventory] = await Promise.all([
        categoriesAPI.getAll(),
        inventoryAPI.getAll()
      ])
      setCategories(cats)
      setInventoryData(inventory)
    } catch (error) {
      console.error('Error editing category:', error)
      alert('Failed to edit category: ' + error.message)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      const category = categories.find(c => c.id === categoryId)
      
      await categoriesAPI.delete(categoryId)
      
      await addActivityLog(
        category.category_name || category.categoryName,
        'Deleted',
        'Category removed'
      )
      
      const cats = await categoriesAPI.getAll()
      setCategories(cats)
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category: ' + error.message)
    }
  }

  const handleAddLocation = async (newLocation) => {
    try {
      await locationsAPI.add(newLocation)
      
      await addActivityLog(
        `Location: ${newLocation.locationName}`,
        'Added',
        'New location added to warehouse'
      )
      
      const locs = await locationsAPI.getAll()
      setLocations(locs)
    } catch (error) {
      console.error('Error adding location:', error)
      alert('Failed to add location: ' + error.message)
    }
  }

  const handleEditLocation = async (updatedLocation) => {
    try {
      await locationsAPI.update(updatedLocation.id, {
        locationName: updatedLocation.locationName,
        description: updatedLocation.description
      })
      
      await addActivityLog(
        `Location: ${updatedLocation.locationName}`,
        'Edited',
        'Location information updated'
      )
      
      const [locs, inventory] = await Promise.all([
        locationsAPI.getAll(),
        inventoryAPI.getAll()
      ])
      setLocations(locs)
      setInventoryData(inventory)
    } catch (error) {
      console.error('Error editing location:', error)
      alert('Failed to edit location: ' + error.message)
    }
  }

  const handleDeleteLocation = async (locationId) => {
    try {
      const location = locations.find(l => l.id === locationId)
      
      await locationsAPI.delete(locationId)
      
      await addActivityLog(
        `Location: ${location.location_name || location.locationName}`,
        'Deleted',
        'Location removed from warehouse'
      )
      
      const locs = await locationsAPI.getAll()
      setLocations(locs)
    } catch (error) {
      console.error('Error deleting location:', error)
      alert('Failed to delete location: ' + error.message)
    }
  }

  const handleAddSupplier = async (newSupplier) => {
    try {
      console.log('📤 Adding supplier:', newSupplier)
      
      const currentDate = newSupplier.dateAdded || new Date().toISOString().split('T')[0]
      
      // Create the supplier first
      const result = await suppliersAPI.add({
        supplierName: newSupplier.supplierName,
        contactPerson: newSupplier.contactPerson,
        contactEmail: newSupplier.contactEmail || '',
        contactPhone: newSupplier.contactPhone || '',
        address: newSupplier.address || '',
        isActive: newSupplier.isActive !== undefined ? newSupplier.isActive : true,
        dateAdded: currentDate
      })
      
      console.log('✅ Supplier created with ID:', result.id)
      
      // If there are existing items to assign, update them
      if (newSupplier.suppliedItemIds && newSupplier.suppliedItemIds.length > 0) {
        console.log('📦 Assigning existing items to new supplier:', newSupplier.suppliedItemIds)
        
        // Update each selected item to have this supplier
        const updatePromises = newSupplier.suppliedItemIds.map(async (itemId) => {
          const item = inventoryData.find(i => i.id === itemId)
          if (!item) return null
          
          const category = categories.find(c => 
            c.category_name === item.category || c.categoryName === item.category
          )
          const location = locations.find(l => 
            l.location_name === item.location || l.locationName === item.location
          )
          
          return inventoryAPI.update(itemId, {
            itemName: item.item_name || item.itemName,
            categoryId: category?.id,
            quantity: item.quantity,
            locationId: location?.id,
            reorderLevel: item.reorder_level || item.reorderLevel,
            price: item.price,
            supplierId: result.id, // ✅ Assign to new supplier
            damagedStatus: item.damaged_status || item.damagedStatus || 'Good'
          })
        })
        
        await Promise.all(updatePromises.filter(Boolean))
        console.log(`✅ Assigned ${newSupplier.suppliedItemIds.length} existing items to supplier`)
      }
      
      await addActivityLog(
        newSupplier.supplierName,
        'Added',
        `New supplier added${newSupplier.suppliedItemIds?.length ? ` with ${newSupplier.suppliedItemIds.length} items` : ''}`
      )
      
      console.log('✅ Supplier added successfully, reloading data...')
      
      // Reload both suppliers and inventory
      const [sups, inventory] = await Promise.all([
        suppliersAPI.getAll(),
        inventoryAPI.getAll()
      ])
      setSuppliers(sups)
      setInventoryData(inventory)
    } catch (error) {
      console.error('❌ Error adding supplier:', error)
      alert('Failed to add supplier: ' + error.message)
    }
  }

  const handleEditSupplier = async (updatedSupplier) => {
    try {
      await suppliersAPI.update(updatedSupplier.id, {
        supplierName: updatedSupplier.supplierName,
        contactPerson: updatedSupplier.contactPerson,
        contactEmail: updatedSupplier.contactEmail,
        contactPhone: updatedSupplier.contactPhone,
        address: updatedSupplier.address,
        isActive: updatedSupplier.isActive
      })
      
      await addActivityLog(
        updatedSupplier.supplierName,
        'Edited',
        'Supplier information updated'
      )
      
      const sups = await suppliersAPI.getAll()
      setSuppliers(sups)
      
      const inventory = await inventoryAPI.getAll()
      setInventoryData(inventory)
    } catch (error) {
      console.error('Error editing supplier:', error)
      alert('Failed to edit supplier: ' + error.message)
    }
  }

  const handleUpdateSupplierItems = async (supplierId, selectedItemIds) => {
    try {
      console.log('📦 Updating supplier items:', { supplierId, selectedItemIds })
      
      // Update all items: assign selected items to this supplier, unassign others
      const updatePromises = inventoryData.map(async (item) => {
        const shouldBeAssigned = selectedItemIds.includes(item.id)
        const currentlyAssigned = item.supplierId === supplierId || item.supplier_id === supplierId
        
        if (shouldBeAssigned !== currentlyAssigned) {
          const category = categories.find(c => 
            c.category_name === item.category || c.categoryName === item.category
          )
          const location = locations.find(l => 
            l.location_name === item.location || l.locationName === item.location
          )
          
          return inventoryAPI.update(item.id, {
            itemName: item.item_name || item.itemName,
            categoryId: category?.id,
            quantity: item.quantity,
            locationId: location?.id,
            reorderLevel: item.reorder_level || item.reorderLevel,
            price: item.price,
            supplierId: shouldBeAssigned ? supplierId : null,
            damagedStatus: item.damaged_status || item.damagedStatus || 'Good'
          })
        }
      })
      
      await Promise.all(updatePromises.filter(Boolean))
      
      console.log('✅ Supplier items updated successfully')
      
      const inventory = await inventoryAPI.getAll()
      setInventoryData(inventory)
      
      const supplier = suppliers.find(s => s.id === supplierId)
      await addActivityLog(
        supplier?.supplier_name || supplier?.supplierName || 'Supplier',
        'Edited',
        `Updated item assignments: ${selectedItemIds.length} items assigned`
      )
    } catch (error) {
      console.error('❌ Error updating supplier items:', error)
      alert('Failed to update supplier items: ' + error.message)
    }
  }

  const handleDeleteSupplier = async (supplierId) => {
    try {
      const supplier = suppliers.find(s => s.id === supplierId)
      
      await suppliersAPI.delete(supplierId)
      
      await addActivityLog(
        supplier.supplier_name || supplier.supplierName,
        'Deleted',
        'Supplier removed'
      )
      
      const sups = await suppliersAPI.getAll()
      setSuppliers(sups)
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Failed to delete supplier: ' + error.message)
    }
  }

  const handleScheduleAppointment = async (appointment) => {
    try {
      await appointmentsAPI.add({
        supplierId: appointment.supplierId,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        notes: appointment.notes,
        scheduledByUserId: currentUser.id,
        items: appointment.items
      })
      
      await addActivityLog(
        `Appointment with ${appointment.supplierName}`,
        'Added',
        `Scheduled for ${appointment.date} at ${appointment.time}`
      )
      
      const apts = await appointmentsAPI.getAll()
      setAppointments(apts)
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      alert('Failed to schedule appointment: ' + error.message)
    }
  }

  const handleEditAppointment = async (updatedAppointment) => {
    try {
      await appointmentsAPI.update(updatedAppointment.id, {
        supplierId: updatedAppointment.supplierId,
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        status: updatedAppointment.status,
        notes: updatedAppointment.notes,
        items: updatedAppointment.items
      })
      
      await addActivityLog(
        `Appointment with ${updatedAppointment.supplierName}`,
        'Edited',
        'Appointment details updated'
      )
      
      const apts = await appointmentsAPI.getAll()
      setAppointments(apts)
    } catch (error) {
      console.error('Error editing appointment:', error)
      alert('Failed to edit appointment: ' + error.message)
    }
  }

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await appointmentsAPI.complete(appointmentId, currentUser.id)
      
      const appointment = appointments.find(a => a.id === appointmentId)
      const itemsList = appointment.items.map(i => `${i.itemName} (${i.quantity})`).join(', ')
      
      await addActivityLog(
        `Appointment: ${appointment.supplierName}`,
        'Edited',
        `Completed appointment - Restocked ${appointment.items.length} item(s): ${itemsList}`
      )
      
      const [apts, inventory, trans] = await Promise.all([
        appointmentsAPI.getAll(),
        inventoryAPI.getAll(),
        transactionsAPI.getAll()
      ])
      setAppointments(apts)
      setInventoryData(inventory)
      setTransactionHistory(trans)
    } catch (error) {
      console.error('Error completing appointment:', error)
      alert('Failed to complete appointment: ' + error.message)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentsAPI.cancel(appointmentId)
      
      const appointment = appointments.find(a => a.id === appointmentId)
      
      await addActivityLog(
        `Appointment with ${appointment.supplierName}`,
        'Deleted',
        'Appointment cancelled'
      )
      
      const apts = await appointmentsAPI.getAll()
      setAppointments(apts)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Failed to cancel appointment: ' + error.message)
    }
  }

  const handleUpdateDamagedItem = async (updatedItem) => {
    try {
      await damagedItemsAPI.update(updatedItem.id, {
        status: updatedItem.status,
        notes: updatedItem.notes
      })
      
      await addActivityLog(
        updatedItem.itemName,
        'Edited',
        `Damaged item updated. Status: ${updatedItem.status}${updatedItem.notes ? `. Notes: ${updatedItem.notes}` : ''}`
      )
      
      const damaged = await damagedItemsAPI.getAll()
      setDamagedItems(damaged)
    } catch (error) {
      console.error('Error updating damaged item:', error)
      alert('Failed to update damaged item: ' + error.message)
    }
  }

  const handleRemoveDamagedItem = async (itemId) => {
    try {
      const item = damagedItems.find(i => i.id === itemId)
      
      await damagedItemsAPI.delete(itemId)
      
      await addActivityLog(
        item.itemName,
        'Deleted',
        `Removed from damaged items list (${item.quantity} units, Status: ${item.status})`
      )
      
      const damaged = await damagedItemsAPI.getAll()
      setDamagedItems(damaged)
    } catch (error) {
      console.error('Error removing damaged item:', error)
      alert('Failed to remove damaged item: ' + error.message)
    }
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadAllData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-sm">Warehouse</h2>
            <p className="text-xs text-muted-foreground">Inventory System</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        w-64 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto z-50
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">Warehouse</h2>
              <p className="text-xs text-muted-foreground">Inventory System</p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => {
                handleNavigate('dashboard')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium text-left">Dashboard</span>
            </button>

            <button
              onClick={() => {
                handleNavigate('transactions')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'transactions' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="font-medium text-left">Stock Transactions</span>
            </button>

            {currentUser.role === 'Admin' && (
              <button
                onClick={() => {
                  handleNavigate('inventory')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'inventory' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-medium text-left">Manage Inventory</span>
              </button>
            )}

            <button
              onClick={() => {
                handleNavigate('suppliers')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'suppliers' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Suppliers</span>
            </button>

            <button
              onClick={() => {
                handleNavigate('categories')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'categories' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium">Categories</span>
            </button>

            <button
              onClick={() => {
                handleNavigate('appointments')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'appointments' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Appointments</span>
            </button>

            <button
              onClick={() => {
                handleNavigate('damaged')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'damaged' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">Damaged Items</span>
            </button>

            <button
              onClick={() => {
                handleNavigate('logs')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'logs' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Activity Logs</span>
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors mt-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8">
        {currentPage === 'dashboard' && (
          <Dashboard
            user={currentUser}
            inventoryData={inventoryData}
            damagedItems={damagedItems}
            activityLogs={activityLogs}
            onNavigate={handleNavigate}
            onLogActivity={addActivityLog}
          />
        )}

        {currentPage === 'transactions' && (
          <StockTransactions
            user={currentUser}
            inventoryData={inventoryData}
            transactionHistory={transactionHistory}
            onTransaction={handleTransaction}
          />
        )}

        {currentPage === 'inventory' && currentUser.role === 'Admin' && (
          <InventoryTable
            user={currentUser}
            inventoryData={inventoryData}
            suppliers={suppliers}
            categories={categories}
            locations={locations}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddLocation={handleAddLocation}
            onEditLocation={handleEditLocation}
            onDeleteLocation={handleDeleteLocation}
          />
        )}

        {currentPage === 'suppliers' && (
          <SuppliersPage
            user={currentUser}
            suppliers={suppliers}
            inventoryData={inventoryData}
            categories={categories}
            locations={locations}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onUpdateSupplierItems={handleUpdateSupplierItems}
            onAddItem={handleAddItem}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage
            user={currentUser}
            categories={categories}
            inventoryData={inventoryData}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentPage === 'appointments' && (
          <AppointmentsPage
            user={currentUser}
            appointments={appointments}
            suppliers={suppliers}
            inventoryData={inventoryData}
            onScheduleAppointment={handleScheduleAppointment}
            onEditAppointment={handleEditAppointment}
            onCancelAppointment={handleCancelAppointment}
            onCompleteAppointment={handleCompleteAppointment}
          />
        )}

        {currentPage === 'damaged' && (
          <DamagedItemsPage
            user={currentUser}
            damagedItems={damagedItems}
            onUpdateDamagedItem={handleUpdateDamagedItem}
            onRemoveDamagedItem={handleRemoveDamagedItem}
          />
        )}

        {currentPage === 'logs' && (
          <ActivityLogs 
            activityLogs={activityLogs}
            currentUser={currentUser}
          />
        )}
      </main>
    </div>
  )
}