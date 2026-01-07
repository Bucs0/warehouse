
// Stock Transaction with search bar and better item identification

import { useState } from 'react'
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
  const [itemSearchTerm, setItemSearchTerm] = useState('') // NEW: Search for items
  const [filterType, setFilterType] = useState('all')
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Filter transactions
  const filteredTransactions = transactionHistory.filter(transaction => {
    const matchesSearch = 
      transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || transaction.transactionType === filterType

    return matchesSearch && matchesType
  }).reverse()

  // NEW: Filter items for transaction
  const filteredItems = inventoryData.filter(item =>
    item.itemName.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(itemSearchTerm.toLowerCase())
  )

  const totalIn = transactionHistory.filter(t => t.transactionType === 'IN')
    .reduce((sum, t) => sum + t.quantity, 0)
  const totalOut = transactionHistory.filter(t => t.transactionType === 'OUT')
    .reduce((sum, t) => sum + t.quantity, 0)

  const handleOpenTransaction = (item) => {
    setSelectedItem(item)
    setIsTransactionDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Stock Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Record stock IN (restock) and OUT (usage/sales) transactions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total IN</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{totalIn}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Total OUT</p>
                <h3 className="text-3xl font-bold text-red-600 mt-2">{totalOut}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Net Movement</p>
                <h3 className={`text-3xl font-bold mt-2 ${totalIn - totalOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
          
          {/* NEW: Search bar for items */}
          <div className="mt-4">
            <Input
              type="search"
              placeholder="🔍 Search items by name, category, or location..."
              value={itemSearchTerm}
              onChange={(e) => setItemSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items found matching "{itemSearchTerm}"
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenTransaction(item)}
                  className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{item.itemName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        {item.quantity <= item.reorderLevel && (
                          <Badge variant="warning" className="text-xs">Low Stock</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${item.quantity <= item.reorderLevel ? 'text-orange-600' : 'text-green-600'}`}>
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
                      {item.location}
                    </div>
                    {item.price > 0 && (
                      <div className="text-xs font-medium text-blue-600">
                        ₱{item.price.toLocaleString('en-PH')}
                      </div>
                    )}
                  </div>

                  {item.supplier && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Supplier: {item.supplier}
                    </div>
                  )}
                </div>
              ))}
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

          {/* Search for transactions */}
          <div className="mt-4">
            <Input
              type="search"
              placeholder="Search transactions by item, user, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
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
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">{transaction.timestamp}</TableCell>
                      <TableCell className="font-medium">{transaction.itemName}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.transactionType === 'IN' ? 'success' : 'destructive'}>
                          {transaction.transactionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.transactionType === 'IN' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {transaction.transactionType === 'IN' ? '+' : '-'}{transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{transaction.reason}</TableCell>
                      <TableCell className="text-sm">{transaction.userName}</TableCell>
                      <TableCell className="font-medium">{transaction.stockAfter}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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