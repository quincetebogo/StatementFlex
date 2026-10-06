# 🧪 StatementFlex - Complete Testing Guide

A comprehensive guide for running and testing both the backend API and the React testing UI.

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Testing Workflows](#testing-workflows)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

**TL;DR** - Run these 3 commands in separate terminals:

```bash
# Terminal 1: Start infrastructure (PostgreSQL + MinIO)
docker-compose up

# Terminal 2: Run backend API
cd src/StatementFlex/StatementFlex.API
dotnet run

# Terminal 3: Run frontend
cd ui
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## 🔧 Backend Setup

### Prerequisites
- .NET 9 SDK or later
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- MinIO (or use Docker)

### Step 1: Start Infrastructure

The project includes a `docker-compose.yml` that sets up PostgreSQL and MinIO:

```bash
cd /Users/QuinceNgomane/StatementFlex
docker-compose up
```

This starts:
- **PostgreSQL** on `localhost:58344` (DB: `statementflex`, User: `myuser`, Pass: `mypass`)
- **MinIO** on `localhost:9002` (Console: `localhost:9001`, User: `minioadmin`, Pass: `minioadmin`)

**Check containers are healthy:**
```bash
docker ps
```

You should see both containers running:
- `statementflex-postgres` (healthy)
- `statementflex-minio` (healthy)

### Step 2: Apply Database Migrations

The database migrations are handled by EF Core on first run. When you start the API, it will:
1. Migrate the ApplicationDBContext
2. Migrate the TransactionDBContext
3. Seed test data (optional)

### Step 3: Run the Backend API

```bash
cd /Users/QuinceNgomane/StatementFlex/src/StatementFlex/StatementFlex.API
dotnet run
```

**Expected output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5006
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to stop.
```

**API is ready when:**
- ✅ Server is listening on `http://localhost:5006`
- ✅ Swagger UI available at `http://localhost:5006/openapi-ui`
- ✅ Health check passes

**Verify API is running:**
```bash
curl http://localhost:5006/health
```

### Backend Configuration

Key settings in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "ApplicationDB": "Host=localhost;Port=58344;Database=statementflex;Username=myuser;Password=mypass",
    "TransactionDB": "Host=localhost;Port=58344;Database=statementflex_transactions;Username=myuser;Password=mypass"
  },
  "MinIO": {
    "Endpoint": "localhost:9002",
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin",
    "BucketName": "statements",
    "UseSSL": false
  },
  "Jwt": {
    "Secret": "your-super-secret-key-minimum-32-characters",
    "ExpirationMinutes": 30
  }
}
```

---

## 🎨 Frontend Setup

### Prerequisites
- Node.js 18+ with npm

### Step 1: Install Dependencies

```bash
cd /Users/QuinceNgomane/StatementFlex/ui
npm install
```

This installs:
- React 18.2
- Vite (bundler)
- Axios (HTTP client)

### Step 2: Configure API Endpoint

The frontend is configured to proxy requests to the backend via `vite.config.js`:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5006',
      changeOrigin: true
    }
  }
}
```

All requests to `/api/*` are forwarded to `http://localhost:5006/api/*`

### Step 3: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

**Access UI:**
- Open http://localhost:3000 in your browser
- You should see the StatementFlex testing UI

---

## 🧪 Testing Workflows

### Workflow 1: Complete User Journey (Registration → Download)

#### Step 1: Register a New Account

1. Open http://localhost:3000
2. Click "Need an account? Register"
3. Fill in the form:
   - **Name:** John Doe
   - **Email:** john@example.com
   - **Account Number:** 1234567890
   - **Password:** SecurePass123!
4. Click "Register"

**Expected result:** Auto-login, see "Logged in as john@example.com"

#### Step 2: Generate Test Statements

The backend includes a Hangfire job that generates statements. To manually trigger:

```bash
# Option 1: Via Hangfire Dashboard
# Open http://localhost:5006/hangfire
# Find "GenerateAndStoreStatements" recurring job
# Click "Trigger job now"

# Option 2: Via API (using curl)
curl -X POST http://localhost:5006/api/admin/generate-statements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Or insert test data directly:
```bash
# Load seed data
cd /Users/QuinceNgomane/StatementFlex
psql -h localhost -p 58344 -U myuser -d statementflex -f seed_data.sql
```

#### Step 3: View Available Statements

1. In the UI, you should now be in the **"Statements"** tab
2. Click **"🔄 Refresh"** button
3. You should see a list of statements with columns:
   - Period
   - Account Number
   - Generated Date

#### Step 4: Request Download Token

1. For any statement, click **"🔐 Get Token"**
2. A cryptographic token appears in the UI
3. Token is valid for 1 hour, allows 5 downloads

#### Step 5: Download Statement

1. With the token displayed, click **"⬇️ Download"**
2. PDF file downloads automatically
3. File is named: `statement_{YYYYMMDD}.pdf`
4. Success message appears in UI

**Verify download was logged:**
```bash
# Check audit trail
psql -h localhost -p 58344 -U myuser -d statementflex -c \
  "SELECT * FROM StatementDownloadLogs ORDER BY CreatedAt DESC LIMIT 5;"
```

### Workflow 2: Security Testing

#### Test 1: JWT Token Validation

1. Login with your account
2. Go to **"Admin Tools"** tab
3. Click **"🔐 Test JWT Token"**
4. You'll see the decoded JWT claims:

```json
{
  "sub": "customer-id-guid",
  "email": "user@example.com",
  "AccountNumber": "1234567890",
  "iat": 1719840000,
  "exp": 1719841800
}
```

**What to verify:**
- ✅ `sub` (subject) = your CustomerId
- ✅ `email` = your registered email
- ✅ `AccountNumber` = matches your account
- ✅ `exp` = current time + 30 minutes

#### Test 2: Rate Limiting

The API enforces rate limiting: **60 requests per minute** per IP

Test rate limiting:
```bash
# Make multiple rapid requests
for i in {1..65}; do
  curl -s -X GET http://localhost:5006/api/statementflex/statement-list \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    | jq '.message' || echo "Request $i: Rate limited"
  sleep 0.1
done
```

**Expected:** After ~60 requests, you'll see "429 Too Many Requests"

#### Test 3: Unauthorized Access

Try accessing protected endpoints without JWT:

```bash
# Should return 401 Unauthorized
curl -X GET http://localhost:5006/api/statementflex/statement-list
```

**Expected response:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.3.2",
  "title": "Unauthorized",
  "status": 401
}
```

#### Test 4: Token Expiration

1. Get a download token
2. In your browser console, wait 1 hour (or modify token in DB to expire)
3. Try to download with expired token
4. Should receive 410 Gone error

#### Test 5: IP Validation (If Enabled)

The system can optionally validate IP addresses for downloads:

```sql
-- In PostgreSQL, check download logs
SELECT Token, IpAddress, IsSuccessful, Reason
FROM StatementDownloadLogs
ORDER BY CreatedAt DESC
LIMIT 10;
```

### Workflow 3: Admin Testing

In the **"Admin Tools"** tab:

#### Test Token Generation
1. Click **"🎫 Test Token Generation"**
2. Verify response shows:
   - Valid download token
   - Expiration time (typically 60 minutes)
   - Max download count (typically 5)

#### View API Documentation
The Admin panel includes live API documentation with:
- Endpoint URLs
- Request/response examples
- Status codes
- Authentication requirements

---

## 🔍 Monitoring & Debugging

### View Logs

**Backend Logs:**
```bash
# Real-time backend logs
cd /Users/QuinceNgomane/StatementFlex/src/StatementFlex/StatementFlex.API
dotnet run
# Logs will stream in the terminal
```

**Database Queries:**
```bash
# Connect to PostgreSQL
psql -h localhost -p 58344 -U myuser -d statementflex

# View customers
SELECT id, email, account_number FROM customers;

# View statements
SELECT id, statement_period, account_number, generated_date FROM statements;

# View download tokens
SELECT id, statement_id, token, expires_at, is_revoked FROM download_tokens;

# View download audit log
SELECT * FROM statement_download_logs ORDER BY created_at DESC LIMIT 20;
```

**MinIO Console:**
- Open http://localhost:9001 in browser
- Username: `minioadmin`
- Password: `minioadmin`
- Navigate to "statements" bucket to see uploaded PDFs

### Hangfire Dashboard

The backend includes Hangfire for background job monitoring:

- URL: http://localhost:5006/hangfire
- View all background jobs
- See job history and results
- Manually trigger jobs
- Monitor recurring jobs

**Key jobs to monitor:**
- `GenerateAndStoreStatements` - Monthly statement generation
- `ArchiveExpiredStatements` - Daily archive cleanup

### Browser Developer Tools

In the UI:

1. **Network Tab:**
   - Monitor all API requests
   - Check request/response bodies
   - Verify headers (Authorization, Content-Type)
   - Monitor response times

2. **Console Tab:**
   - Check for JavaScript errors
   - View Axios request logs
   - Custom debug messages

3. **Storage Tab:**
   - View JWT token in localStorage (key: `jwt_token`)
   - Verify token structure

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Error:**
```
Npgsql.NpgsqlException: Unable to connect to server
```

**Solutions:**
1. Verify Docker containers are running:
   ```bash
   docker ps | grep statementflex
   ```

2. Check PostgreSQL is healthy:
   ```bash
   docker logs statementflex-postgres
   ```

3. Verify connection string in `appsettings.json`:
   - Port should be `58344` (not `5432`)
   - Username: `myuser`
   - Password: `mypass`
   - Database: `statementflex`

4. Restart containers:
   ```bash
   docker-compose down
   docker-compose up
   ```

### Issue: "MinIO connection failed"

**Error:**
```
MinIO connection timeout or endpoint not reachable
```

**Solutions:**
1. Verify MinIO is running:
   ```bash
   docker ps | grep minio
   ```

2. Check MinIO console:
   - Open http://localhost:9001
   - Should see login screen

3. Verify MinIO configuration in `appsettings.json`:
   - Endpoint: `localhost:9002`
   - AccessKey: `minioadmin`
   - SecretKey: `minioadmin`

### Issue: "UI won't start - port 3000 already in use"

**Error:**
```
EADDRINUSE: address already in use :::3000
```

**Solutions:**
1. Kill process on port 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. Or use different port:
   ```bash
   npm run dev -- --port 3001
   ```

### Issue: "Login fails with 400 Bad Request"

**Error:**
```
{
  "errors": [
    {"errorMessage": "Invalid email format"}
  ]
}
```

**Solutions:**
1. Verify email format:
   - Must be valid email (e.g., user@example.com)
   - Cannot have spaces

2. Verify password meets requirements:
   - At least 8 characters
   - Must contain uppercase (A-Z)
   - Must contain lowercase (a-z)
   - Must contain number (0-9)
   - Must contain special character (!@#$%^&*)

3. Example valid password: `SecurePass123!`

### Issue: "No statements appear after login"

**Causes:**
1. No statements have been generated yet
2. Database migration failed

**Solutions:**
1. Check database has statements:
   ```bash
   psql -h localhost -p 58344 -U myuser -d statementflex \
     -c "SELECT COUNT(*) as statement_count FROM statements;"
   ```

2. If count is 0, generate test statements:
   ```bash
   # Option A: Trigger via Hangfire Dashboard
   # http://localhost:5006/hangfire
   
   # Option B: Load seed data
   psql -h localhost -p 58344 -U myuser -d statementflex -f seed_data.sql
   ```

3. Refresh UI (click "🔄 Refresh" button)

### Issue: "Download fails with 403 Forbidden"

**Causes:**
1. Token is revoked
2. IP address doesn't match (if IP validation enabled)
3. Token has been consumed (exceeded download limit)

**Solutions:**
1. Get a new token (click "🔐 Get Token" again)
2. Check download logs:
   ```bash
   psql -h localhost -p 58344 -U myuser -d statementflex \
     -c "SELECT * FROM statement_download_logs WHERE is_successful = false ORDER BY created_at DESC LIMIT 5;"
   ```

3. Verify IP validation is not enabled in configuration

### Issue: "CORS errors in browser console"

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:5006/api/...'
has been blocked by CORS policy
```

**Solutions:**
1. Verify proxy configuration in `vite.config.js`:
   ```javascript
   proxy: {
     '/api': {
       target: 'http://localhost:5006',
       changeOrigin: true
     }
   }
   ```

2. Verify backend CORS is enabled in `Program.cs`:
   ```csharp
   builder.Services.AddCors(options => {
     options.AddPolicy("AllowDevelopment", ...);
   });
   ```

3. Restart both frontend and backend

---

## 📊 Performance Testing

### Test Backend Performance

```bash
# Test statement list endpoint
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5006/api/statementflex/statement-list

# Results show:
# - Requests per second
# - Average response time
# - Throughput
```

### Test Download Performance

```bash
# Time a statement download
time curl -O \
  -H "Authorization: Bearer YOUR_DOWNLOAD_TOKEN" \
  http://localhost:5006/api/statementflex/download/YOUR_TOKEN
```

---

## 🧹 Cleanup

### Stop All Services

```bash
# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)

# Stop Docker containers
docker-compose down

# Full cleanup (remove volumes)
docker-compose down -v
```

### Reset Database

```bash
# Remove PostgreSQL volume and recreate
docker-compose down -v
docker-compose up postgres

# Migrations will run on next API start
```

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads on http://localhost:3000
- [ ] Can register new account
- [ ] Can login with registered account
- [ ] JWT token appears in browser storage
- [ ] Can view statement list
- [ ] Can request download token
- [ ] Can download statement PDF
- [ ] Download appears in audit log
- [ ] Rate limiting works (429 after 60 requests)
- [ ] Unauthorized access blocked (401)
- [ ] Token expiration works (410 after 1 hour)
- [ ] Admin panel shows valid API documentation

---

## 📞 Quick Reference

| Component | URL | Credentials |
|-----------|-----|-------------|
| Frontend UI | http://localhost:3000 | Use register form |
| Backend API | http://localhost:5006 | JWT token |
| Swagger Docs | http://localhost:5006/openapi-ui | None needed |
| Hangfire Dashboard | http://localhost:5006/hangfire | None needed |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| PostgreSQL | localhost:58344 | myuser / mypass |

---

## 🎓 Learning Resources

- [Clean Architecture in .NET](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/)
- [JWT Authentication](https://jwt.io/)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [MinIO Documentation](https://min.io/docs/)

