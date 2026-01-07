

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

// Admin account (hardcoded)
const ADMIN_ACCOUNT = {
  id: 'admin-1',
  username: 'admin',
  email: 'markjadebucao10@gmail.com',
  password: 'q110978123',
  role: 'Admin',
  name: 'Mark Jade Bucao',
  status: 'approved'
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [loginData, setLoginData] = useState({ usernameOrEmail: '', password: '' })
  const [signupData, setSignupData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    name: '' 
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [approvedUsers, setApprovedUsers] = useState([])

  // ✅ FIXED: Load approved users from localStorage
  useEffect(() => {
    const savedApproved = localStorage.getItem('approvedUsers')
    if (savedApproved) {
      setApprovedUsers(JSON.parse(savedApproved))
    }
  }, [])

  // ✅ FIXED: Poll for changes every 2 seconds to detect approvals
  useEffect(() => {
    const interval = setInterval(() => {
      const savedApproved = localStorage.getItem('approvedUsers')
      if (savedApproved) {
        setApprovedUsers(JSON.parse(savedApproved))
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const input = loginData.usernameOrEmail.toLowerCase().trim()

      // Check admin account (username or email)
      if ((input === ADMIN_ACCOUNT.username || input === ADMIN_ACCOUNT.email.toLowerCase()) 
          && loginData.password === ADMIN_ACCOUNT.password) {
        onLogin(ADMIN_ACCOUNT)
        return
      }

      // ✅ FIXED: Check approved staff users from localStorage
      const savedApproved = localStorage.getItem('approvedUsers')
      const currentApprovedUsers = savedApproved ? JSON.parse(savedApproved) : []
      
      const user = currentApprovedUsers.find(u => 
        (u.username.toLowerCase() === input || u.email.toLowerCase() === input) 
        && u.password === loginData.password
      )
      
      if (user) {
        onLogin(user)
        return
      }

      // ✅ FIXED: Check if user is still pending
      const savedPending = localStorage.getItem('pendingUsers')
      const pendingUsers = savedPending ? JSON.parse(savedPending) : []
      
      const pendingUser = pendingUsers.find(u => 
        u.username.toLowerCase() === input || u.email.toLowerCase() === input
      )
      
      if (pendingUser) {
        setError('Your account is pending admin approval. Please wait for approval.')
      } else {
        setError('Invalid username/email or password')
      }
      setIsLoading(false)
    }, 500)
  }

  const handleSignup = () => {
    setError('')

    if (!signupData.username || !signupData.email || !signupData.password || !signupData.name) {
      setError('Please fill in all fields')
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!signupData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    // Check if username already exists
    const savedApproved = localStorage.getItem('approvedUsers')
    const savedPending = localStorage.getItem('pendingUsers')
    const currentApprovedUsers = savedApproved ? JSON.parse(savedApproved) : []
    const currentPendingUsers = savedPending ? JSON.parse(savedPending) : []

    const usernameExists = currentApprovedUsers.some(u => u.username === signupData.username) ||
                          currentPendingUsers.some(u => u.username === signupData.username) ||
                          signupData.username === ADMIN_ACCOUNT.username

    if (usernameExists) {
      setError('Username already exists')
      return
    }

    // Check if email already exists
    const emailExists = currentApprovedUsers.some(u => u.email === signupData.email) ||
                       currentPendingUsers.some(u => u.email === signupData.email) ||
                       signupData.email === ADMIN_ACCOUNT.email

    if (emailExists) {
      setError('Email already registered')
      return
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      name: signupData.name,
      role: 'Staff',
      status: 'pending',
      signupDate: new Date().toLocaleDateString('en-PH')
    }

    // Add to pending users
    const updatedPending = [...currentPendingUsers, newUser]
    localStorage.setItem('pendingUsers', JSON.stringify(updatedPending))
    
    setMode('pendingApproval')
    setSignupData({ username: '', email: '', password: '', confirmPassword: '', name: '' })
  }

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  // Pending Approval View
  if (mode === 'pendingApproval') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle>Account Pending Approval</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Your account has been created successfully!
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm">
                Please wait for the admin to approve your account. You will be able to login once your account is approved.
              </p>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode('login')}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Signup View
  if (mode === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-center">Staff Sign Up</CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Create your staff account
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleSignup)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Button onClick={handleSignup} className="w-full">
                Sign Up
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Already have an account? Login
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login View
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-center">Warehouse Inventory System</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Login to access the system
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Username or Email</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter username or email"
                value={loginData.usernameOrEmail}
                onChange={(e) => setLoginData({ ...loginData, usernameOrEmail: e.target.value })}
                disabled={isLoading}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                disabled={isLoading}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setMode('signup')
                setError('')
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Sign Up as Staff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}