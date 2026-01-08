import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import TransactionDialog from './TransactionDialog'

export default function StockTransactions({ 
  user, 
  inventoryData, 
  transactionHistory, 
  onTransaction 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [itemSearchTerm, setItemSearchTerm] = useState('')
  const [itemCategoryFilter, setItemCategoryFilter] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  // Get unique dates from transaction history
  const uniqueDates = useMemo(() => {
    const dates = new Set()
    transactionHistory.forEach(transaction => {
      const dateStr = transaction.timestamp.split(' ')[0] // Extract date part
      dates.add(dateStr)
    })
    return Array.from(dates).sort((a, b) => new Date(b) - new Date(a)) // Sort newest first
  }, [transactionHistory])

  // Get unique months and years
  const availableMonthsYears = useMemo(() => {
    const months = new Set()
    const years = new Set()
    transactionHistory.forEach(transaction => {
      const dateStr = transaction.timestamp.split(' ')[0]
      const date = new Date(dateStr)
      if (!isNaN(date)) {
        months.add(date.getMonth()) // 0-11
        years.add(date.getFullYear())
      }
    })
    return {
      months: Array.from(months).sort((a, b) => a - b),
      years: Array.from(years).sort((a, b) => b - a) // Newest first
    }
  }, [transactionHistory])

  // Filter transactions (backend already returns newest first)
  const filteredTransactions = transactionHistory.filter(transaction => {
    const itemName = transaction.itemName || transaction.item_name || ''
    const userName = transaction.userName || transaction.user_name || ''
    
    const matchesSearch = 
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || transaction.transactionType === filterType || transaction.transaction_type === filterType

    // Date filtering
    const transactionDate = transaction.timestamp.split(' ')[0]
    const date = new Date(transactionDate)
    let matchesDate = true
    
    // Month and Year filter
    if (selectedMonth !== '' || selectedYear !== '') {
      if (selectedMonth !== '' && !isNaN(date)) {
        matchesDate = matchesDate && date.getMonth() === parseInt(selectedMonth)
      }
      if (selectedYear !== '' && !isNaN(date)) {
        matchesDate = matchesDate && date.getFullYear() === parseInt(selectedYear)
      }
    } else if (selectedDate) {
      matchesDate = transactionDate === selectedDate
    } else if (dateRange.start && dateRange.end) {
      matchesDate = transactionDate >= dateRange.start && transactionDate <= dateRange.end
    } else if (dateRange.start) {
      matchesDate = transactionDate >= dateRange.start
    } else if (dateRange.end) {
      matchesDate = transactionDate <= dateRange.end
    }

    return matchesSearch && matchesType && matchesDate
  })

  // Navigate to previous/next date
  const navigateDate = (direction) => {
    if (!selectedDate) {
      // If no date selected, select the most recent date
      if (uniqueDates.length > 0) {
        setSelectedDate(uniqueDates[0])
      }
      return
    }

    const currentIndex = uniqueDates.indexOf(selectedDate)
    if (currentIndex === -1) return

    if (direction === 'prev' && currentIndex < uniqueDates.length - 1) {
      setSelectedDate(uniqueDates[currentIndex + 1])
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedDate(uniqueDates[currentIndex - 1])
    }
  }

  const clearDateFilters = () => {
    setSelectedDate('')
    setDateRange({ start: '', end: '' })
    setSelectedMonth('')
    setSelectedYear('')
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Get unique categories from inventory items
  const itemCategories = useMemo(() => {
    const cats = new Set()
    inventoryData.forEach(item => {
      const category = item.category || item.categoryName || item.category_name
      if (category) cats.add(category)
    })
    return Array.from(cats).sort()
  }, [inventoryData])

  // Filter items for transaction
  const filteredItems = inventoryData.filter(item => {
    const itemName = item.itemName || item.item_name || ''
    const category = item.category || item.categoryName || item.category_name || ''
    const location = item.location || item.locationName || item.location_name || ''
    
    const matchesSearch = itemName.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
           category.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
           location.toLowerCase().includes(itemSearchTerm.toLowerCase())
    
    const matchesCategory = itemCategoryFilter === 'all' || category === itemCategoryFilter
    
    return matchesSearch && matchesCategory
  })

  const totalIn = transactionHistory.filter(t => (t.transactionType || t.transaction_type) === 'IN')
    .reduce((sum, t) => sum + t.quantity, 0)
  const totalOut = transactionHistory.filter(t => (t.transactionType || t.transaction_type) === 'OUT')
    .reduce((sum, t) => sum + t.quantity, 0)

  const handleOpenTransaction = (item) => {
    setSelectedItem(item)
    setIsTransactionDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Stock Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Record stock IN (restock) and OUT (usage/sales) transactions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total IN</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{totalIn}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total OUT</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{totalOut}</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Net Movement</p>
                <h3 className={`text-2xl sm:text-3xl font-bold mt-2 ${totalIn - totalOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalIn - totalOut >= 0 ? '+' : ''}{totalIn - totalOut}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Items for Transaction with Search */}
      <Card>
        <CardHeader>
          <CardTitle>Available Items for Transaction</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Search and click on an item to record a transaction
          </p>
          
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="search"
                placeholder="Search items by name, category, or location..."
                value={itemSearchTerm}
                onChange={(e) => setItemSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
              />
            </div>
            
            <select
              className="h-10 rounded-md border-2 border-blue-500 bg-blue-50 px-3 py-2 text-sm font-medium min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-100 transition-colors"
              value={itemCategoryFilter}
              onChange={(e) => setItemCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {itemCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items found</p>
              {itemSearchTerm && <p className="text-sm mt-1">Search: "{itemSearchTerm}"</p>}
              {itemCategoryFilter !== 'all' && <p className="text-sm mt-1">Category: {itemCategoryFilter}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const itemName = item.itemName || item.item_name
                const category = item.category || item.categoryName || item.category_name
                const location = item.location || item.locationName || item.location_name
                const reorderLevel = item.reorderLevel || item.reorder_level
                const supplier = item.supplier || item.supplierName || item.supplier_name
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenTransaction(item)}
                    className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{itemName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{category}</Badge>
                          {item.quantity <= reorderLevel && (
                            <Badge variant="warning" className="text-xs">Low Stock</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${item.quantity <= reorderLevel ? 'text-orange-600' : 'text-green-600'}`}>
                          {item.quantity}
                        </div>
                        <p className="text-xs text-muted-foreground">in stock</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {location}
                      </div>
                      {item.price > 0 && (
                        <div className="text-xs font-medium text-blue-600">
                          ₱{item.price.toLocaleString('en-PH')}
                        </div>
                      )}
                    </div>

                    {supplier && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Supplier: {supplier}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {filteredItems.length > 0 && itemSearchTerm && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredItems.length} of {inventoryData.length} items
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Transaction History</CardTitle>
            
            <div className="flex gap-2">
              <Button 
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button 
                variant={filterType === 'IN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('IN')}
              >
                IN
              </Button>
              <Button 
                variant={filterType === 'OUT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('OUT')}
              >
                OUT
              </Button>
            </div>
          </div>

          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              type="search"
              placeholder="Search transactions by item, user, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
            />
          </div>

          {/* Date Navigation */}
          <div className="mt-4 space-y-3">
            {/* Month and Year Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Filter by Month</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value)
                    setSelectedDate('')
                    setDateRange({ start: '', end: '' })
                  }}
                >
                  <option value="">All Months</option>
                  {availableMonthsYears.months.map(month => (
                    <option key={month} value={month}>{monthNames[month]}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Filter by Year</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value)
                    setSelectedDate('')
                    setDateRange({ start: '', end: '' })
                  }}
                >
                  <option value="">All Years</option>
                  {availableMonthsYears.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {(selectedMonth || selectedYear) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDateFilters}
                  className="h-9"
                >
                  Clear Dates
                </Button>
              )}
            </div>

            {/* Active Filter Display */}
            {(selectedMonth !== '' || selectedYear !== '') && (
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="text-muted-foreground">Showing:</span>
                <Badge variant="outline">
                  {selectedMonth !== '' && `${monthNames[parseInt(selectedMonth)]}`}
                  {selectedMonth !== '' && selectedYear !== '' && ' '}
                  {selectedYear !== '' && selectedYear}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Stock After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const transType = transaction.transactionType || transaction.transaction_type
                    const itemName = transaction.itemName || transaction.item_name
                    const userName = transaction.userName || transaction.user_name
                    const stockAfter = transaction.stockAfter || transaction.stock_after
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">{transaction.timestamp}</TableCell>
                        <TableCell className="font-medium">{itemName}</TableCell>
                        <TableCell>
                          <Badge variant={transType === 'IN' ? 'success' : 'destructive'}>
                            {transType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={transType === 'IN' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {transType === 'IN' ? '+' : '-'}{transaction.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{transaction.reason}</TableCell>
                        <TableCell className="text-sm">{userName}</TableCell>
                        <TableCell className="font-medium">{stockAfter}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const transType = transaction.transactionType || transaction.transaction_type
                const itemName = transaction.itemName || transaction.item_name
                const userName = transaction.userName || transaction.user_name
                const stockAfter = transaction.stockAfter || transaction.stock_after
                
                return (
                  <Card key={transaction.id} className="p-4">
                    <div className="space-y-3">
                      {/* Header with item and type */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{itemName}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{transaction.timestamp}</p>
                        </div>
                        <Badge variant={transType === 'IN' ? 'success' : 'destructive'}>
                          {transType}
                        </Badge>
                      </div>
                      
                      {/* Quantity and Stock Info */}
                      <div className="flex items-center justify-between py-2 border-y">
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className={`text-xl font-bold ${
                            transType === 'IN' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transType === 'IN' ? '+' : '-'}{transaction.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Stock After</p>
                          <p className="text-xl font-bold">{stockAfter}</p>
                        </div>
                      </div>
                      
                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Reason</p>
                          <p className="font-medium">{transaction.reason}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Processed by</p>
                          <p className="font-medium">{userName}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          {filteredTransactions.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredTransactions.length} of {transactionHistory.length} transactions
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      {selectedItem && (
        <TransactionDialog
          open={isTransactionDialogOpen}
          onOpenChange={setIsTransactionDialogOpen}
          item={selectedItem}
          user={user}
          onTransaction={onTransaction}
        />
      )}
    </div>
  )
}