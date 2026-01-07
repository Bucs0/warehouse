

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { 
  downloadCSV, 
  downloadPDF, 
  downloadExcel,
  generateSummaryReport 
} from '../lib/reportGenerator'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ExportDialog({ open, onOpenChange, activityLogs, filters, currentUser }) {
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)

  // Calculate filtered logs count
  const getFilteredCount = () => {
    let filtered = [...activityLogs]
    
    if (filters.action && filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action)
    }
    
    if (filters.month && filters.month !== 'all') {
      filtered = filtered.filter(log => {
        const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
        return dateMatch && dateMatch[1] === filters.month
      })
    }
    
    if (filters.year && filters.year !== 'all') {
      filtered = filtered.filter(log => {
        const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
        return dateMatch && dateMatch[3] === filters.year
      })
    }
    
    return filtered.length
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportStatus(null)

    try {
      const metadata = {
        generatedBy: currentUser?.name || 'Unknown User',
        generatedDate: new Date().toLocaleString('en-PH')
      }

      let result

      switch (selectedFormat) {
        case 'csv':
          result = downloadCSV(activityLogs, filters, 'activity_logs_report')
          break
        case 'pdf':
          result = downloadPDF(activityLogs, filters, metadata, 'activity_logs_report')
          break
        case 'excel':
          result = downloadExcel(activityLogs, filters, 'activity_logs_report')
          break
        default:
          throw new Error('Invalid format selected')
      }

      if (result.success) {
        setExportStatus({
          type: 'success',
          message: `Successfully exported ${result.filename}`
        })
        
        // Auto close after 2 seconds on success
        setTimeout(() => {
          onOpenChange(false)
          setExportStatus(null)
        }, 2000)
      } else {
        setExportStatus({
          type: 'error',
          message: 'Export failed. Please try again.'
        })
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({
        type: 'error',
        message: `Export failed: ${error.message}`
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getFilterDescription = () => {
    const parts = []
    
    if (filters.action && filters.action !== 'all') {
      parts.push(`Action: ${filters.action}`)
    }
    
    if (filters.month && filters.month !== 'all') {
      const monthName = MONTH_NAMES[parseInt(filters.month) - 1]
      parts.push(monthName)
    }
    
    if (filters.year && filters.year !== 'all') {
      parts.push(filters.year)
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'No filters applied'
  }

  const summary = generateSummaryReport(activityLogs, filters)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Activity Logs Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Summary */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-3">Report Summary</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{getFilteredCount()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{activityLogs.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-xs text-green-600">Added</p>
                <p className="font-bold text-green-700">{summary.actionCounts.Added}</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-600">Edited</p>
                <p className="font-bold text-blue-700">{summary.actionCounts.Edited}</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <p className="text-xs text-red-600">Deleted</p>
                <p className="font-bold text-red-700">{summary.actionCounts.Deleted}</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <p className="text-xs text-purple-600">Transactions</p>
                <p className="font-bold text-purple-700">{summary.actionCounts.Transaction}</p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-1">
                <strong>Filters Applied:</strong>
              </p>
              <p className="text-sm">{getFilterDescription()}</p>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Select Export Format</Label>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat('csv')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedFormat === 'csv'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold">CSV</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comma-separated values, compatible with Excel and Google Sheets
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('pdf')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedFormat === 'pdf'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">PDF</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Professional formatted report with statistics (print dialog)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('excel')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedFormat === 'excel'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Excel</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Excel format (.xls) for Microsoft Excel
                </p>
              </button>
            </div>
          </div>

          {/* Export Status */}
          {exportStatus && (
            <div className={`p-4 rounded-lg border ${
              exportStatus.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {exportStatus.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-medium">{exportStatus.message}</span>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Export Information</p>
                <ul className="space-y-1 text-xs">
                  <li>• CSV files can be opened in Excel, Google Sheets, or any text editor</li>
                  <li>• PDF format includes statistics and professional formatting</li>
                  <li>• Excel format is optimized for Microsoft Excel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}