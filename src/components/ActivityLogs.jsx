

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Select } from './ui/select'
import ExportDialog from './ExportDialog'

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
]

export default function ActivityLogs({ activityLogs, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  // Get unique years from logs
  const availableYears = useMemo(() => {
    const years = new Set()
    activityLogs.forEach(log => {
      const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      if (dateMatch) {
        years.add(dateMatch[3])
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [activityLogs])

  // Filter logs
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = 
      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = filterAction === 'all' || log.action === filterAction

    let matchesDate = true
    if (selectedMonth !== 'all' || selectedYear !== 'all') {
      const dateMatch = log.timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      if (dateMatch) {
        const [, month, , year] = dateMatch
        
        if (selectedMonth !== 'all' && month !== selectedMonth) {
          matchesDate = false
        }
        if (selectedYear !== 'all' && year !== selectedYear) {
          matchesDate = false
        }
      }
    }

    return matchesSearch && matchesAction && matchesDate
  }).reverse()

  // Calculate statistics for filtered logs
  const actionCounts = {
    Added: filteredLogs.filter(l => l.action === 'Added').length,
    Edited: filteredLogs.filter(l => l.action === 'Edited').length,
    Deleted: filteredLogs.filter(l => l.action === 'Deleted').length,
    Transaction: filteredLogs.filter(l => l.action === 'Transaction').length
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterAction('all')
    setSelectedMonth('all')
    setSelectedYear('all')
  }

  // Get current filters for export
  const getCurrentFilters = () => ({
    action: filterAction,
    month: selectedMonth,
    year: selectedYear,
    searchTerm
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete history of all changes in the system
              </p>
            </div>
            
            {/* Export button*/}
            <Button 
              onClick={() => setIsExportDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </Button>
          </div>

          {/* Month and Year Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Month</label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">All Months</option>
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Year</label>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">Reset</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetFilters}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Search and action filter row */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by item name, user, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={filterAction === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('all')}
              >
                All ({activityLogs.length})
              </Button>
              <Button 
                variant={filterAction === 'Added' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('Added')}
              >
                Added ({actionCounts.Added})
              </Button>
              <Button 
                variant={filterAction === 'Edited' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('Edited')}
              >
                Edited ({actionCounts.Edited})
              </Button>
              <Button 
                variant={filterAction === 'Deleted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('Deleted')}
              >
                Deleted ({actionCounts.Deleted})
              </Button>
              <Button 
                variant={filterAction === 'Transaction' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('Transaction')}
              >
                Transactions ({actionCounts.Transaction})
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {(selectedMonth !== 'all' || selectedYear !== 'all') && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-900">
                Showing logs for: {' '}
                {selectedMonth !== 'all' && (
                  <strong>{MONTHS.find(m => m.value === selectedMonth)?.label}</strong>
                )}
                {selectedMonth !== 'all' && selectedYear !== 'all' && ' '}
                {selectedYear !== 'all' && (
                  <strong>{selectedYear}</strong>
                )}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Items Added</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{actionCounts.Added}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Items Edited</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{actionCounts.Edited}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Items Deleted</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">{actionCounts.Deleted}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Transactions</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{actionCounts.Transaction}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Logs table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterAction !== 'all' || selectedMonth !== 'all' || selectedYear !== 'all'
                        ? 'No logs found matching filters'
                        : 'No activity logs yet'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log, index) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {filteredLogs.length - index}
                      </TableCell>
                      <TableCell className="font-medium">{log.itemName}</TableCell>
                      <TableCell>
                        <Badge variant={
                          log.action === 'Added' ? 'success' :
                          log.action === 'Edited' ? 'default' :
                          log.action === 'Transaction' ? 'outline' :
                          'destructive'
                        }>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{log.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.userRole}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.details || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredLogs.length} of {activityLogs.length} logs
            </p>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        activityLogs={activityLogs}
        filters={getCurrentFilters()}
        currentUser={currentUser}
      />
    </div>
  )
}