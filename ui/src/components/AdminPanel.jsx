import { useState } from 'react'
import axios from 'axios'

export default function AdminPanel({ token }) {
  const [message, setMessage] = useState(null)
  const [testData, setTestData] = useState(null)
  const [loading, setLoading] = useState(false)

  const testTokenGeneration = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/statementflex/statement-list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.statements.length > 0) {
        const stmt = response.data.statements[0]
        setTestData({
          type: 'token-generation',
          data: {
            statementId: stmt.id,
            downloadToken: stmt.downloadToken,
            expiresIn: stmt.tokenExpiryMinutes,
            maxDownloads: stmt.maxDownloads
          }
        })
        setMessage({
          type: 'success',
          text: 'Token generation test successful!'
        })
      } else {
        setMessage({
          type: 'warning',
          text: 'No statements available for testing'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Token generation test failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const testAuthenticationHeader = () => {
    try {
      setLoading(true)
      const decoded = parseJwt(token)
      setTestData({
        type: 'jwt',
        data: decoded
      })
      setMessage({
        type: 'success',
        text: 'JWT token is valid and contains the following claims:'
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to decode JWT token'
      })
    } finally {
      setLoading(false)
    }
  }

  const parseJwt = (token) => {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: 'success', text: 'Copied to clipboard!' })
  }

  return (
    <div className="main-content">
      <div className="card">
        <h2>🔧 Testing Tools</h2>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="button button-primary"
            onClick={testAuthenticationHeader}
            disabled={loading}
          >
            {loading ? '⏳ Testing...' : '🔐 Test JWT Token'}
          </button>

          <button
            className="button button-primary"
            onClick={testTokenGeneration}
            disabled={loading}
          >
            {loading ? '⏳ Testing...' : '🎫 Test Token Generation'}
          </button>
        </div>

        {testData && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '10px' }}>📊 Test Results</h3>
            {testData.type === 'jwt' && (
              <div className="error-details">
                {JSON.stringify(testData.data, null, 2)}
              </div>
            )}
            {testData.type === 'token-generation' && (
              <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
                <p><strong>Statement ID:</strong> {testData.data.statementId}</p>
                <p><strong>Token:</strong></p>
                <div className="token-display">
                  {testData.data.downloadToken}
                </div>
                <p><strong>Expires in:</strong> {testData.data.expiresIn} minutes</p>
                <p><strong>Max Downloads:</strong> {testData.data.maxDownloads}</p>
                <button
                  className="button button-secondary button-small"
                  onClick={() => copyToClipboard(testData.data.downloadToken)}
                  style={{ marginTop: '10px' }}
                >
                  📋 Copy Token
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>📚 API Documentation</h2>

        <h3 style={{ marginTop: '15px', marginBottom: '10px' }}>Authentication</h3>
        <div className="error-details" style={{ backgroundColor: '#e3f2fd' }}>
          <pre>{`POST /api/auth/login
Authorization: None
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 1800
}`}</pre>
        </div>

        <h3 style={{ marginTop: '15px', marginBottom: '10px' }}>Get Statements</h3>
        <div className="error-details" style={{ backgroundColor: '#e8f5e9' }}>
          <pre>{`GET /api/statementflex/statement-list
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "statements": [
    {
      "id": "guid",
      "statementPeriod": "2026-06",
      "accountNumber": "1234567",
      "generatedDate": "2026-06-01T00:00:00",
      "downloadToken": "secure-token",
      "tokenExpiryMinutes": 60,
      "maxDownloads": 5
    }
  ]
}`}</pre>
        </div>

        <h3 style={{ marginTop: '15px', marginBottom: '10px' }}>Download Statement</h3>
        <div className="error-details" style={{ backgroundColor: '#fff3e0' }}>
          <pre>{`GET /api/statementflex/download/<DOWNLOAD_TOKEN>
Authorization: None (AllowAnonymous)

Response: PDF binary stream`}</pre>
        </div>

        <h3 style={{ marginTop: '15px', marginBottom: '10px' }}>Status Codes</h3>
        <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li><strong>200 OK</strong> - Request successful</li>
          <li><strong>400 Bad Request</strong> - Invalid input</li>
          <li><strong>401 Unauthorized</strong> - Invalid JWT token</li>
          <li><strong>403 Forbidden</strong> - Access denied or token revoked</li>
          <li><strong>404 Not Found</strong> - Resource not found</li>
          <li><strong>410 Gone</strong> - Token expired</li>
          <li><strong>429 Too Many Requests</strong> - Rate limit exceeded</li>
        </ul>
      </div>
    </div>
  )
}
