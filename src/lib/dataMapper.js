// Centralized Data Normalization Utility
// Handles both camelCase (frontend) and snake_case (database) naming conventions

/**
 * Normalize Inventory Item
 * Handles items from database or frontend state
 */
export const normalizeInventoryItem = (item) => {
  if (!item) return null
  
  return {
    id: item.id,
    itemName: item.item_name || item.itemName,
    category: item.category_name || item.category,
    categoryId: item.category_id || item.categoryId,
    quantity: item.quantity,
    location: item.location_name || item.location,
    locationId: item.location_id || item.locationId,
    reorderLevel: item.reorder_level || item.reorderLevel,
    price: item.price,
    supplier: item.supplier_name || item.supplier,
    supplierId: item.supplier_id || item.supplierId,
    damagedStatus: item.damaged_status || item.damagedStatus,
    dateAdded: item.date_added || item.dateAdded,
    createdAt: item.created_at || item.createdAt
  }
}

/**
 * Normalize array of inventory items
 */
export const normalizeInventoryItems = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeInventoryItem).filter(Boolean)
}

/**
 * Normalize Supplier
 */
export const normalizeSupplier = (supplier) => {
  if (!supplier) return null
  
  return {
    id: supplier.id,
    supplierName: supplier.supplier_name || supplier.supplierName,
    contactPerson: supplier.contact_person || supplier.contactPerson,
    contactEmail: supplier.contact_email || supplier.contactEmail,
    contactPhone: supplier.contact_phone || supplier.contactPhone,
    address: supplier.address,
    isActive: supplier.is_active !== undefined ? supplier.is_active : supplier.isActive,
    dateAdded: supplier.date_added || supplier.dateAdded,
    createdAt: supplier.created_at || supplier.createdAt
  }
}

/**
 * Normalize array of suppliers
 */
export const normalizeSuppliers = (suppliers) => {
  if (!Array.isArray(suppliers)) return []
  return suppliers.map(normalizeSupplier).filter(Boolean)
}

/**
 * Normalize Category
 */
export const normalizeCategory = (category) => {
  if (!category) return null
  
  return {
    id: category.id,
    categoryName: category.category_name || category.categoryName,
    description: category.description,
    dateAdded: category.date_added || category.dateAdded,
    createdAt: category.created_at || category.createdAt
  }
}

/**
 * Normalize array of categories
 */
export const normalizeCategories = (categories) => {
  if (!Array.isArray(categories)) return []
  return categories.map(normalizeCategory).filter(Boolean)
}

/**
 * Normalize Location
 */
export const normalizeLocation = (location) => {
  if (!location) return null
  
  return {
    id: location.id,
    locationName: location.location_name || location.locationName,
    description: location.description,
    dateAdded: location.date_added || location.dateAdded,
    createdAt: location.created_at || location.createdAt
  }
}

/**
 * Normalize array of locations
 */
export const normalizeLocations = (locations) => {
  if (!Array.isArray(locations)) return []
  return locations.map(normalizeLocation).filter(Boolean)
}

/**
 * Normalize Transaction
 */
export const normalizeTransaction = (transaction) => {
  if (!transaction) return null
  
  return {
    id: transaction.id,
    itemId: transaction.item_id || transaction.itemId,
    itemName: transaction.item_name || transaction.itemName,
    transactionType: transaction.transaction_type || transaction.transactionType,
    quantity: transaction.quantity,
    reason: transaction.reason,
    userId: transaction.user_id || transaction.userId,
    userName: transaction.user_name || transaction.userName,
    userRole: transaction.user_role || transaction.userRole,
    stockBefore: transaction.stock_before || transaction.stockBefore,
    stockAfter: transaction.stock_after || transaction.stockAfter,
    timestamp: transaction.timestamp
  }
}

/**
 * Normalize array of transactions
 */
export const normalizeTransactions = (transactions) => {
  if (!Array.isArray(transactions)) return []
  return transactions.map(normalizeTransaction).filter(Boolean)
}

/**
 * Normalize Activity Log
 */
export const normalizeActivityLog = (log) => {
  if (!log) return null
  
  return {
    id: log.id,
    itemName: log.item_name || log.itemName,
    action: log.action,
    userId: log.user_id || log.userId,
    userName: log.user_name || log.userName,
    userRole: log.user_role || log.userRole,
    timestamp: log.timestamp,
    details: log.details
  }
}

/**
 * Normalize array of activity logs
 */
export const normalizeActivityLogs = (logs) => {
  if (!Array.isArray(logs)) return []
  return logs.map(normalizeActivityLog).filter(Boolean)
}

/**
 * Normalize Appointment
 */
export const normalizeAppointment = (appointment) => {
  if (!appointment) return null
  
  return {
    id: appointment.id,
    supplierId: appointment.supplier_id || appointment.supplierId,
    supplierName: appointment.supplier_name || appointment.supplierName,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    notes: appointment.notes,
    items: appointment.items || [],
    scheduledBy: appointment.scheduled_by || appointment.scheduledBy,
    scheduledByUserId: appointment.scheduled_by_user_id || appointment.scheduledByUserId,
    scheduledDate: appointment.scheduled_date || appointment.scheduledDate,
    lastUpdated: appointment.last_updated || appointment.lastUpdated
  }
}

/**
 * Normalize array of appointments
 */
export const normalizeAppointments = (appointments) => {
  if (!Array.isArray(appointments)) return []
  return appointments.map(normalizeAppointment).filter(Boolean)
}

/**
 * Normalize Damaged Item
 */
export const normalizeDamagedItem = (item) => {
  if (!item) return null
  
  return {
    id: item.id,
    itemId: item.item_id || item.itemId,
    itemName: item.item_name || item.itemName,
    quantity: item.quantity,
    location: item.location_name || item.location,
    reason: item.reason,
    status: item.status,
    notes: item.notes,
    price: item.price,
    dateDamaged: item.date_damaged || item.dateDamaged,
    lastUpdated: item.last_updated || item.lastUpdated
  }
}

/**
 * Normalize array of damaged items
 */
export const normalizeDamagedItems = (items) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeDamagedItem).filter(Boolean)
}

/**
 * Normalize User
 */
export const normalizeUser = (user) => {
  if (!user) return null
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    signupDate: user.signup_date || user.signupDate,
    createdAt: user.created_at || user.createdAt
  }
}

/**
 * Normalize array of users
 */
export const normalizeUsers = (users) => {
  if (!Array.isArray(users)) return []
  return users.map(normalizeUser).filter(Boolean)
}

// Export all normalizers
export default {
  normalizeInventoryItem,
  normalizeInventoryItems,
  normalizeSupplier,
  normalizeSuppliers,
  normalizeCategory,
  normalizeCategories,
  normalizeLocation,
  normalizeLocations,
  normalizeTransaction,
  normalizeTransactions,
  normalizeActivityLog,
  normalizeActivityLogs,
  normalizeAppointment,
  normalizeAppointments,
  normalizeDamagedItem,
  normalizeDamagedItems,
  normalizeUser,
  normalizeUsers
}