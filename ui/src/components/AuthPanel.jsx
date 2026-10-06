import { useState } from 'react'
import axios from 'axios'

export default function AuthPanel({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        // Login flow
        const response = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        })

        if (response.data.token) {
          setMessage({ type: 'success', text: 'Login successful!' })
          setTimeout(() => {
            onLogin(response.data.token)
          }, 800)
        }
      } else {
        // Registration flow
        const registerResponse = await axios.post('/api/auth/register', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password
        })

        // Show registration success with account number
        setMessage({
          type: 'success',
          text: `✅ Registration successful! Account: ${registerResponse.data.accountNumber}. Auto-logging in...`
        })

        // Auto-login with the credentials they just registered with
        setTimeout(async () => {
          try {
            const loginResponse = await axios.post('/api/auth/login', {
              email: formData.email,
              password: formData.password
            })
            if (loginResponse.data.token) {
              onLogin(loginResponse.data.token)
            }
          } catch (loginError) {
            setMessage({
              type: 'warning',
              text: `Registration successful! Account: ${registerResponse.data.accountNumber}. Please login manually.`
            })
            setIsLogin(true)
            setFormData({
              ...formData,
              firstName: '',
              lastName: '',
              phoneNumber: ''
            })
          }
        }, 1000)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0]?.errorMessage ||
                      error.response?.data?.message ||
                      error.message
      setMessage({ type: 'error', text: errorMsg || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <div className="card">
        <h2>{isLogin ? '🔐 Login' : '📝 Register'}</h2>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="+27 XX XXX XXXX"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading"></span> Processing...
              </>
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button
            className="button button-secondary button-small"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2>📋 Test Credentials</h2>
        <p style={{ marginBottom: '15px' }}>
          Use these test credentials to quickly login and test the application:
        </p>

        <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #4caf50' }}>
          <h4 style={{ marginTop: 0, color: '#2e7d32' }}>✅ Registration Flow</h4>
          <ol style={{ marginLeft: '20px', lineHeight: '1.6', marginBottom: 0 }}>
            <li>Fill in your details</li>
            <li>Click "Register"</li>
            <li>System auto-generates your <strong>Account Number</strong></li>
            <li>You'll be automatically logged in</li>
            <li>Your account number is shown in the success message</li>
          </ol>
        </div>

        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0 }}>📋 Required Fields</h4>
          <ul style={{ marginLeft: '20px', lineHeight: '1.6', marginBottom: 0 }}>
            <li><strong>First Name:</strong> Your first name</li>
            <li><strong>Last Name:</strong> Your last name</li>
            <li><strong>Phone Number:</strong> Format: +27XXXXXXXXX (South African)</li>
            <li><strong>Email:</strong> Valid email (user@example.com)</li>
            <li><strong>Password:</strong> 8+ chars, uppercase, lowercase, number, special (!@#$%^&*)</li>
          </ul>
        </div>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>💡 Testing Tips</h3>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Register with any valid email and strong password</li>
          <li>Password must contain: uppercase, lowercase, number, and special character (!@#$%^&*)</li>
          <li>Example valid password: <code>SecurePass123!</code></li>
          <li>After login, navigate to Statements tab to view available documents</li>
          <li>Use phone number format: +27XXXXXXXXX (South African)</li>
        </ul>
      </div>
    </div>
  )
}
