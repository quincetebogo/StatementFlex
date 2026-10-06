# 🔒 Statement Download Security Implementation

## Overview
This document describes the comprehensive security measures implemented for statement downloads in StatementFlex.

## Security Features

### 1. **One-Time Download Tokens**
- Each statement list request generates unique, cryptographically secure download tokens
- Tokens are 32-byte random values encoded in Base64URL
- Tokens are stored separately from the actual file storage keys
- Default configuration: 1 download per token, 15-minute expiration

### 2. **Token Validation**
Download tokens are validated against multiple criteria:
- ✅ **Token Exists**: Must be a valid token in the database
- ✅ **Not Expired**: Checked against `ExpiresAt` timestamp
- ✅ **Not Revoked**: Admin can manually revoke tokens
- ✅ **Download Limit**: Enforces maximum download count (default: 1)
- ✅ **IP Validation** (Optional): Can lock token to specific IP address
- ✅ **Statement Not Archived**: Archived statements cannot be downloaded

### 3. **Audit Logging**
Every download attempt is logged with:
- Statement ID
- Customer ID
- Download token used
- IP address
- User agent
- Timestamp
- Success/failure status
- Failure reason (if applicable)

### 4. **Separation of Concerns**
- **Storage Key**: Internal MinIO path (`statement/2026/06/{guid}/{accountNumber}`)
- **Download Token**: Public-facing token (random 43-character string)
- Users never see the actual storage keys

### 5. **Anonymous Download with Security**
- Download endpoint is `[AllowAnonymous]` for convenience
- Security enforced through token validation, not authentication
- Allows sharing download links without exposing account credentials

## Configuration Options

### Token Expiration
```csharp
// Default: 15 minutes
await _downloadTokenService.GenerateDownloadTokenAsync(
    statementId,
    customerId,
    ipAddress,
    enableIpValidation: false,
    expirationMinutes: 15  // ← Change this
);
```

### IP Validation
```csharp
// Enable IP lock (stricter security)
enableIpValidation: true

// Disable IP lock (more convenient, still secure)
enableIpValidation: false  // ← Current default
```

### Download Limits
```csharp
// In DownloadToken entity
MaxDownloads = 1  // ← One-time use (default)
MaxDownloads = 3  // ← Allow 3 downloads
```

## Database Schema

### DownloadTokens Table
```sql
- Id (Guid, PK)
- StatementId (Guid, FK)
- Token (string, unique index)
- CreatedAt (DateTime)
- ExpiresAt (DateTime)
- MaxDownloads (int, default: 1)
- DownloadCount (int, default: 0)
- IsRevoked (bool, default: false)
- IpAddress (string, nullable)
- IpValidationEnabled (bool, default: false)
```

### StatementDownloadLogs Table
```sql
- Id (Guid, PK)
- StatementId (Guid, indexed)
- CustomerId (Guid, indexed)
- DownloadToken (string)
- DownloadedAt (DateTime, indexed)
- IpAddress (string)
- UserAgent (string)
- Success (bool)
- FailureReason (string, nullable)
```

## API Endpoints

### Get Statement List (Authenticated)
```
GET /api/StatementFlex/statement-list
Authorization: Bearer {JWT}
```

**Response:**
```json
{
  "accountNumber": "10000000001",
  "downloadLinks": [
    {
      "downloadLink": "http://localhost:5006/api/StatementFlex/download/{SECURE_TOKEN}",
      "expiresIn": "2026-07-31T00:00:00Z",
      "dateCreated": "2026-06-24T10:00:00Z",
      "statementPeriod": "2026-05-01T00:00:00Z"
    }
  ]
}
```

### Download Statement (Anonymous)
```
GET /api/StatementFlex/download/{downloadToken}
```

**Responses:**
- **200 OK**: File download
- **403 Forbidden**: Revoked token or IP mismatch
- **404 Not Found**: Invalid token
- **410 Gone**: Expired token
- **429 Too Many Requests**: Download limit exceeded

## Security Best Practices

### ✅ What We Do
1. Generate unique tokens per request
2. Expire tokens after 15 minutes
3. Limit to 1 download per token
4. Log all attempts (success & failure)
5. Separate storage keys from download tokens
6. Validate archived statement status
7. Return appropriate HTTP status codes

### ⚠️ What You Can Enable
1. **IP Validation**: Set `enableIpValidation: true`
2. **Rate Limiting**: Add rate limiting middleware (see below)
3. **HTTPS Only**: Enforce HTTPS in production
4. **CORS**: Restrict CORS in production

### 🔧 Recommended Additions

#### 1. Rate Limiting (Production)
```csharp
// Install: dotnet add package AspNetCoreRateLimit
builder.Services.AddMemoryCache();
builder.Services.AddInMemoryRateLimiting();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
```

#### 2. HTTPS Enforcement
```csharp
// In Program.cs
app.UseHttpsRedirection();
app.UseHsts();
```

#### 3. CORS (Production)
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", builder =>
        builder.WithOrigins("https://yourdomain.com")
               .AllowAnyMethod()
               .AllowAnyHeader());
});
```

## Monitoring & Alerts

### Suspicious Activity Indicators
Query `StatementDownloadLogs` for:
```sql
-- Multiple failed attempts from same IP
SELECT IpAddress, COUNT(*) as FailedAttempts
FROM StatementDownloadLogs
WHERE Success = false 
  AND DownloadedAt > NOW() - INTERVAL '1 hour'
GROUP BY IpAddress
HAVING COUNT(*) > 10;

-- Downloads from unusual locations
SELECT CustomerId, IpAddress, COUNT(*) as Downloads
FROM StatementDownloadLogs
WHERE Success = true
GROUP BY CustomerId, IpAddress;
```

## Migration Steps

### To Enable Full Security:
1. **Drop & recreate database** (development):
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. **Restart application** - new tables will be created automatically

3. **(Optional) Enable IP validation** in `ProduceStatements.cs`:
   ```csharp
   enableIpValidation: true  // Line 33
   ```

## Compliance Notes

### GDPR/POPIA Considerations
- ✅ Download logs contain user activity (notify in privacy policy)
- ✅ Logs can be deleted with customer account deletion
- ✅ IP addresses are logged (justify as security measure)
- ✅ Short token expiration limits data exposure

### Financial Regulations
- ✅ Audit trail of all downloads
- ✅ Cannot guess or enumerate statements
- ✅ Each download is traceable to customer
- ✅ Expired statements cannot be accessed

## Testing

### Test Scenarios
1. ✅ Valid token → Download succeeds
2. ✅ Expired token → 410 Gone
3. ✅ Used token (2nd download) → 429 Too Many Requests
4. ✅ Revoked token → 403 Forbidden
5. ✅ Invalid token → 404 Not Found
6. ✅ IP mismatch (if enabled) → 403 Forbidden
7. ✅ Archived statement → 404 Not Found

---

**Implementation Date**: June 24, 2026  
**Security Level**: ⭐⭐⭐⭐ (4/5 stars)  
**Recommended for Production**: ✅ Yes (with HTTPS + Rate Limiting)
