


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

// Import email service
import { sendLowStockAlert, sendAppointmentEmail } from './lib/emailService'

// admin email here
const ADMIN_EMAIL = 'markjadebucao10@gmail.com' // Change this to your actual admin email

export default function App() {
  // = STATE MANAGEMENT 
  
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('suppliers')
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        supplierName: 'Office Warehouse',
        contactPerson: 'Juan Dela Cruz',
        contactEmail: 'jomissmart@gmail.com',
        contactPhone: '+63-912-345-6789',
        address: 'Quezon City, Metro Manila',
        isActive: true,
        dateAdded: '11/01/2025'
      },
      {
        id: 2,
        supplierName: 'COSCO SHIPPING',
        contactPerson: 'Maria Santos',
        contactEmail: 'berdecaloy@gmail.com',
        contactPhone: '+63-917-888-9999',
        address: 'Manila Port Area',
        isActive: true,
        dateAdded: '11/02/2025'
      },
      {
        id: 3,
        supplierName: 'Tech Supplies Inc.',
        contactPerson: 'Pedro Reyes',
        contactEmail: 'chiefmayo2024@gmail.com',
        contactPhone: '+63-918-111-2222',
        address: 'Makati City',
        isActive: true,
        dateAdded: '11/03/2025'
      }
    ]
  })

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories')
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        categoryName: 'Office Supplies',
        description: 'Paper, pens, and general office items',
        dateAdded: '11/01/2025'
      },
      {
        id: 2,
        categoryName: 'Equipment',
        description: 'Printers, computers, and machinery',
        dateAdded: '11/01/2025'
      },
      {
        id: 3,
        categoryName: 'Furniture',
        description: 'Desks, chairs, and storage',
        dateAdded: '11/01/2025'
      },
      {
        id: 4,
        categoryName: 'Electronics',
        description: 'Gadgets and electronic accessories',
        dateAdded: '11/01/2025'
      },
      {
        id: 5,
        categoryName: 'Other',
        description: 'Miscellaneous items',
        dateAdded: '11/01/2025'
      }
    ]
  })

  const [locations, setLocations] = useState(() => {
  const saved = localStorage.getItem('locations')
  return saved ? JSON.parse(saved) : [
    {
      id: 1,
      locationName: 'Warehouse A, Shelf 1',
      description: 'Main storage area, first floor',
      dateAdded: '11/01/2025'
    },
    {
      id: 2,
      locationName: 'Warehouse B, Section 2',
      description: 'Equipment storage, second floor',
      dateAdded: '11/01/2025'
    },
    {
      id: 3,
      locationName: 'Warehouse C, Area 1',
      description: 'Furniture storage',
      dateAdded: '11/01/2025'
    },
    {
      id: 4,
      locationName: 'Warehouse A, Shelf 3',
      description: 'Office supplies section',
      dateAdded: '11/01/2025'
    },
    {
      id: 5,
      locationName: 'Warehouse B, Section 4',
      description: 'Electronics storage',
      dateAdded: '11/01/2025'
    }
  ]
})
  
  const [inventoryData, setInventoryData] = useState(() => {
    const saved = localStorage.getItem('inventoryData')
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        itemName: 'A4 Bond Paper',
        category: 'Office Supplies',
        quantity: 100,
        location: 'Warehouse A, Shelf 1',
        reorderLevel: 20,
        price: 250.00,
        supplier: 'Office Warehouse',
        supplierId: 1,
        damagedStatus: 'Good',
        dateAdded: '11/15/2025'
      },
      {
        id: 2,
        itemName: 'HP Printer',
        category: 'Equipment',
        quantity: 40,
        location: 'Warehouse B, Section 2',
        reorderLevel: 10,
        price: 15000.00,
        supplier: 'Tech Supplies Inc.',
        supplierId: 3,
        damagedStatus: 'Good',
        dateAdded: '11/14/2025'
      },
      {
        id: 3,
        itemName: 'Office Desk',
        category: 'Furniture',
        quantity: 50,
        location: 'Warehouse C, Area 1',
        reorderLevel: 5,
        price: 8500.00,
        supplier: 'Office Warehouse',
        supplierId: 1,
        damagedStatus: 'Good',
        dateAdded: '11/10/2025'
      },
      {
        id: 4,
        itemName: 'Ballpen (Black)',
        category: 'Office Supplies',
        quantity: 200,
        location: 'Warehouse A, Shelf 3',
        reorderLevel: 50,
        price: 10.00,
        supplier: 'Office Warehouse',
        supplierId: 1,
        damagedStatus: 'Good',
        dateAdded: '11/16/2025'
      },
      {
        id: 5,
        itemName: 'Laptop Stand',
        category: 'Electronics',
        quantity: 100,
        location: 'Warehouse B, Section 4',
        reorderLevel: 20,
        price: 1200.00,
        supplier: 'Tech Supplies Inc.',
        supplierId: 3,
        damagedStatus: 'Good',
        dateAdded: '11/12/2025'
      }
    ]
  })
  
  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('activityLogs')
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        itemName: 'A4 Bond Paper',
        action: 'Added',
        userName: 'Mark Jade Bucao',
        userRole: 'Admin',
        timestamp: '11/15/2025 10:30 AM',
        details: 'Initial stock entry'
      },
      {
        id: 2,
        itemName: 'HP Printer',
        action: 'Added',
        userName: 'Mark Jade Bucao',
        userRole: 'Admin',
        timestamp: '11/14/2025 2:15 PM',
        details: 'New equipment received'
      },
      {
        id: 3,
        itemName: 'Office Desk',
        action: 'Edited',
        userName: 'Chadrick Arsenal',
        userRole: 'Staff',
        timestamp: '11/16/2025 9:45 AM',
        details: 'Updated item information'
      }
    ]
  })

  const [transactionHistory, setTransactionHistory] = useState(() => {
    const saved = localStorage.getItem('transactionHistory')
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        itemId: 1,
        itemName: 'A4 Bond Paper',
        transactionType: 'IN',
        quantity: 50,
        reason: 'Initial stock',
        userName: 'Mark Jade Bucao',
        userRole: 'Admin',
        timestamp: '11/15/2025 10:30 AM',
        stockBefore: 0,
        stockAfter: 50
      }
    ]
  })

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('appointments')
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        supplierId: 1,
        supplierName: 'Office Warehouse',
        date: '2025-11-25',
        time: '10:00',
        status: 'pending',
        items: [
          { itemId: 1, itemName: 'A4 Bond Paper', quantity: 100 },
          { itemId: 4, itemName: 'Ballpen (Black)', quantity: 500 }
        ],
        notes: 'Deliver to main entrance',
        scheduledBy: 'Mark Jade Bucao',
        scheduledDate: '11/18/2025 2:30 PM',
        lastUpdated: '11/18/2025 2:30 PM'
      }
    ]
  })

  const [damagedItems, setDamagedItems] = useState(() => {
    const saved = localStorage.getItem('damagedItems')
    return saved ? JSON.parse(saved) : []
  })

  //Track which items we've already sent low stock alerts for
  const [lowStockAlertsSent, setLowStockAlertsSent] = useState(() => {
    const saved = localStorage.getItem('lowStockAlertsSent')
    return saved ? JSON.parse(saved) : []
  })

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers))
  }, [suppliers])

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify(inventoryData))
  }, [inventoryData])

  useEffect(() => {
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs))
  }, [activityLogs])

  useEffect(() => {
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory))
  }, [transactionHistory])

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments))
  }, [appointments])

  useEffect(() => {
    localStorage.setItem('damagedItems', JSON.stringify(damagedItems))
  }, [damagedItems])

  useEffect(() => {
    localStorage.setItem('lowStockAlertsSent', JSON.stringify(lowStockAlertsSent))
  }, [lowStockAlertsSent])

  useEffect(() => {
  localStorage.setItem('locations', JSON.stringify(locations))
}, [locations])

  // Use a locking mechanism to prevent duplicate alerts from multiple tabs
  useEffect(() => {
    if (!currentUser) return

    const checkLowStock = async () => {
      const lowStockItems = inventoryData.filter(item => 
        item.quantity <= item.reorderLevel && 
        !lowStockAlertsSent.includes(item.id)
      )

      if (lowStockItems.length === 0) return

      // Try to acquire lock for this check cycle
      const lockKey = 'lowStockAlertLock'
      const lockTimeout = 10000 // 10 seconds
      const currentTime = Date.now()

      // Check if another tab has the lock
      const existingLock = localStorage.getItem(lockKey)
      if (existingLock) {
        const lockData = JSON.parse(existingLock)
        // If lock is still valid (less than 10 seconds old), skip
        if (currentTime - lockData.timestamp < lockTimeout) {
          console.log('⏭️ Another tab is handling low stock alerts, skipping...')
          return
        }
      }

      //  Acquire lock
      const lockData = {
        timestamp: currentTime,
        tabId: Math.random().toString(36).substr(2, 9)
      }
      localStorage.setItem(lockKey, JSON.stringify(lockData))

      // Wait a bit to ensure no race condition
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify we still have the lock
      const currentLock = localStorage.getItem(lockKey)
      if (!currentLock || JSON.parse(currentLock).tabId !== lockData.tabId) {
        console.log('⏭️ Lost lock to another tab, skipping...')
        return
      }

      // send emails - only this tab will do it
      for (const item of lowStockItems) {
        const result = await sendLowStockAlert(item, ADMIN_EMAIL)
        
        if (result.success) {
          console.log(`✅ Low stock alert sent for: ${item.itemName}`)
          
          // Mark this item as alerted
          setLowStockAlertsSent(prev => [...prev, item.id])
          
          // Add to activity logs
          const newLog = {
            id: Date.now() + Math.random(),
            itemName: item.itemName,
            action: 'Alert',
            userName: 'System',
            userRole: 'Automated',
            timestamp: new Date().toLocaleString('en-PH', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            details: `Low stock email alert sent to admin (${item.quantity} units remaining, reorder at ${item.reorderLevel})`
          }
          setActivityLogs(prev => [...prev, newLog])
        } else {
          console.error(`❌ Failed to send alert for: ${item.itemName}`)
        }
      }

      // ✅ Release lock after completion
      localStorage.removeItem(lockKey)
    }

    // Check immediately
    checkLowStock()
    
    // Then check every 30 seconds
    const interval = setInterval(checkLowStock, 30000)

    return () => {
      clearInterval(interval)
      // Clean up lock on unmount
      const lockKey = 'lowStockAlertLock'
      const existingLock = localStorage.getItem(lockKey)
      if (existingLock) {
        localStorage.removeItem(lockKey)
      }
    }
  }, [inventoryData, currentUser, lowStockAlertsSent])

  // ✅ Clear low stock alerts when stock is replenished above reorder level
  useEffect(() => {
    const restockedItems = inventoryData.filter(item => 
      item.quantity > item.reorderLevel && 
      lowStockAlertsSent.includes(item.id)
    )

    if (restockedItems.length > 0) {
      setLowStockAlertsSent(prev => 
        prev.filter(id => !restockedItems.some(item => item.id === id))
      )
    }
  }, [inventoryData, lowStockAlertsSent])

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'inventoryData' && e.newValue) {
        setInventoryData(JSON.parse(e.newValue))
      } else if (e.key === 'activityLogs' && e.newValue) {
        setActivityLogs(JSON.parse(e.newValue))
      } else if (e.key === 'transactionHistory' && e.newValue) {
        setTransactionHistory(JSON.parse(e.newValue))
      } else if (e.key === 'suppliers' && e.newValue) {
        setSuppliers(JSON.parse(e.newValue))
      } else if (e.key === 'categories' && e.newValue) {
        setCategories(JSON.parse(e.newValue))
      } else if (e.key === 'appointments' && e.newValue) {
        setAppointments(JSON.parse(e.newValue))
      } else if (e.key === 'damagedItems' && e.newValue) {
        setDamagedItems(JSON.parse(e.newValue))
      } else if (e.key === 'lowStockAlertsSent' && e.newValue) {
        setLowStockAlertsSent(JSON.parse(e.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // ========== HANDLER FUNCTIONS (unchanged) ==========
  
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
  }

  const handleAddItem = (newItem) => {
    setInventoryData(prev => [...prev, newItem])

    const newLog = {
      id: Date.now(),
      itemName: newItem.itemName,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Added ${newItem.quantity} units to inventory`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleEditItem = (updatedItem) => {
    const oldItem = inventoryData.find(item => item.id === updatedItem.id)
    setInventoryData(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    )

    const changes = []
    if (oldItem.quantity !== updatedItem.quantity) {
      changes.push(`quantity: ${oldItem.quantity} → ${updatedItem.quantity}`)
    }
    if (oldItem.location !== updatedItem.location) {
      changes.push(`location: ${oldItem.location} → ${updatedItem.location}`)
    }
    if (oldItem.category !== updatedItem.category) {
      changes.push(`category: ${oldItem.category} → ${updatedItem.category}`)
    }
    if (oldItem.supplier !== updatedItem.supplier) {
      changes.push(`supplier: ${oldItem.supplier || 'None'} → ${updatedItem.supplier || 'None'}`)
    }

    const newLog = {
      id: Date.now(),
      itemName: updatedItem.itemName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Updated item information'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleDeleteItem = (itemId) => {
    const item = inventoryData.find(i => i.id === itemId)
    
    setInventoryData(prev => prev.filter(item => item.id !== itemId))

    if (item) {
      const newLog = {
        id: Date.now(),
        itemName: item.itemName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Item removed from inventory'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  const handleTransaction = (transaction) => {
    const oldItem = inventoryData.find(item => item.id === transaction.itemId)
    
    setInventoryData(prev => 
      prev.map(item => {
        if (item.id === transaction.itemId) {
          let newQuantity = item.quantity
          if (transaction.transactionType === 'IN') {
            newQuantity += transaction.quantity
          } else {
            newQuantity -= transaction.quantity
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )

    setTransactionHistory(prev => [...prev, transaction])

    const action = transaction.transactionType === 'IN' 
      ? `Stock IN: +${transaction.quantity}` 
      : `Stock OUT: -${transaction.quantity}`
    
    const newLog = {
      id: Date.now(),
      itemName: transaction.itemName,
      action: 'Transaction',
      userName: transaction.userName,
      userRole: transaction.userRole,
      timestamp: transaction.timestamp,
      details: `${action} (${oldItem.quantity} → ${transaction.stockAfter}) - ${transaction.reason}`
    }
    setActivityLogs(prev => [...prev, newLog])

    if (transaction.transactionType === 'OUT' && transaction.reason === 'Damaged/Discarded') {
      const item = inventoryData.find(i => i.id === transaction.itemId)
      if (item) {
        const damagedItem = {
          id: Date.now(),
          itemId: item.id,
          itemName: item.itemName,
          quantity: transaction.quantity,
          location: item.location,
          reason: 'Damaged/Discarded',
          status: 'Standby',
          price: item.price || 0,
          dateDamaged: new Date().toLocaleDateString('en-PH'),
          notes: ''
        }
        setDamagedItems(prev => [...prev, damagedItem])
        
        const damagedLog = {
          id: Date.now() + 1,
          itemName: item.itemName,
          action: 'Added',
          userName: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date().toLocaleString('en-PH', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          details: `${transaction.quantity} units marked as damaged and moved to Damaged Items list`
        }
        setActivityLogs(prev => [...prev, damagedLog])
      }
    }
  }

  const handleAddLocation = (newLocation) => {
  setLocations(prev => [...prev, newLocation])

  const newLog = {
    id: Date.now(),
    itemName: `Location: ${newLocation.locationName}`,
    action: 'Added',
    userName: currentUser.name,
    userRole: currentUser.role,
    timestamp: new Date().toLocaleString('en-PH', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    details: 'New location added to warehouse'
  }
  setActivityLogs(prev => [...prev, newLog])
}

const handleEditLocation = (updatedLocation) => {
  const oldLocation = locations.find(loc => loc.id === updatedLocation.id)
  
  setLocations(prev => 
    prev.map(location => location.id === updatedLocation.id ? updatedLocation : location)
  )

  // Update items that use this location
  if (oldLocation && oldLocation.locationName !== updatedLocation.locationName) {
    setInventoryData(prev =>
      prev.map(item =>
        item.location === oldLocation.locationName
          ? { ...item, location: updatedLocation.locationName }
          : item
      )
    )
  }

  const newLog = {
    id: Date.now(),
    itemName: `Location: ${updatedLocation.locationName}`,
    action: 'Edited',
    userName: currentUser.name,
    userRole: currentUser.role,
    timestamp: new Date().toLocaleString('en-PH', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    details: 'Location information updated'
  }
  setActivityLogs(prev => [...prev, newLog])
}

const handleDeleteLocation = (locationId) => {
  const location = locations.find(l => l.id === locationId)
  
  setLocations(prev => prev.filter(l => l.id !== locationId))

  if (location) {
    const newLog = {
      id: Date.now(),
      itemName: `Location: ${location.locationName}`,
      action: 'Deleted',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Location removed from warehouse'
    }
    setActivityLogs(prev => [...prev, newLog])
  }
}

  const handleAddSupplier = (newSupplier) => {
    setSuppliers(prev => [...prev, newSupplier])

    if (newSupplier.suppliedItemIds && newSupplier.suppliedItemIds.length > 0) {
      setInventoryData(prev =>
        prev.map(item =>
          newSupplier.suppliedItemIds.includes(item.id)
            ? { ...item, supplierId: newSupplier.id, supplier: newSupplier.supplierName }
            : item
        )
      )
    }

    const newLog = {
      id: Date.now(),
      itemName: newSupplier.supplierName,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'New supplier added'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleEditSupplier = (updatedSupplier) => {
    setSuppliers(prev => 
      prev.map(supplier => supplier.id === updatedSupplier.id ? updatedSupplier : supplier)
    )

    const newLog = {
      id: Date.now(),
      itemName: updatedSupplier.supplierName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Supplier information updated'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleDeleteSupplier = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    
    setSuppliers(prev => prev.filter(s => s.id !== supplierId))

    if (supplier) {
      const newLog = {
        id: Date.now(),
        itemName: supplier.supplierName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Supplier removed'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  const handleAddCategory = (newCategory) => {
    setCategories(prev => [...prev, newCategory])

    const newLog = {
      id: Date.now(),
      itemName: newCategory.categoryName,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'New category added'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleEditCategory = (updatedCategory) => {
    const oldCategory = categories.find(c => c.id === updatedCategory.id)
    
    setCategories(prev => 
      prev.map(category => category.id === updatedCategory.id ? updatedCategory : category)
    )

    if (oldCategory && oldCategory.categoryName !== updatedCategory.categoryName) {
      setInventoryData(prev =>
        prev.map(item =>
          item.category === oldCategory.categoryName
            ? { ...item, category: updatedCategory.categoryName }
            : item
        )
      )
    }

    const newLog = {
      id: Date.now(),
      itemName: updatedCategory.categoryName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Category information updated'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleDeleteCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    
    setCategories(prev => prev.filter(c => c.id !== categoryId))

    if (category) {
      const newLog = {
        id: Date.now(),
        itemName: category.categoryName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Category removed'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  const handleScheduleAppointment = (appointment) => {
    setAppointments(prev => [...prev, appointment])

    const newLog = {
      id: Date.now(),
      itemName: `Appointment with ${appointment.supplierName}`,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Scheduled for ${appointment.date} at ${appointment.time}`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleEditAppointment = (updatedAppointment) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
    )

    const newLog = {
      id: Date.now(),
      itemName: `Appointment with ${updatedAppointment.supplierName}`,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Appointment details updated'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleCompleteAppointment = (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    
    if (!appointment) return

    setAppointments(prev =>
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'completed', lastUpdated: new Date().toLocaleString('en-PH') } 
          : apt
      )
    )

    setInventoryData(prev =>
      prev.map(item => {
        const appointmentItem = appointment.items.find(ai => ai.itemId === item.id)
        
        if (appointmentItem) {
          return {
            ...item,
            quantity: item.quantity + appointmentItem.quantity,
            supplierId: appointment.supplierId,
            supplier: appointment.supplierName
          }
        }
        
        return item
      })
    )

    appointment.items.forEach(appointmentItem => {
      const item = inventoryData.find(i => i.id === appointmentItem.itemId)
      if (item) {
        const transaction = {
          id: Date.now() + Math.random(),
          itemId: item.id,
          itemName: item.itemName,
          transactionType: 'IN',
          quantity: appointmentItem.quantity,
          reason: `Restock from appointment with ${appointment.supplierName}`,
          userName: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date().toLocaleString('en-PH', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          stockBefore: item.quantity,
          stockAfter: item.quantity + appointmentItem.quantity
        }
        
        setTransactionHistory(prev => [...prev, transaction])
      }
    })

    const itemsList = appointment.items.map(i => `${i.itemName} (${i.quantity})`).join(', ')
    const newLog = {
      id: Date.now(),
      itemName: `Appointment: ${appointment.supplierName}`,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Completed appointment - Restocked ${appointment.items.length} item(s): ${itemsList}`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleCancelAppointment = (appointmentId) => {
    setAppointments(prev =>
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled', lastUpdated: new Date().toLocaleString('en-PH') } 
          : apt
      )
    )

    const appointment = appointments.find(a => a.id === appointmentId)
    if (appointment) {
      const newLog = {
        id: Date.now(),
        itemName: `Appointment with ${appointment.supplierName}`,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Appointment cancelled'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  const handleUpdateDamagedItem = (updatedItem) => {
    const oldItem = damagedItems.find(item => item.id === updatedItem.id)
    
    setDamagedItems(prev =>
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    )

    const statusChange = oldItem.status !== updatedItem.status 
      ? ` Status changed: ${oldItem.status} → ${updatedItem.status}`
      : ''

    const newLog = {
      id: Date.now(),
      itemName: updatedItem.itemName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Damaged item updated.${statusChange}${updatedItem.notes ? ` Notes: ${updatedItem.notes}` : ''}`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  const handleRemoveDamagedItem = (itemId) => {
    const item = damagedItems.find(i => i.id === itemId)
    
    setDamagedItems(prev => prev.filter(i => i.id !== itemId))

    if (item) {
      const newLog = {
        id: Date.now(),
        itemName: item.itemName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: `Removed from damaged items list (${item.quantity} units, Status: ${item.status})`
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }

  

  //  RENDER 

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-6">
          {/* Logo/Brand */}
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

          {/* User Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => handleNavigate('dashboard')}
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
              onClick={() => handleNavigate('transactions')}
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
                onClick={() => handleNavigate('inventory')}
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
              onClick={() => handleNavigate('suppliers')}
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
              onClick={() => handleNavigate('categories')}
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
              onClick={() => handleNavigate('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'appointments' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Appointments</span>
            </button>

            <button
              onClick={() => handleNavigate('damaged')}
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
              onClick={() => handleNavigate('logs')}
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

          {/* Logout Button */}
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

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        {currentPage === 'dashboard' && (
          <Dashboard
            user={currentUser}
            inventoryData={inventoryData}
            activityLogs={activityLogs}
            onNavigate={handleNavigate}
            onLogActivity={(log) => setActivityLogs(prev => [...prev, log])}
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

        {/*suppliers and categories props */}
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

        {/*categories and onAddItem props */}
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
          <ActivityLogs activityLogs={activityLogs} />
        )}
      </main>
    </div>
  )
}