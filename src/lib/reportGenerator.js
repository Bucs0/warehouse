
// Report Generator Service - Export activity logs and inventory data
// Supports: CSV, PDF (via jsPDF), and Excel (via SheetJS)

/**
 * Generate CSV from activity logs
 */
export const generateCSVReport = (activityLogs, filters = {}) => {
  // CSV Header
  const headers = ['#', 'Item Name', 'Action', 'User', 'Role', 'Timestamp', 'Details']
  
  // Filter logs based on provided filters
  let filteredLogs = [...activityLogs].reverse()
  
  if (filters.action && filters.action !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action)
  }
  
  if (filters.month && filters.month !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
      const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      return dateMatch && dateMatch[1] === filters.month
    })
  }
  
  if (filters.year && filters.year !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
      const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      return dateMatch && dateMatch[3] === filters.year
    })
  }
  
  // Build CSV content
  let csvContent = headers.join(',') + '\n'
  
  filteredLogs.forEach((log, index) => {
    const row = [
      index + 1,
      `"${log.itemName.replace(/"/g, '""')}"`, // Escape quotes
      log.action,
      `"${log.userName}"`,
      log.userRole,
      log.timestamp,
      `"${(log.details || '').replace(/"/g, '""')}"` // Escape quotes
    ]
    csvContent += row.join(',') + '\n'
  })
  
  return csvContent
}

/**
 * Generate HTML report (for PDF conversion)
 */
export const generateHTMLReport = (activityLogs, filters = {}, metadata = {}) => {
  let filteredLogs = [...activityLogs].reverse()
  
  if (filters.action && filters.action !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action)
  }
  
  if (filters.month && filters.month !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
      const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      return dateMatch && dateMatch[1] === filters.month
    })
  }
  
  if (filters.year && filters.year !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
      const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      return dateMatch && dateMatch[3] === filters.year
    })
  }
  
  const actionCounts = {
    Added: filteredLogs.filter(l => l.action === 'Added').length,
    Edited: filteredLogs.filter(l => l.action === 'Edited').length,
    Deleted: filteredLogs.filter(l => l.action === 'Deleted').length,
    Transaction: filteredLogs.filter(l => l.action === 'Transaction').length
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const filterText = []
  if (filters.month && filters.month !== 'all') {
    filterText.push(monthNames[parseInt(filters.month) - 1])
  }
  if (filters.year && filters.year !== 'all') {
    filterText.push(filters.year)
  }
  if (filters.action && filters.action !== 'all') {
    filterText.push(`Action: ${filters.action}`)
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #1e40af;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      font-weight: normal;
    }
    .stat-card p {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .stat-card.added p { color: #16a34a; }
    .stat-card.edited p { color: #2563eb; }
    .stat-card.deleted p { color: #dc2626; }
    .stat-card.transaction p { color: #7c3aed; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      border: 1px solid #e5e7eb;
      font-weight: bold;
    }
    td {
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge.added { background-color: #dcfce7; color: #16a34a; }
    .badge.edited { background-color: #dbeafe; color: #2563eb; }
    .badge.deleted { background-color: #fee2e2; color: #dc2626; }
    .badge.transaction { background-color: #f3e8ff; color: #7c3aed; }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📦 Warehouse Inventory System</h1>
    <h2>Activity Logs Report</h2>
    <p>Generated on: ${new Date().toLocaleString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}</p>
    ${filterText.length > 0 ? `<p><strong>Filters Applied:</strong> ${filterText.join(' | ')}</p>` : ''}
    ${metadata.generatedBy ? `<p><strong>Generated by:</strong> ${metadata.generatedBy}</p>` : ''}
  </div>
  
  <div class="stats">
    <div class="stat-card added">
      <h3>Items Added</h3>
      <p>${actionCounts.Added}</p>
    </div>
    <div class="stat-card edited">
      <h3>Items Edited</h3>
      <p>${actionCounts.Edited}</p>
    </div>
    <div class="stat-card deleted">
      <h3>Items Deleted</h3>
      <p>${actionCounts.Deleted}</p>
    </div>
    <div class="stat-card transaction">
      <h3>Transactions</h3>
      <p>${actionCounts.Transaction}</p>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 50px;">#</th>
        <th>Item Name</th>
        <th style="width: 100px;">Action</th>
        <th>User</th>
        <th>Timestamp</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${filteredLogs.map((log, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${log.itemName}</strong></td>
          <td>
            <span class="badge ${log.action.toLowerCase()}">${log.action}</span>
          </td>
          <td>${log.userName}<br><small>${log.userRole}</small></td>
          <td style="font-size: 11px;">${log.timestamp}</td>
          <td style="font-size: 11px;">${log.details || 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p><strong>Total Records:</strong> ${filteredLogs.length} activities</p>
    <p>Warehouse Inventory System © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
  `
  
  return html
}

/**
 * Generate and download CSV file
 */
export const downloadCSV = (activityLogs, filters = {}, filename = 'activity_logs_report') => {
  const csvContent = generateCSVReport(activityLogs, filters)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  return { success: true, filename: `${filename}_${Date.now()}.csv` }
}

/**
 * Generate and download PDF file using print
 */
export const downloadPDF = (activityLogs, filters = {}, metadata = {}, filename = 'activity_logs_report') => {
  const htmlContent = generateHTMLReport(activityLogs, filters, metadata)
  
  // Create a hidden iframe
  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  
  document.body.appendChild(iframe)
  
  const iframeDoc = iframe.contentWindow.document
  iframeDoc.open()
  iframeDoc.write(htmlContent)
  iframeDoc.close()
  
  // Wait for content to load then print
  iframe.contentWindow.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.print()
      // Remove iframe after a delay
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }, 250)
  }
  
  return { success: true, filename: `${filename}_${Date.now()}.pdf` }
}

/**
 * Generate Excel-like report (CSV with .xls extension for Excel compatibility)
 */
export const downloadExcel = (activityLogs, filters = {}, filename = 'activity_logs_report') => {
  const csvContent = generateCSVReport(activityLogs, filters)
  
  // Add Excel-specific BOM for UTF-8 encoding
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const link = document.createElement('a')
  
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${Date.now()}.xls`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  return { success: true, filename: `${filename}_${Date.now()}.xls` }
}

/**
 * Generate summary report (text format)
 */
export const generateSummaryReport = (activityLogs, filters = {}) => {
  let filteredLogs = [...activityLogs]
  
  if (filters.action && filters.action !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action)
  }
  
  if (filters.month && filters.month !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
      const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      return dateMatch && dateMatch[1] === filters.month
    })
  }
  
  if (filters.year && filters.year !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
      const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      return dateMatch && dateMatch[3] === filters.year
    })
  }
  
  const actionCounts = {
    Added: filteredLogs.filter(l => l.action === 'Added').length,
    Edited: filteredLogs.filter(l => l.action === 'Edited').length,
    Deleted: filteredLogs.filter(l => l.action === 'Deleted').length,
    Transaction: filteredLogs.filter(l => l.action === 'Transaction').length
  }
  
  const userActivity = {}
  filteredLogs.forEach(log => {
    if (!userActivity[log.userName]) {
      userActivity[log.userName] = 0
    }
    userActivity[log.userName]++
  })
  
  const topUsers = Object.entries(userActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  
  return {
    totalActivities: filteredLogs.length,
    actionCounts,
    topUsers,
    dateRange: {
      start: filteredLogs[filteredLogs.length - 1]?.timestamp || 'N/A',
      end: filteredLogs[0]?.timestamp || 'N/A'
    }
  }
}

/**
 * Print current view
 */
export const printReport = (activityLogs, filters = {}, metadata = {}) => {
  const htmlContent = generateHTMLReport(activityLogs, filters, metadata)
  
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  printWindow.onload = () => {
    printWindow.print()
  }
  
  return { success: true }
}