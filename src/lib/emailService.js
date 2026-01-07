
// Email Service for Warehouse Inventory System
const EMAILJS_SERVICE_ID = 'service_an2ngeg'
const EMAILJS_TEMPLATE_ID_LOW_STOCK = 'template_l3vz6al'
const EMAILJS_TEMPLATE_ID_APPOINTMENT = 'template_x3a2ecb'
const EMAILJS_TEMPLATE_ID_CANCEL = 'template_f78lto8'
const EMAILJS_PUBLIC_KEY = 'Lk9FwnFHIYBdz8d-d'

// Load EmailJS library
const loadEmailJS = () => {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      resolve(window.emailjs)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY)
      resolve(window.emailjs)
    }
    script.onerror = () => reject(new Error('Failed to load EmailJS'))
    document.head.appendChild(script)
  })
}

export const sendLowStockAlert = async (item, adminEmail) => {
  try {
    const emailjs = await loadEmailJS()

    const templateParams = {
      to_name: 'Admin',
      to_email: adminEmail,
      item_name: item.itemName,
      current_quantity: String(item.quantity),
      reorder_level: String(item.reorderLevel),
      location: item.location,
      category: item.category,
      supplier: item.supplier || 'No supplier assigned',
      alert_date: new Date().toLocaleString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    console.log('📧 Sending low stock alert with params:', templateParams)

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_LOW_STOCK,
      templateParams
    )

    console.log('✅ Low stock alert email sent:', response)
    return { success: true, response }
  } catch (error) {
    console.error('❌ Failed to send low stock alert:', error)
    return { success: false, error: error.message }
  }
}


export const sendAppointmentEmail = async (appointment, supplier) => {
  try {
    if (!supplier.contactEmail || supplier.contactEmail.trim() === '') {
      console.error('❌ Supplier has no email address:', supplier.supplierName)
      return { 
        success: false, 
        error: `Supplier "${supplier.supplierName}" has no email address configured` 
      }
    }

    const emailjs = await loadEmailJS()

    const itemsList = appointment.items
      .map(item => `• ${item.itemName} - ${item.quantity} units`)
      .join('\n')

    const appointmentDate = new Date(appointment.date)
    const formattedDate = appointmentDate.toLocaleDateString('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    const templateParams = {
      to_name: supplier.contactPerson,
      to_email: supplier.contactEmail, 
      supplier_name: supplier.supplierName,
      appointment_date: formattedDate,
      appointment_time: appointment.time,
      items_list: itemsList,
      total_items: String(appointment.items.length),
      notes: appointment.notes || 'No additional notes',
      scheduled_by: appointment.scheduledBy,
      status: appointment.status,
      contact_phone: supplier.contactPhone || 'Not provided'
    }

    console.log('📧 Sending appointment email to:', supplier.contactEmail)
    console.log('📋 Template parameters:', templateParams)
    console.log('📬 Using template ID:', EMAILJS_TEMPLATE_ID_APPOINTMENT)

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_APPOINTMENT,
      templateParams
    )

    console.log('✅ Appointment confirmation email sent successfully!')
    console.log('📨 Response:', response)
    
    return { success: true, response }
  } catch (error) {
    console.error('❌ Failed to send appointment email:', error)
    console.error('❌ Error details:', error.text || error.message)
    return { 
      success: false, 
      error: error.text || error.message || 'Unknown error occurred'
    }
  }
}

export const sendAppointmentCancelEmail = async (appointment, supplier, cancelReason = '') => {
  try {
    if (!supplier.contactEmail || supplier.contactEmail.trim() === '') {
      console.error('❌ Supplier has no email address:', supplier.supplierName)
      return { 
        success: false, 
        error: `Supplier "${supplier.supplierName}" has no email address configured` 
      }
    }

    const emailjs = await loadEmailJS()

    const itemsList = appointment.items
      .map(item => `• ${item.itemName} - ${item.quantity} units`)
      .join('\n')

    const appointmentDate = new Date(appointment.date)
    const formattedDate = appointmentDate.toLocaleDateString('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    const templateParams = {
      to_name: supplier.contactPerson,
      to_email: supplier.contactEmail, 
      supplier_name: supplier.supplierName,
      appointment_date: formattedDate,
      appointment_time: appointment.time,
      items_list: itemsList,
      total_items: String(appointment.items.length),
      cancel_reason: cancelReason || 'No reason provided',
      cancelled_by: appointment.scheduledBy,
      cancelled_date: new Date().toLocaleString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      contact_phone: supplier.contactPhone || 'Not provided'
    }

    console.log('📧 Sending cancellation email to:', supplier.contactEmail)
    console.log('📋 Template parameters:', templateParams)
    console.log('📬 Using template ID:', EMAILJS_TEMPLATE_ID_CANCEL)

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_CANCEL,
      templateParams
    )

    console.log('✅ Cancellation email sent successfully!')
    console.log('📨 Response:', response)
    
    return { success: true, response }
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error)
    console.error('❌ Error details:', error.text || error.message)
    return { 
      success: false, 
      error: error.text || error.message || 'Unknown error occurred'
    }
  }
}

export const isEmailConfigured = () => {
  return EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
         EMAILJS_TEMPLATE_ID_LOW_STOCK !== 'YOUR_LOW_STOCK_TEMPLATE_ID' &&
         EMAILJS_TEMPLATE_ID_APPOINTMENT !== 'YOUR_APPOINTMENT_TEMPLATE_ID' &&
         EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
}

export const sendTestEmail = async (testEmail) => {
  try {
    const emailjs = await loadEmailJS()

    const templateParams = {
      to_name: 'Test User',
      to_email: testEmail,
      message: 'This is a test email from your Warehouse Inventory System. Email notifications are working correctly!',
      test_date: new Date().toLocaleString('en-PH')
    }

    console.log('📧 Sending test email with params:', templateParams)

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_LOW_STOCK,
      templateParams
    )

    return { success: true, response }
  } catch (error) {
    console.error('Test email failed:', error)
    return { success: false, error: error.message }
  }
}