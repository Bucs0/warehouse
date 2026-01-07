
// Email configuration and testing dialog for admins

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { isEmailConfigured, sendTestEmail } from '../lib/emailService'

export default function EmailSettingsDialog({ open, onOpenChange }) {
  const [testEmail, setTestEmail] = useState('markjadebucao10@gmail.com')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const configured = isEmailConfigured()

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter an email address to test')
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await sendTestEmail(testEmail)
      setTestResult(result)
      
      if (result.success) {
        alert(`✅ Test email sent successfully to ${testEmail}! Check your inbox.`)
      } else {
        alert(`❌ Failed to send test email: ${result.error}`)
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message })
      alert(`❌ Error sending test email: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Notification Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration Status */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Configuration Status</h4>
              <Badge variant={configured ? 'success' : 'warning'}>
                {configured ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
            
            {configured ? (
              <p className="text-sm text-muted-foreground">
                ✅ Email notifications are enabled. Automatic alerts will be sent for:
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                ⚠️ Email notifications are not configured yet. Please set up EmailJS in <code>src/lib/emailService.js</code>
              </p>
            )}

            {configured && (
              <ul className="mt-3 space-y-1 text-sm">
                <li>• Low stock alerts → Admin</li>
                <li>• Appointment confirmations → Suppliers</li>
              </ul>
            )}
          </div>

          {/* Setup Instructions */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold mb-2 text-blue-900">Setup Instructions</h4>
            <ol className="text-sm space-y-2 text-blue-800">
              <li>1. Create a free account at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">emailjs.com</a></li>
              <li>2. Add an email service (Gmail, Outlook, etc.)</li>
              <li>3. Create two email templates:
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• <strong>Low Stock Alert Template</strong> - Variables: item_name, current_quantity, reorder_level, location</li>
                  <li>• <strong>Appointment Template</strong> - Variables: supplier_name, appointment_date, appointment_time, items_list</li>
                </ul>
              </li>
              <li>4. Copy your Service ID, Template IDs, and Public Key to <code>src/lib/emailService.js</code></li>
              <li>5. Update ADMIN_EMAIL in <code>src/App.jsx</code></li>
            </ol>
          </div>

          {/* Test Email */}
          {configured && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Test Email Configuration</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Send test email to:</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="Enter email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleTestEmail}
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? 'Sending...' : 'Send Test Email'}
                </Button>
                
                {testResult && (
                  <div className={`p-3 rounded-lg text-sm ${
                    testResult.success 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {testResult.success 
                      ? '✅ Test email sent successfully!' 
                      : `❌ Failed: ${testResult.error}`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Templates Preview */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Email Templates Preview</h4>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">🔴 Low Stock Alert Email:</p>
                <p className="text-muted-foreground italic">
                  "Low Stock Alert: [Item Name] has reached {'{'}current_quantity{'}'} units, which is at or below the reorder level of {'{'}reorder_level{'}'} units. Location: {'{'}location{'}'}. Please restock soon."
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">📅 Appointment Confirmation Email:</p>
                <p className="text-muted-foreground italic">
                  "Hello {'{'}supplier_name{'}'},<br/>
                  Your restock appointment is confirmed for {'{'}appointment_date{'}'} at {'{'}appointment_time{'}'}.<br/>
                  Items to supply:<br/>
                  {'{'}items_list{'}'}<br/>
                  Thank you!"
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}