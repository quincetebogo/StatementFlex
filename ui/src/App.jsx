import { useState, useEffect } from 'react'
import axios from 'axios'
import AuthPanel from './components/AuthPanel'
import StatementsPanel from './components/StatementsPanel'
import AdminPanel from './components/AdminPanel'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '')
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('statements')

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token)
      const decoded = parseJwt(token)
      setUser(decoded)
    } else {
      localStorage.removeItem('jwt_token')
      setUser(null)
      setActiveTab('auth')
    }
  }, [token])

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (e) {
      return null
    }
  }

  const handleLogout = () => {
    setToken('')
    setUser(null)
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🏦 StatementFlex Testing UI</h1>
        <p>Complete testing suite for the financial statement management system</p>
      </div>

      {user && (
        <div className="user-info">
          <p><strong>Logged in as:</strong> {user.email}</p>
          <p><strong>Customer ID:</strong> {user.sub}</p>
          <p><strong>Account:</strong> {user.AccountNumber}</p>
          <button className="button button-secondary button-small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {!token ? (
        <AuthPanel onLogin={setToken} />
      ) : (
        <>
          <div className="tab-navigation">
            <button
              className={`tab ${activeTab === 'statements' ? 'active' : ''}`}
              onClick={() => setActiveTab('statements')}
            >
              📄 Statements
            </button>
            <button
              className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              ⚙️ Admin Tools
            </button>
          </div>

          {activeTab === 'statements' && (
            <StatementsPanel token={token} user={user} />
          )}

          {activeTab === 'admin' && (
            <AdminPanel token={token} user={user} />
          )}
        </>
      )}
    </div>
  )
}
