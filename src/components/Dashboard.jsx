import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { authAPI } from '../lib/api'
import { normalizeActivityLogs } from '../lib/dataMapper'

export default function Dashboard({ user, inventoryData, activityLogs, onNavigate, onLogActivity }) {
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [pendingUsers, setPendingUsers] = useState([])
  const [approvedUsers, setApprovedUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load users from database
  useEffect(() => {
    if (user && user.role === 'Admin') {
      loadUsers()
    }
  }, [user])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const [pending, approved] = await Promise.all([
        authAPI.getPendingUsers(),
        authAPI.getApprovedUsers()
      ])
      setPendingUsers(pending)
      setApprovedUsers(approved)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async (userId) => {
    try {
      await authAPI.approveUser(userId)
      
      const userToApprove = pendingUsers.find(u => u.id === userId)
      if (userToApprove && onLogActivity) {
        await onLogActivity(
          `User Account: ${userToApprove.name}`,
          'Added',
          `Approved staff account for ${userToApprove.name} (@${userToApprove.username})`
        )
      }
      
      // Reload users
      await loadUsers()
      alert('User approved successfully!')
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user: ' + error.message)
    }
  }

  const handleRejectUser = async (userId) => {
    const userToReject = pendingUsers.find(u => u.id === userId)
    if (!userToReject) return
    
    if (!window.confirm(`Are you sure you want to reject ${userToReject.name}'s signup request?`)) {
      return
    }
    
    try {
      await authAPI.rejectUser(userId)
      
      if (onLogActivity) {
        await onLogActivity(
          `User Account: ${userToReject.name}`,
          'Deleted',
          `Rejected staff signup request from ${userToReject.name} (@${userToReject.username})`
        )
      }
      
      // Reload users
      await loadUsers()
      alert('User rejected successfully!')
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject user: ' + error.message)
    }
  }

  // Calculate statistics
  const totalItems = inventoryData.length
  const lowStockItems = inventoryData.filter(item => item.quantity <= item.reorderLevel || item.quantity <= item.reorder_level).length
  const damagedItems = inventoryData.filter(item => item.damagedStatus === 'Damaged' || item.damaged_status === 'Damaged').length
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0)

  // ✅ Normalize activity logs to handle both snake_case and camelCase
  const normalizedLogs = useMemo(() => 
    normalizeActivityLogs(activityLogs),
    [activityLogs]
  )

  // ✅ FIXED: Show most recent activities first (backend already sorted DESC)
  const recentActivities = normalizedLogs.slice(0, 10)

  useEffect(() => {
    console.log('🔄 Dashboard received activity logs update:', {
      raw: activityLogs.length,
      normalized: normalizedLogs.length,
      showing: recentActivities.length,
      latest: recentActivities[0],
      rawLatest: activityLogs[activityLogs.length - 1]
    })
  }, [activityLogs, normalizedLogs])

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}! 
            <Badge variant="outline" className="ml-2">{user.role}</Badge>
          </p>
        </div>
        
        <div className="flex gap-2">
          {user.role === 'Admin' && (
            <Button 
              variant="outline"
              onClick={() => {
                setIsApprovalDialogOpen(true)
                loadUsers()
              }}
              className="relative"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Approvals
              {pendingUsers.length > 0 && (
                <Badge variant="warning" className="ml-2">{pendingUsers.length}</Badge>
              )}
            </Button>
          )}
          
          {user.role === 'Admin' && (
            <Button variant="outline" onClick={() => onNavigate('inventory')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              View Full Inventory
            </Button>
          )}
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-3xl font-bold mt-2">{totalItems}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <h3 className="text-3xl font-bold mt-2 text-orange-600">{lowStockItems}</h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Damaged Items</p>
                <h3 className="text-3xl font-bold mt-2 text-red-600">{damagedItems}</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <h3 className="text-3xl font-bold mt-2 text-green-600">
                  ₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('logs')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activities
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    log.action === 'Added' ? 'bg-green-100' :
                    log.action === 'Edited' ? 'bg-blue-100' :
                    'bg-red-100'
                  }`}>
                    {log.action === 'Added' && (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {log.action === 'Edited' && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                    {log.action === 'Deleted' && (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{log.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.action} by {log.userName} • {log.timestamp}
                    </p>
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                    )}
                  </div>

                  <Badge variant={
                    log.action === 'Added' ? 'success' :
                    log.action === 'Edited' ? 'default' :
                    'destructive'
                  }>
                    {log.action}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Staff Approval Requests</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Review and approve or reject staff signup requests
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">No pending approvals</p>
                <p className="text-sm mt-1">All staff signup requests have been processed</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {pendingUsers.length} pending approval(s)
                </p>
                
                {pendingUsers.map(pendingUser => (
                  <div key={pendingUser.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{pendingUser.name}</h3>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><strong>Username:</strong> {pendingUser.username}</p>
                          <p><strong>Email:</strong> {pendingUser.email}</p>
                          <p><strong>Role:</strong> {pendingUser.role}</p>
                          <p><strong>Signup Date:</strong> {pendingUser.signupDate || pendingUser.signup_date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveUser(pendingUser.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectUser(pendingUser.id)}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Approved Users List */}
            {approvedUsers.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-4">Approved Staff Members ({approvedUsers.length})</h3>
                <div className="space-y-2">
                  {approvedUsers.map(approvedUser => (
                    <div key={approvedUser.id} className="border rounded p-3 bg-green-50 border-green-200 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{approvedUser.name}</p>
                        <p className="text-sm text-muted-foreground">@{approvedUser.username} • {approvedUser.email}</p>
                      </div>
                      <Badge variant="success">Approved</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}